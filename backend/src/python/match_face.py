# # PYTHON - match_face.py with detailed timing
# from dotenv import load_dotenv
# import sys
# import json
# import mysql.connector
# import os
# import numpy as np
# from deepface import DeepFace
# import pickle
# import time
# from deepface import DeepFace
# # from deepface.basemodels import Facenet512  # optional
# # from deepface.commons import functions
#
# # Preload models globally
# print("MATCH_FACE: Preloading FaceNet model...")
# model_load_start = time.time()
# facenet_model = DeepFace.build_model("Facenet512")
# model_load_end = time.time()
# print(f"MATCH_FACE: Model preloaded in {(model_load_end - model_load_start):.3f}s")
#
# # Load environment variables from .env
# script_start_time = time.time()
# print(f"MATCH_FACE: Script started at {script_start_time}")
#
# dotenv_start_time = time.time()
# dotenv_loaded = load_dotenv()
# dotenv_end_time = time.time()
# print(f"MATCH_FACE: Environment loading took {(dotenv_end_time - dotenv_start_time):.3f}s")
#
# if not dotenv_loaded:
#     print("MATCH_FACE: Failed to load environment variables")
#     sys.exit(1)
#
# # Parse arguments
# args_start_time = time.time()
# image_path = sys.argv[1]
# employee_id = sys.argv[2]
# args_end_time = time.time()
# print(f"MATCH_FACE: Arguments parsed in {(args_end_time - args_start_time):.3f}s")
# print(f"MATCH_FACE: Image path: {image_path}")
# print(f"MATCH_FACE: Employee ID: {employee_id}")
#
# # Configuration
# MATCH_THRESHOLD = 0.25
# MAX_FACE_RECORDS_PER_USER = 20
#
# def store_face_encoding_to_db(employee_id, face_encoding, cursor, conn):
#     storage_start_time = time.time()
#     print(f"MATCH_FACE: Starting face encoding storage...")
#
#     try:
#         encoding_start_time = time.time()
#         face_encoding_blob = pickle.dumps(face_encoding)
#         encoding_end_time = time.time()
#         print(f"MATCH_FACE: Face encoding serialization took {(encoding_end_time - encoding_start_time):.3f}s")
#
#         db_start_time = time.time()
#         cursor.execute("""
#                        INSERT INTO face_data (employeeID, face_encoding, createdAt)
#                        VALUES (%s, %s, NOW())
#                        """, (employee_id, face_encoding_blob))
#         conn.commit()
#         db_end_time = time.time()
#         print(f"MATCH_FACE: Database insertion took {(db_end_time - db_start_time):.3f}s")
#
#         storage_end_time = time.time()
#         print(f"MATCH_FACE: Total storage completed in {(storage_end_time - storage_start_time):.3f}s")
#         return True
#
#     except mysql.connector.Error as db_error:
#         storage_end_time = time.time()
#         print(f"MATCH_FACE: Database storage failed after {(storage_end_time - storage_start_time):.3f}s")
#         conn.rollback()
#         print(json.dumps({"matched": False, "error": f"Database storage error: {str(db_error)}"}))
#         return False
#     except Exception as e:
#         storage_end_time = time.time()
#         print(f"MATCH_FACE: Storage error after {(storage_end_time - storage_start_time):.3f}s")
#         conn.rollback()
#         print(json.dumps({"matched": False, "error": f"Storage error: {str(e)}"}))
#         return False
#
# def get_recent_face_encodings(employee_id, cursor, limit=MAX_FACE_RECORDS_PER_USER):
#     query_start_time = time.time()
#     print(f"MATCH_FACE: Querying face encodings for employee {employee_id}...")
#
#     cursor.execute("""
#                    SELECT employeeID, face_encoding, createdAt
#                    FROM face_data
#                    WHERE employeeID = %s
#                    ORDER BY createdAt DESC
#                        LIMIT %s
#                    """, (employee_id, limit))
#
#     results = cursor.fetchall()
#     query_end_time = time.time()
#     print(f"MATCH_FACE: Database query completed in {(query_end_time - query_start_time):.3f}s")
#     print(f"MATCH_FACE: Retrieved {len(results)} face records")
#     return results
#
# # Database connection timing
# db_connect_start_time = time.time()
# print(f"MATCH_FACE: Connecting to database...")
#
# try:
#     conn = mysql.connector.connect(
#         host=os.getenv("DB_HOST"),
#         user=os.getenv("DB_USER"),
#         password=os.getenv("DB_PASS"),
#         database=os.getenv("DB_DATABASE"),
#         autocommit=False
#     )
#     cursor = conn.cursor()
#     db_connect_end_time = time.time()
#     print(f"MATCH_FACE: Database connection established in {(db_connect_end_time - db_connect_start_time):.3f}s")
# except Exception as e:
#     db_connect_end_time = time.time()
#     print(f"MATCH_FACE: Database connection failed after {(db_connect_end_time - db_connect_start_time):.3f}s")
#     print(json.dumps({"matched": False, "error": f"Database connection error: {str(e)}"}))
#     sys.exit(1)
#
# try:
#     spoofing_start_time = time.time()
#     print(f"MATCH_FACE: Starting anti-spoofing check...")
#
#     try:
#         faces = DeepFace.extract_faces(
#             img_path=image_path,
#             detector_backend='retinaface',
#             enforce_detection=True,
#             align=True,
#             anti_spoofing=True
#         )
#         spoofing_end_time = time.time()
#         print(f"MATCH_FACE: Anti-spoofing check completed in {(spoofing_end_time - spoofing_start_time):.3f}s")
#
#         if not faces or len(faces) == 0:
#             print("MATCH_FACE: No face detected in the image")
#             print(json.dumps({"matched": False, "error": "No face detected in the image"}))
#             sys.exit(1)
#
#         if len(faces) > 1:
#             print(f"MATCH_FACE: Multiple faces detected ({len(faces)} faces)")
#             print(json.dumps({
#                 "matched": False,
#                 "stored": False,
#                 "error": f"Multiple faces detected. Please ensure only one face is visible."
#             }))
#             sys.exit(1)
#
#         if not faces[0].get("is_real", False):
#             print("MATCH_FACE: Spoofing detected")
#             print(json.dumps({
#                 "matched": False,
#                 "stored": False,
#                 "error": "Please use a real face, not a photo or video"
#             }))
#             sys.exit(1)
#
#         print(f"MATCH_FACE: Face validation passed - {len(faces)} real face detected")
#
#     except Exception as spoof_error:
#         spoofing_end_time = time.time()
#         print(f"MATCH_FACE: Anti-spoofing failed after {(spoofing_end_time - spoofing_start_time):.3f}s")
#         print(f"MATCH_FACE: Spoofing error: {str(spoof_error)}")
#         print(json.dumps({
#             "matched": False,
#             "stored": False,
#             "error": f"Poor image quality or no face detected. Please try again."
#         }))
#         sys.exit(1)
#
#     encoding_start_time = time.time()
#     print(f"MATCH_FACE: Starting face encoding generation...")
#
#     face_encodings = DeepFace.represent(
#         img_path=image_path,
#         model_name='Facenet512',
#         detector_backend='retinaface',
#         enforce_detection=True
#     )
#
#     encoding_end_time = time.time()
#     print(f"MATCH_FACE: Face encoding generation completed in {(encoding_end_time - encoding_start_time):.3f}s")
#
#     if not face_encodings or len(face_encodings) == 0:
#         print("MATCH_FACE: No face detected during encoding")
#         print(json.dumps({"matched": False, "error": "No face detected in the image"}))
#         sys.exit(1)
#
#     captured_encoding = np.array(face_encodings[0]["embedding"])
#     print(f"MATCH_FACE: Generated encoding with {len(captured_encoding)} dimensions")
#
#     if len(captured_encoding) != 512:
#         print(f"MATCH_FACE: Unexpected encoding dimension: {len(captured_encoding)}")
#         print(json.dumps({"matched": False, "error": f"Unexpected encoding dimension: {len(captured_encoding)}"}))
#         sys.exit(1)
#
#     retrieval_start_time = time.time()
#     print(f"MATCH_FACE: Retrieving stored face encodings...")
#
#     face_records = get_recent_face_encodings(employee_id, cursor)
#     retrieval_end_time = time.time()
#     print(f"MATCH_FACE: Face records retrieval completed in {(retrieval_end_time - retrieval_start_time):.3f}s")
#
#     if not face_records:
#         print("MATCH_FACE: No face data found for employee")
#         print(json.dumps({
#             "matched": False,
#             "stored": False,
#             "error": "No face data found for this employee. Please register first."
#         }))
#         sys.exit(1)
#
#     matching_start_time = time.time()
#     print(f"MATCH_FACE: Starting face matching against {len(face_records)} stored encodings...")
#
#     matches_found = []
#     best_match = None
#     best_distance = float('inf')
#
#     for i, (employeeID, face_encoding_blob, created_at) in enumerate(face_records):
#         record_start_time = time.time()
#
#         try:
#             if isinstance(face_encoding_blob, bytes):
#                 stored_encoding = pickle.loads(face_encoding_blob)
#             else:
#                 try:
#                     stored_encoding = np.array([float(x) for x in face_encoding_blob.split(',')])
#                 except:
#                     stored_encoding = np.array(json.loads(face_encoding_blob))
#
#             stored_encoding = np.array(stored_encoding)
#
#             dot_product = np.dot(captured_encoding, stored_encoding)
#             norm_captured = np.linalg.norm(captured_encoding)
#             norm_stored = np.linalg.norm(stored_encoding)
#
#             if norm_captured == 0 or norm_stored == 0:
#                 continue
#
#             cosine_similarity = dot_product / (norm_captured * norm_stored)
#             cosine_distance = 1 - cosine_similarity
#
#             record_end_time = time.time()
#             print(f"MATCH_FACE: Record {i+1} processed in {(record_end_time - record_start_time):.3f}s - Distance: {cosine_distance:.4f}")
#
#             if cosine_distance < MATCH_THRESHOLD:
#                 matches_found.append({
#                     "user_id": employeeID,
#                     "distance": float(cosine_distance),
#                     "similarity": float(cosine_similarity),
#                     "created_at": str(created_at)
#                 })
#
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
#             record_end_time = time.time()
#             print(f"MATCH_FACE: Error processing record {i+1} after {(record_end_time - record_start_time):.3f}s: {str(e)}")
#             continue
#
#     matching_end_time = time.time()
#     print(f"MATCH_FACE: Face matching completed in {(matching_end_time - matching_start_time):.3f}s")
#     print(f"MATCH_FACE: Found {len(matches_found)} matches")
#
#     result_start_time = time.time()
#
#     if matches_found:
#         print(f"MATCH_FACE: Face matched! Best match distance: {best_distance:.4f}")
#
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
#
#         result_end_time = time.time()
#         print(f"MATCH_FACE: Result processing completed in {(result_end_time - result_start_time):.3f}s")
#         print(json.dumps(response))
#     else:
#         print("MATCH_FACE: No face matches found")
#
#         response = {
#             "matched": False,
#             "stored": False,
#             "records_checked": len(face_records),
#             "message": "Face does not match any stored encodings. Not storing unmatched face."
#         }
#
#         result_end_time = time.time()
#         print(f"MATCH_FACE: Result processing completed in {(result_end_time - result_start_time):.3f}s")
#         print(json.dumps(response))
#
# except Exception as e:
#     error_time = time.time()
#     print(f"MATCH_FACE: Critical error after {(error_time - script_start_time):.3f}s")
#     print(f"MATCH_FACE: Error details: {str(e)}")
#     conn.rollback()
#     print(json.dumps({"matched": False, "stored": False, "error": str(e)}))
#
# finally:
#     cleanup_start_time = time.time()
#     cursor.close()
#     conn.close()
#     cleanup_end_time = time.time()
#     print(f"MATCH_FACE: Cleanup completed in {(cleanup_end_time - cleanup_start_time):.3f}s")
#
#     script_end_time = time.time()
#     total_time = script_end_time - script_start_time
#     print(f"MATCH_FACE: Total script execution time: {total_time:.3f}s")
#     print("=" * 50)


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