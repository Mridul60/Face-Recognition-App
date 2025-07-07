# REGISTER_FACE.PY - Cleaned version without logging or image storage
from dotenv import load_dotenv
import os
import sys
import mysql.connector
import json
import numpy as np
from deepface import DeepFace
import pickle
from PIL import Image

# Load environment variables from .env
dotenv_loaded = load_dotenv()
if not dotenv_loaded:
    print("Error: .env file not found or could not be loaded", file=sys.stderr)
    sys.exit(1)

# Get arguments
if len(sys.argv) < 3:
    print("Usage: python register_face.py <image_path> <user_id>", file=sys.stderr)
    sys.exit(1)

image_path = sys.argv[1]
user_id = sys.argv[2]

# Validate user_id is numeric
try:
    user_id_int = int(user_id)
except ValueError:
    print("Error: user_id must be a valid integer", file=sys.stderr)
    sys.exit(1)

def validate_image(image_path):
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")
    try:
        with Image.open(image_path) as img:
            img.verify()
        return True
    except Exception as e:
        raise ValueError(f"Invalid image file: {e}")

def extract_face_encoding(image_path):
    try:
        face_encodings = DeepFace.represent(
            img_path=image_path,
            model_name='Facenet512',
            detector_backend='retinaface',
            enforce_detection=True
        )

        if not face_encodings or len(face_encodings) == 0:
            raise ValueError("No face detected in the image.")

        face_encoding = np.array(face_encodings[0]["embedding"])

        if len(face_encoding) != 512:
            raise ValueError(f"Unexpected encoding dimension: {len(face_encoding)}")

        return face_encoding

    except Exception as e:
        if "Face could not be detected" in str(e):
            raise ValueError("No face detected in the image. Please ensure the image contains a clear face.")
        else:
            raise ValueError(f"Face encoding extraction failed: {str(e)}")

def store_face_data_binary(user_id_int, face_encoding_blob):
    conn = None
    cursor = None

    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASS"),
            database=os.getenv("DB_DATABASE"),
            autocommit=False
        )
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM employee WHERE id = %s", (user_id_int,))
        if not cursor.fetchone():
            raise ValueError(f"Employee with ID {user_id_int} not found in employee table")

        cursor.execute("SELECT id FROM face_data WHERE employeeID = %s", (user_id_int,))
        existing_record = cursor.fetchone()

        if existing_record:
            cursor.execute("""
                           UPDATE face_data
                           SET face_encoding = %s
                           WHERE employeeID = %s
                           """, (face_encoding_blob, user_id_int))
        else:
            cursor.execute("""
                           INSERT INTO face_data (employeeID, face_encoding)
                           VALUES (%s, %s)
                           """, (user_id_int, face_encoding_blob))

        conn.commit()

    except mysql.connector.Error as db_error:
        if conn:
            conn.rollback()
        raise Exception(f"Database error: {str(db_error)}")

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Main execution
try:
    validate_image(image_path)
    face_encoding = extract_face_encoding(image_path)

    # Use binary storage method (LONGBLOB)
    face_encoding_blob = pickle.dumps(face_encoding)
    store_face_data_binary(user_id_int, face_encoding_blob)

except Exception as e:
    print(f"ERROR: {str(e)}", file=sys.stderr)
    sys.exit(1)
