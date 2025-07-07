# MATCH_FACE.PY - Updated for better compatibility
from dotenv import load_dotenv
import sys
import json
import mysql.connector
import os
import numpy as np
from deepface import DeepFace
import pickle

# Load environment variables from .env
dotenv_loaded = load_dotenv()
if not dotenv_loaded:
    sys.exit(1)

image_path = sys.argv[1]
employee_id = sys.argv[2]

conn = mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASS"),
    database=os.getenv("DB_DATABASE")
)
cursor = conn.cursor()

try:
    # Generate encoding for the captured image
    captured_encoding = DeepFace.represent(
        img_path=image_path,
        model_name='Facenet512',
        detector_backend='retinaface'
    )[0]["embedding"]

    # Convert to numpy array for easier manipulation
    captured_encoding = np.array(captured_encoding)

    # MATCH WITH THE DATABASE
    cursor.execute("SELECT employeeID, face_encoding FROM face_data WHERE employeeID = %s", (employee_id,))

    for employeeID, face_encoding_blob in cursor.fetchall():
        try:
            # Deserialize the stored encoding (should be pickled binary data)
            if isinstance(face_encoding_blob, bytes):
                stored_encoding = pickle.loads(face_encoding_blob)
            else:
                # Fallback for string format (if migrating from old system)
                try:
                    stored_encoding = np.array([float(x) for x in face_encoding_blob.split(',')])
                except:
                    stored_encoding = np.array(json.loads(face_encoding_blob))

            stored_encoding = np.array(stored_encoding)

            # Calculate cosine similarity/distance
            dot_product = np.dot(captured_encoding, stored_encoding)
            norm_captured = np.linalg.norm(captured_encoding)
            norm_stored = np.linalg.norm(stored_encoding)

            cosine_similarity = dot_product / (norm_captured * norm_stored)
            cosine_distance = 1 - cosine_similarity

            # Threshold for matching (adjust as needed)
            threshold = 0.4

            if cosine_distance < threshold:
                print(json.dumps({"matched": True, "user_id": employeeID, "distance": float(cosine_distance)}))
                sys.exit()

        except Exception as e:
            # Skip this record if there's an error processing the stored encoding
            continue

    print(json.dumps({"matched": False}))

except Exception as e:
    print(json.dumps({"matched": False, "error": str(e)}))

finally:
    cursor.close()
    conn.close()