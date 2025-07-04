####using face-recognition similar to register_face.py (takes similar time 10 seconds)
from dotenv import load_dotenv
import sys
import json
import mysql.connector
import os
import face_recognition
import numpy as np

# Load environment variables from .env
dotenv_loaded = load_dotenv()
if not dotenv_loaded:
    sys.exit(1)

image_path = sys.argv[1]
employee_id = sys.argv[2]

try:
    # Load and encode the input image
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")

    input_image = face_recognition.load_image_file(image_path)
    input_encodings = face_recognition.face_encodings(input_image)

    if not input_encodings:
        print(json.dumps({"matched": False, "error": "No face detected in input image"}))
        sys.exit()

    input_encoding = input_encodings[0]

    # Connect to database
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
        database=os.getenv("DB_DATABASE")
    )
    cursor = conn.cursor()

    # Get stored encoding for the specific employee
    cursor.execute("SELECT face_encoding FROM face_data WHERE employeeID = %s", (employee_id,))
    result = cursor.fetchone()

    if not result:
        print(json.dumps({"matched": False, "error": "No face data found for employee"}))
        sys.exit()

    # Convert stored encoding string back to numpy array
    stored_encoding_str = result[0]
    stored_encoding = np.array([float(x) for x in stored_encoding_str.split(',')])

    # Compare faces using face_recognition
    matches = face_recognition.compare_faces([stored_encoding], input_encoding, tolerance=0.6)
    face_distances = face_recognition.face_distance([stored_encoding], input_encoding)

    if matches[0] and face_distances[0] < 0.6:
        print(json.dumps({"matched": True, "user_id": employee_id, "confidence": float(1 - face_distances[0])}))
    else:
        print(json.dumps({"matched": False, "distance": float(face_distances[0])}))

except Exception as e:
    print(json.dumps({"matched": False, "error": str(e)}))
    sys.exit(1)

finally:
    try:
        cursor.close()
        conn.close()
    except:
        pass

# #### optimised deepface (20 seconds)
# from dotenv import load_dotenv
# import sys
# import json
# import mysql.connector
# import os
# from deepface import DeepFace
#
# # Load environment variables from .env
# dotenv_loaded = load_dotenv()
# if not dotenv_loaded:
#     sys.exit(1)
#
# image_path = sys.argv[1]
# employee_id = sys.argv[2]
#
# try:
#     conn = mysql.connector.connect(
#         host=os.getenv("DB_HOST"),
#         user=os.getenv("DB_USER"),
#         password=os.getenv("DB_PASS"),
#         database=os.getenv("DB_DATABASE")
#     )
#     cursor = conn.cursor()
#
#     # Check if stored image exists for the specific employee
#     stored_image_path = f"stored_images/{employee_id}.jpg"
#     if not os.path.exists(stored_image_path):
#         print(json.dumps({"matched": False, "error": "No stored image found for employee"}))
#         sys.exit()
#
#     # Use faster detector backend and model
#     result = DeepFace.verify(
#         img1_path=image_path,
#         img2_path=stored_image_path,
#         detector_backend='opencv',  # Much faster than retinaface
#         model_name='VGG-Face',      # Faster than default ArcFace
#         distance_metric='cosine',
#         enforce_detection=False     # Skip if face not detected instead of throwing error
#     )
#
#     # More lenient threshold for faster processing
#     if result["verified"] and result["distance"] < 0.5:
#         print(json.dumps({"matched": True, "user_id": employee_id, "confidence": float(1 - result["distance"])}))
#     else:
#         print(json.dumps({"matched": False, "distance": float(result["distance"])}))
#
# except Exception as e:
#     print(json.dumps({"matched": False, "error": str(e)}))
#     sys.exit(1)
#
# finally:
#     try:
#         cursor.close()
#         conn.close()
#     except:
#         pass

##### using deep face (takes 60 seconds)
# from dotenv import load_dotenv
# import sys
# import json
# import mysql.connector
# import os
# from deepface import DeepFace
#
# # Load environment variables from .env
# dotenv_loaded = load_dotenv()
# if not dotenv_loaded:
#     sys.exit(1)
#
# image_path = sys.argv[1]
# employee_id = sys.argv[2]
#
# conn = mysql.connector.connect(
#     host=os.getenv("DB_HOST"),
#     user=os.getenv("DB_USER"),
#     password=os.getenv("DB_PASS"),
#     database=os.getenv("DB_DATABASE")
#
# )
# cursor = conn.cursor()
#
# # MATCH WITH THE DATABASE
# cursor.execute("SELECT employeeID, face_encoding FROM face_data WHERE employeeID = %s", (employee_id,))
# for employeeID, face_encoding in cursor.fetchall():
#     stored_image_path = f"stored_images/{employeeID}.jpg"
#     if not os.path.exists(stored_image_path):
#         continue
#     try:
#         result = DeepFace.verify(img1_path=image_path, img2_path=stored_image_path, detector_backend='retinaface')
#         if result["verified"] and result["distance"] < 0.4:
#             print(json.dumps({"matched": True, "user_id": employeeID}))
#             sys.exit()
#     except Exception as e:
#         continue
#
# print(json.dumps({"matched": False}))