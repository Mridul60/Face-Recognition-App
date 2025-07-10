# # REGISTER_FACE.PY - With comprehensive timing measurements
# from dotenv import load_dotenv
# import os
# import sys
# import mysql.connector
# import json
# import numpy as np
# from deepface import DeepFace
# import pickle
# from PIL import Image
# import time
#
# # Start total timing
# script_start_time = time.time()
#
# def log_timing(operation, duration_ms, details=""):
#     """Log timing information with consistent formatting"""
#     print(f"PYTHON: {operation} completed in {duration_ms:.2f}ms {details}")
#
# # Load environment variables timing
# env_start_time = time.time()
# dotenv_loaded = load_dotenv()
# env_duration = (time.time() - env_start_time) * 1000
# log_timing("Environment loading", env_duration)
#
# if not dotenv_loaded:
#     print("Error: .env file not found or could not be loaded", file=sys.stderr)
#     sys.exit(1)
#
# # Arguments validation timing
# args_start_time = time.time()
# if len(sys.argv) < 3:
#     print("Usage: python register_face.py <image_path> <user_id>", file=sys.stderr)
#     sys.exit(1)
#
# image_path = sys.argv[1]
# user_id = sys.argv[2]
#
# # Validate user_id is numeric
# try:
#     user_id_int = int(user_id)
# except ValueError:
#     print("Error: user_id must be a valid integer", file=sys.stderr)
#     sys.exit(1)
#
# args_duration = (time.time() - args_start_time) * 1000
# log_timing("Arguments validation", args_duration)
#
# def validate_image(image_path):
#     validation_start_time = time.time()
#
#     if not os.path.exists(image_path):
#         raise FileNotFoundError(f"Image file not found: {image_path}")
#
#     file_check_time = time.time()
#     file_check_duration = (file_check_time - validation_start_time) * 1000
#     log_timing("File existence check", file_check_duration)
#
#     try:
#         with Image.open(image_path) as img:
#             img.verify()
#
#         image_verify_duration = (time.time() - file_check_time) * 1000
#         log_timing("Image verification", image_verify_duration)
#
#         total_validation_duration = (time.time() - validation_start_time) * 1000
#         log_timing("Total image validation", total_validation_duration)
#
#         return True
#     except Exception as e:
#         raise ValueError(f"Invalid image file: {e}")
#
# def extract_face_encoding(image_path):
#     extraction_start_time = time.time()
#     log_timing("Face encoding extraction", 0, "- STARTING")
#
#     try:
#         # DeepFace processing timing
#         deepface_start_time = time.time()
#         face_encodings = DeepFace.represent(
#             img_path=image_path,
#             model_name='Facenet512',
#             detector_backend='retinaface',
#             enforce_detection=True
#         )
#         deepface_duration = (time.time() - deepface_start_time) * 1000
#         log_timing("DeepFace.represent (MODEL INFERENCE)", deepface_duration, " MAIN BOTTLENECK")
#
#         # Face validation timing
#         validation_start_time = time.time()
#         if not face_encodings or len(face_encodings) == 0:
#             raise ValueError("No face detected in the image.")
#
#         face_encoding = np.array(face_encodings[0]["embedding"])
#
#         if len(face_encoding) != 512:
#             raise ValueError(f"Unexpected encoding dimension: {len(face_encoding)}")
#
#         validation_duration = (time.time() - validation_start_time) * 1000
#         log_timing("Face encoding validation", validation_duration)
#
#         total_extraction_duration = (time.time() - extraction_start_time) * 1000
#         log_timing("Total face encoding extraction", total_extraction_duration)
#
#         return face_encoding
#
#     except Exception as e:
#         if "Face could not be detected" in str(e):
#             raise ValueError("No face detected in the image. Please ensure the image contains a clear face.")
#         else:
#             raise ValueError(f"Face encoding extraction failed: {str(e)}")
#
# def store_face_data_binary(user_id_int, face_encoding_blob):
#     storage_start_time = time.time()
#     log_timing("Database storage", 0, "- STARTING")
#
#     conn = None
#     cursor = None
#
#     try:
#         # Database connection timing
#         conn_start_time = time.time()
#         conn = mysql.connector.connect(
#             host=os.getenv("DB_HOST"),
#             user=os.getenv("DB_USER"),
#             password=os.getenv("DB_PASS"),
#             database=os.getenv("DB_DATABASE"),
#             autocommit=False
#         )
#         cursor = conn.cursor()
#         conn_duration = (time.time() - conn_start_time) * 1000
#         log_timing("Database connection", conn_duration)
#
#         # Employee validation timing
#         employee_check_start_time = time.time()
#         cursor.execute("SELECT id FROM employee WHERE id = %s", (user_id_int,))
#         if not cursor.fetchone():
#             raise ValueError(f"Employee with ID {user_id_int} not found in employee table")
#         employee_check_duration = (time.time() - employee_check_start_time) * 1000
#         log_timing("Employee existence check", employee_check_duration)
#
#         # Existing record check timing
#         existing_check_start_time = time.time()
#         cursor.execute("SELECT id FROM face_data WHERE employeeID = %s", (user_id_int,))
#         existing_record = cursor.fetchone()
#         existing_check_duration = (time.time() - existing_check_start_time) * 1000
#         log_timing("Existing record check", existing_check_duration)
#
#         # Database operation timing
#         db_op_start_time = time.time()
#         if existing_record:
#             cursor.execute("""
#                            UPDATE face_data
#                            SET face_encoding = %s
#                            WHERE employeeID = %s
#                            """, (face_encoding_blob, user_id_int))
#             log_timing("Database UPDATE operation", (time.time() - db_op_start_time) * 1000)
#         else:
#             cursor.execute("""
#                            INSERT INTO face_data (employeeID, face_encoding)
#                            VALUES (%s, %s)
#                            """, (user_id_int, face_encoding_blob))
#             log_timing("Database INSERT operation", (time.time() - db_op_start_time) * 1000)
#
#         # Commit timing
#         commit_start_time = time.time()
#         conn.commit()
#         commit_duration = (time.time() - commit_start_time) * 1000
#         log_timing("Database commit", commit_duration)
#
#         total_storage_duration = (time.time() - storage_start_time) * 1000
#         log_timing("Total database storage", total_storage_duration)
#
#     except mysql.connector.Error as db_error:
#         if conn:
#             conn.rollback()
#         raise Exception(f"Database error: {str(db_error)}")
#
#     finally:
#         cleanup_start_time = time.time()
#         if cursor:
#             cursor.close()
#         if conn:
#             conn.close()
#         cleanup_duration = (time.time() - cleanup_start_time) * 1000
#         log_timing("Database cleanup", cleanup_duration)
#
# # Main execution with timing
# try:
#     # Image validation timing
#     print("PYTHON: Starting face registration process...")
#     validate_image(image_path)
#
#     # Face encoding extraction timing
#     face_encoding = extract_face_encoding(image_path)
#
#     # Serialization timing
#     serialization_start_time = time.time()
#     face_encoding_blob = pickle.dumps(face_encoding)
#     serialization_duration = (time.time() - serialization_start_time) * 1000
#     log_timing("Face encoding serialization", serialization_duration, f"- Size: {len(face_encoding_blob)} bytes")
#
#     # Database storage timing
#     store_face_data_binary(user_id_int, face_encoding_blob)
#
#     # Total script timing
#     total_script_duration = (time.time() - script_start_time) * 1000
#     log_timing("TOTAL SCRIPT EXECUTION", total_script_duration, "- COMPLETE")
#
#     print("PYTHON: Face registration completed successfully!")
#
# except Exception as e:
#     error_duration = (time.time() - script_start_time) * 1000
#     log_timing("SCRIPT FAILED", error_duration, f"- Error: {str(e)}")
#     print(f"ERROR: {str(e)}", file=sys.stderr)
#     sys.exit(1)

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
