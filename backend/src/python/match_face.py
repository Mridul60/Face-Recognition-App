# MATCH_FACE.PY - Updated to store face encodings only on successful match with performance optimization
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

# Configuration
MATCH_THRESHOLD = 0.25
MAX_FACE_RECORDS_PER_USER = 20  # Limit face records per user for performance

def store_face_encoding_to_db(employee_id, face_encoding, cursor, conn):
    """Store face encoding as a new row in face_data table"""
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
    """Get most recent face encodings for performance optimization (only for matching)"""
    cursor.execute("""
                   SELECT employeeID, face_encoding, createdAt
                   FROM face_data
                   WHERE employeeID = %s
                   ORDER BY createdAt DESC
                       LIMIT %s
                   """, (employee_id, limit))

    return cursor.fetchall()

conn = mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASS"),
    database=os.getenv("DB_DATABASE"),
    autocommit=False
)
cursor = conn.cursor()

try:
    # Anti-spoofing check - First extract faces with spoofing detection
    try:
        faces = DeepFace.extract_faces(
            img_path=image_path,
            detector_backend='retinaface',
            enforce_detection=True,
            align=True,
            anti_spoofing=True
        )

        # Check if faces were detected
        if not faces or len(faces) == 0:
            print(json.dumps({"matched": False, "error": "No face detected in the image"}))
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
        # anti-spoofing fails
        print(json.dumps({
            "matched": False,
            "stored": False,
            "error": f"Poor image quality or no face detected. Please try again."
        }))
        sys.exit(1)

    # Generate encoding for the captured image (after spoofing check passes)
    face_encodings = DeepFace.represent(
        img_path=image_path,
        model_name='Facenet512',
        detector_backend='retinaface',
        enforce_detection=True
    )

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

    matches_found = []
    best_match = None
    best_distance = float('inf')

    for employeeID, face_encoding_blob, created_at in face_records:
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
                continue  # Skip if either encoding is zero vector

            cosine_similarity = dot_product / (norm_captured * norm_stored)
            cosine_distance = 1 - cosine_similarity

            if cosine_distance < MATCH_THRESHOLD:
                matches_found.append({
                    "user_id": employeeID,
                    "distance": float(cosine_distance),
                    "similarity": float(cosine_similarity),
                    "created_at": str(created_at)
                })

                # Track best match
                if cosine_distance < best_distance:
                    best_distance = cosine_distance
                    best_match = {
                        "user_id": employeeID,
                        "distance": float(cosine_distance),
                        "similarity": float(cosine_similarity),
                        "created_at": str(created_at)
                    }

        except Exception as e:
            # Skip this record if there's an error processing the stored encoding
            continue

    # ONLY STORE IF FACE MATCHES
    if matches_found:
        # Store the captured face encoding since it's a successful match
        storage_success = store_face_encoding_to_db(employee_id, captured_encoding, cursor, conn)

        response = {
            "matched": True,
            "stored": storage_success,
            "best_match": best_match,
            "all_matches": matches_found,
            "total_matches": len(matches_found),
            "records_checked": len(face_records),
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


# # MATCH_FACE.PY - Updated to store face encodings only on successful match with performance optimization
# from dotenv import load_dotenv
# import sys
# import json
# import mysql.connector
# import os
# import numpy as np
# from deepface import DeepFace
# import pickle
#
# # Load environment variables from .env
# dotenv_loaded = load_dotenv()
# if not dotenv_loaded:
#     sys.exit(1)
#
# image_path = sys.argv[1]
# employee_id = sys.argv[2]
#
# # Configuration
# MATCH_THRESHOLD = 0.4
# MAX_FACE_RECORDS_PER_USER = 20  # Limit face records per user for performance
#
# def store_face_encoding_to_db(employee_id, face_encoding, cursor, conn):
#     """Store face encoding as a new row in face_data table"""
#     try:
#         # Convert face encoding to binary format for LONGBLOB storage
#         face_encoding_blob = pickle.dumps(face_encoding)
#
#         # Insert new row with face encoding (keep all data, don't delete)
#         cursor.execute("""
#                        INSERT INTO face_data (employeeID, face_encoding, createdAt)
#                        VALUES (%s, %s, NOW())
#                        """, (employee_id, face_encoding_blob))
#
#         conn.commit()
#         return True
#     except mysql.connector.Error as db_error:
#         conn.rollback()
#         print(json.dumps({"matched": False, "error": f"Database storage error: {str(db_error)}"}))
#         return False
#     except Exception as e:
#         conn.rollback()
#         print(json.dumps({"matched": False, "error": f"Storage error: {str(e)}"}))
#         return False
#
# def get_recent_face_encodings(employee_id, cursor, limit=MAX_FACE_RECORDS_PER_USER):
#     """Get most recent face encodings for performance optimization (only for matching)"""
#     cursor.execute("""
#                    SELECT employeeID, face_encoding, createdAt
#                    FROM face_data
#                    WHERE employeeID = %s
#                    ORDER BY createdAt DESC
#                        LIMIT %s
#                    """, (employee_id, limit))
#
#     return cursor.fetchall()
#
# conn = mysql.connector.connect(
#     host=os.getenv("DB_HOST"),
#     user=os.getenv("DB_USER"),
#     password=os.getenv("DB_PASS"),
#     database=os.getenv("DB_DATABASE"),
#     autocommit=False
# )
# cursor = conn.cursor()
#
# try:
#     # Anti-spoofing check (commented out but available)
#     # faces = DeepFace.extract_faces(
#     #     img_path=image_path,
#     #     detector_backend='retinaface',
#     #     enforce_detection=True,
#     #     align=True,
#     #     anti_spoofing=True
#     # )
#     # if not faces or not faces[0].get("is_real", False):
#     #     print(json.dumps({"matched": False, "error": "Spoofing detected"}))
#     #     sys.exit(1)
#
#     # Generate encoding for the captured image
#     face_encodings = DeepFace.represent(
#         img_path=image_path,
#         model_name='Facenet512',
#         detector_backend='retinaface',
#         enforce_detection=True
#     )
#
#     if not face_encodings or len(face_encodings) == 0:
#         print(json.dumps({"matched": False, "error": "No face detected in the image"}))
#         sys.exit(1)
#
#     captured_encoding = np.array(face_encodings[0]["embedding"])
#
#     # Validate encoding dimension
#     if len(captured_encoding) != 512:
#         print(json.dumps({"matched": False, "error": f"Unexpected encoding dimension: {len(captured_encoding)}"}))
#         sys.exit(1)
#
#     # FIRST MATCH WITH THE DATABASE - Get most recent 20 face encodings for this employee
#     face_records = get_recent_face_encodings(employee_id, cursor)
#
#     if not face_records:
#         print(json.dumps({
#             "matched": False,
#             "stored": False,
#             "error": "No face data found for this employee. Please register first."
#         }))
#         sys.exit(1)
#
#     matches_found = []
#     best_match = None
#     best_distance = float('inf')
#
#     for employeeID, face_encoding_blob, created_at in face_records:
#         try:
#             # Deserialize the stored encoding (should be pickled binary data)
#             if isinstance(face_encoding_blob, bytes):
#                 stored_encoding = pickle.loads(face_encoding_blob)
#             else:
#                 # Fallback for string format (if migrating from old system)
#                 try:
#                     stored_encoding = np.array([float(x) for x in face_encoding_blob.split(',')])
#                 except:
#                     stored_encoding = np.array(json.loads(face_encoding_blob))
#
#             stored_encoding = np.array(stored_encoding)
#
#             # Calculate cosine similarity/distance
#             dot_product = np.dot(captured_encoding, stored_encoding)
#             norm_captured = np.linalg.norm(captured_encoding)
#             norm_stored = np.linalg.norm(stored_encoding)
#
#             if norm_captured == 0 or norm_stored == 0:
#                 continue  # Skip if either encoding is zero vector
#
#             cosine_similarity = dot_product / (norm_captured * norm_stored)
#             cosine_distance = 1 - cosine_similarity
#
#             if cosine_distance < MATCH_THRESHOLD:
#                 matches_found.append({
#                     "user_id": employeeID,
#                     "distance": float(cosine_distance),
#                     "similarity": float(cosine_similarity),
#                     "created_at": str(created_at)
#                 })
#
#                 # Track best match
#                 if cosine_distance < best_distance:
#                     best_distance = cosine_distance
#                     best_match = {
#                         "user_id": employeeID,
#                         "distance": float(cosine_distance),
#                         "similarity": float(cosine_similarity),
#                         "created_at": str(created_at)
#                     }
#
#         except Exception as e:
#             # Skip this record if there's an error processing the stored encoding
#             continue
#
#     # ONLY STORE IF FACE MATCHES
#     if matches_found:
#         # Store the captured face encoding since it's a successful match
#         storage_success = store_face_encoding_to_db(employee_id, captured_encoding, cursor, conn)
#
#         response = {
#             "matched": True,
#             "stored": storage_success,
#             "best_match": best_match,
#             "all_matches": matches_found,
#             "total_matches": len(matches_found),
#             "records_checked": len(face_records),
#             "message": "Face matched and encoding stored successfully" if storage_success else "Face matched but storage failed"
#         }
#         print(json.dumps(response))
#     else:
#         # DO NOT STORE if no match found
#         response = {
#             "matched": False,
#             "stored": False,
#             "records_checked": len(face_records),
#             "message": "Face does not match any stored encodings. Not storing unmatched face."
#         }
#         print(json.dumps(response))
#
# except Exception as e:
#     conn.rollback()
#     print(json.dumps({"matched": False, "stored": False, "error": str(e)}))
#
# finally:
#     cursor.close()
#     conn.close()