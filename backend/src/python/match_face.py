# MATCH_FACE.PY
from dotenv import load_dotenv
import sys
import json
import mysql.connector
import os
import numpy as np
from deepface import DeepFace
import pickle
from datetime import datetime
import cv2
import tempfile

def log_with_time(message):
    timestamp = datetime.now().strftime('%H:%M:%S.%f')[:-3]
    print(f"[{timestamp}] {message}", file=sys.stderr, flush=True)

# Load environment variables from .env
log_with_time("Match face Script started")
dotenv_loaded = load_dotenv()
if not dotenv_loaded:
    sys.exit(1)

# Get command line arguments
image_path = sys.argv[1]
employee_id = sys.argv[2]

# Configuration
MATCH_THRESHOLD = 0.25
MAX_FACE_RECORDS_PER_USER = 20  # Limit face records per user for performance

# Optimization 1: Image preprocessing function
def preprocess_image(image_path, target_size=(640, 640)):
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

def store_face_encoding_to_db(employee_id, face_encoding, cursor, conn):
    try:
        # Convert face encoding to binary format for LONGBLOB storage
        face_encoding_blob = pickle.dumps(face_encoding)

        # Insert new row with face encoding (keep all data, don't delete)
        cursor.execute("""
                       INSERT INTO face_data (employeeID, face_encoding, createdAt)
                       VALUES (%s, %s, NOW())
                       """, (employee_id, face_encoding_blob))

        conn.commit()
        return True
    except mysql.connector.Error as db_error:
        conn.rollback()
        print(json.dumps({"matched": False, "error": f"Database storage error: {str(db_error)}"}))
        return False
    except Exception as e:
        conn.rollback()
        print(json.dumps({"matched": False, "error": f"Storage error: {str(e)}"}))
        return False

def get_recent_face_encodings(employee_id, cursor, limit=MAX_FACE_RECORDS_PER_USER):
    cursor.execute("""
                   SELECT employeeID, face_encoding, createdAt
                   FROM face_data
                   WHERE employeeID = %s
                   ORDER BY createdAt DESC
                       LIMIT %s
                   """, (employee_id, limit))
    results = cursor.fetchall()
    return results

# Database connection
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

try:
    log_with_time("start image preprocessing")
    processed_image_path = preprocess_image(image_path)
    if processed_image_path != image_path:
        temp_image_path = processed_image_path  # Track for cleanup
    log_with_time("end image preprocessing")

    try:
        log_with_time("start deepface.extract_faces(retinaface, antispoofing=true)")
        faces = DeepFace.extract_faces(
            img_path=processed_image_path,
            detector_backend='retinaface',
            enforce_detection=True,
            align=True,
            anti_spoofing=True
        )
        log_with_time(f"end deepface.extract_faces(retinaface, antispoofing=true)")

        # Check if faces were detected
        if not faces or len(faces) == 0:
            print(json.dumps({"matched": False, "error": "No face detected in the image"}))
            sys.exit(1)

        # Reject image if more than one face is detected
        if len(faces) > 1:
            print(json.dumps({
                "matched": False,
                "stored": False,
                "error": f"Multiple faces detected. Please ensure only one face is visible."
            }))
            sys.exit(1)

        # Check if the face is real (not spoofed)
        if not faces[0].get("is_real", False):
            print(json.dumps({
                "matched": False,
                "stored": False,
                "error": "Please use a real face, not a photo or video"
            }))
            sys.exit(1)

    except Exception as spoof_error:
        print(json.dumps({
            "matched": False,
            "stored": False,
            "error": f"Poor image quality or no face detected. Please try again."
        }))
        sys.exit(1)

    # Generate encoding for the captured image (after spoofing check passes)
    log_with_time("Start face encoding generation using Facenet512, retinaface")
    face_encodings = DeepFace.represent(
        img_path=processed_image_path,
        model_name='Facenet512',
        detector_backend='retinaface',
        enforce_detection=True
    )
    log_with_time("end face encoding generation using Facenet512, retinaface")

    if not face_encodings or len(face_encodings) == 0:
        print(json.dumps({"matched": False, "error": "No face detected in the image"}))
        sys.exit(1)

    captured_encoding = np.array(face_encodings[0]["embedding"])

    # Validate encoding dimension
    if len(captured_encoding) != 512:
        print(json.dumps({"matched": False, "error": f"Unexpected encoding dimension: {len(captured_encoding)}"}))
        sys.exit(1)

    # FIRST MATCH WITH THE DATABASE - Get most recent 20 face encodings for this employee
    face_records = get_recent_face_encodings(employee_id, cursor)

    if not face_records:
        print(json.dumps({
            "matched": False,
            "stored": False,
            "error": "No face data found for this employee. Please register first."
        }))
        sys.exit(1)

    # log_with_time(f"Starting face comparison with {len(face_records)} stored encodings")
    matches_found = []
    best_match = None
    best_distance = float('inf')

    for i, (employeeID, face_encoding_blob, created_at) in enumerate(face_records):
        # log_with_time(f"Processing stored encoding {i+1}/{len(face_records)}")
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

            if norm_captured == 0 or norm_stored == 0:
                # log_with_time(f"Skipping encoding {i+1} - zero vector detected")
                continue  # Skip if either encoding is zero vector

            cosine_similarity = dot_product / (norm_captured * norm_stored)
            cosine_distance = 1 - cosine_similarity

            # log_with_time(f"Encoding {i+1} - Distance: {cosine_distance:.6f}, Similarity: {cosine_similarity:.6f}")

            if cosine_distance < MATCH_THRESHOLD:
                match_info = {
                    "user_id": employeeID,
                    "distance": float(cosine_distance),
                    "similarity": float(cosine_similarity),
                    "created_at": str(created_at)
                }
                matches_found.append(match_info)
                # log_with_time(f"MATCH FOUND - Encoding {i+1} with distance {cosine_distance:.6f}")

                # Track best match
                if cosine_distance < best_distance:
                    best_distance = cosine_distance
                    best_match = match_info
                    # log_with_time(f"New best match found - Distance: {cosine_distance:.6f}")

        except Exception as e:
            # log_with_time(f"Error processing encoding {i+1}: {str(e)}")
            continue

    # log_with_time(f"Face matching completed - Found {len(matches_found)} matches")

    # ONLY STORE IF FACE MATCHES
    if matches_found:
        # log_with_time("Face match found - Proceeding to store encoding")
        # Store the captured face encoding since it's a successful match
        storage_success = store_face_encoding_to_db(employee_id, captured_encoding, cursor, conn)

        response = {
            "matched": True,
            "stored": storage_success,
            # "best_match": best_match,
            # "all_matches": matches_found,
            # "total_matches": len(matches_found),
            # "records_checked": len(face_records),
            "message": "Face matched and encoding stored successfully" if storage_success else "Face matched but storage failed"
        }
        print(json.dumps(response))
    else:
        # DO NOT STORE if no match found
        response = {
            "matched": False,
            "stored": False,
            "records_checked": len(face_records),
            "message": "Face does not match any stored encodings. Not storing unmatched face."
        }
        print(json.dumps(response))

except Exception as e:
    conn.rollback()
    print(json.dumps({"matched": False, "stored": False, "error": str(e)}))

finally:
    cursor.close()
    conn.close()
    log_with_time("Script execution completed")