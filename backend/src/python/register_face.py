# OPTIMIZED REGISTER_FACE.PY
from dotenv import load_dotenv
import os
import sys
import mysql.connector
import json
import numpy as np
from deepface import DeepFace
import pickle
from PIL import Image
import cv2
import tempfile
from datetime import datetime

def log_with_time(message):
    timestamp = datetime.now().strftime('%H:%M:%S.%f')[:-3]
    print(f"[{timestamp}] {message}", file=sys.stderr, flush=True)

# Load environment variables from .env
log_with_time("Register face Script started")
dotenv_loaded = load_dotenv()
# if not dotenv_loaded:
#     print("Error: .env file not found or could not be loaded", file=sys.stderr)
#     sys.exit(1)

# Get arguments
# if len(sys.argv) < 3:
#     print("Usage: python register_face.py <image_path> <user_id>", file=sys.stderr)
#     sys.exit(1)

image_path = sys.argv[1]
user_id = sys.argv[2]

# Validate user_id is numeric
try:
    user_id_int = int(user_id)
except ValueError:
    print("Error: user_id must be a valid integer", file=sys.stderr)
    sys.exit(1)

# Optimization 1: Image preprocessing function
def preprocess_image(image_path, target_size=(640, 640)):
    """Resize image to reduce processing time while maintaining quality"""
    try:
        img = cv2.imread(image_path)
        if img is None:
            return image_path  # Return original if can't load

        # Resize if image is too large
        height, width = img.shape[:2]
        if height > target_size[0] or width > target_size[1]:
            log_with_time(f"Resizing image from {width}x{height} to optimize processing")
            # Calculate scaling factor to maintain aspect ratio
            scale = min(target_size[0]/height, target_size[1]/width)
            new_width = int(width * scale)
            new_height = int(height * scale)
            img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_AREA)

            # Save resized image to temporary file
            temp_fd, temp_path = tempfile.mkstemp(suffix='.jpg')
            os.close(temp_fd)  # Close file descriptor
            cv2.imwrite(temp_path, img)
            log_with_time(f"Image resized and saved to temporary file")
            return temp_path

        return image_path
    except Exception as e:
        log_with_time(f"Error preprocessing image: {str(e)}")
        return image_path

# Optimization 2: Quick face detection check
def quick_face_check(image_path):
    """Quick face detection using opencv to pre-filter images"""
    try:
        faces = DeepFace.extract_faces(
            img_path=image_path,
            detector_backend='opencv',  # Fastest detector
            enforce_detection=False,
            align=False,
            anti_spoofing=False
        )
        face_count = len(faces) if faces else 0
        log_with_time(f"Quick face check detected {face_count} faces")
        return face_count == 1  # Return True if exactly one face
    except Exception as e:
        log_with_time(f"Quick face check failed: {str(e)}")
        return False  # Proceed with full processing if quick check fails

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
    temp_image_path = None
    try:
        # Optimization 3: Preprocess image first
        log_with_time("start image preprocessing")
        processed_image_path = preprocess_image(image_path)
        if processed_image_path != image_path:
            temp_image_path = processed_image_path  # Track for cleanup
        log_with_time("end image preprocessing")

        # Optimization 4: Quick face detection check
        log_with_time("start quick face detection check")
        if not quick_face_check(processed_image_path):
            log_with_time("Quick face check failed - proceeding with full processing")
        else:
            log_with_time("Quick face check passed - single face detected")
        log_with_time("end quick face detection check")

        # Use optimized detector backend (mtcnn for better speed/accuracy balance)
        detector_backend = 'mtcnn'

        # Anti-spoofing check
        log_with_time(f"start deepface.extract_faces({detector_backend}, antispoofing=true)")
        faces = DeepFace.extract_faces(
            img_path=processed_image_path,
            detector_backend=detector_backend,
            enforce_detection=True,
            align=True,
            anti_spoofing=True
        )
        log_with_time(f"end deepface.extract_faces({detector_backend}, antispoofing=true)")

        # Check if faces were detected
        if not faces or len(faces) == 0:
            raise ValueError("No face detected in the image")

        # Reject image if more than one face is detected
        if len(faces) > 1:
            raise ValueError("Multiple faces detected. Please ensure only one face is visible.")

        # Check if the face is real (not spoofed)
        if not faces[0].get("is_real", False):
            raise ValueError("Please use a real face, not a photo or video")

        # Generate face encoding using same detector
        log_with_time(f"Start face encoding generation using Facenet, {detector_backend}")
        face_encodings = DeepFace.represent(
            img_path=processed_image_path,
            model_name='Facenet',
            detector_backend=detector_backend,
            enforce_detection=True
        )
        log_with_time(f"end face encoding generation using Facenet, {detector_backend}")

        if not face_encodings or len(face_encodings) == 0:
            raise ValueError("No face detected in the image.")

        face_encoding = np.array(face_encodings[0]["embedding"])

        if len(face_encoding) != 128:
            raise ValueError(f"Unexpected encoding dimension: {len(face_encoding)}")

        return face_encoding

    except Exception as e:
        if "Face could not be detected" in str(e):
            raise ValueError("No face detected in the image. Please ensure the image contains a clear face.")
        else:
            raise ValueError(f"Face encoding extraction failed: {str(e)}")
    finally:
        # Cleanup temporary file if created
        if temp_image_path and os.path.exists(temp_image_path):
            try:
                os.remove(temp_image_path)
                log_with_time("Temporary image file cleaned up")
            except Exception as e:
                log_with_time(f"Error cleaning up temporary file: {str(e)}")

def store_face_data_binary(user_id_int, face_encoding_blob):
    conn = None
    cursor = None

    try:
        log_with_time("start database connection")
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASS"),
            database=os.getenv("DB_DATABASE"),
            autocommit=False
        )
        cursor = conn.cursor()
        log_with_time("end database connection")

        # Check if employee exists
        cursor.execute("SELECT id FROM employee WHERE id = %s", (user_id_int,))
        if not cursor.fetchone():
            raise ValueError(f"Employee with ID {user_id_int} not found in employee table")

        # Check if face data already exists
        cursor.execute("SELECT id FROM face_data WHERE employeeID = %s", (user_id_int,))
        existing_record = cursor.fetchone()

        if existing_record:
            log_with_time("Updating existing face data")
            cursor.execute("""
                           UPDATE face_data
                           SET face_encoding = %s, createdAt = NOW()
                           WHERE employeeID = %s
                           """, (face_encoding_blob, user_id_int))
        else:
            log_with_time("Inserting new face data")
            cursor.execute("""
                           INSERT INTO face_data (employeeID, face_encoding, createdAt)
                           VALUES (%s, %s, NOW())
                           """, (user_id_int, face_encoding_blob))

        conn.commit()
        log_with_time("Face data stored successfully")

    except mysql.connector.Error as db_error:
        if conn:
            conn.rollback()
        raise Exception(f"Database error: {str(db_error)}")

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        log_with_time("Database connection closed")

# Main execution
try:
    # validate_image(image_path)
    face_encoding = extract_face_encoding(image_path)

    # Use binary storage method (LONGBLOB)
    face_encoding_blob = pickle.dumps(face_encoding)
    store_face_data_binary(user_id_int, face_encoding_blob)

    log_with_time("Registration completed successfully")
    print(json.dumps({"success": True, "message": "Face registered successfully"}))

except Exception as e:
    log_with_time(f"Registration failed: {str(e)}")
    print(json.dumps({"success": False, "error": str(e)}))
    sys.exit(1)