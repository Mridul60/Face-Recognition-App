# === python/match_face.py ===

from dotenv import load_dotenv
import sys
import json
import mysql.connector
import os
from deepface import DeepFace

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

# MATCH WITH THE DATABASE
cursor.execute("SELECT employeeID, face_encoding FROM face_data WHERE employeeID = %s", (employee_id,))
for employeeID, face_encoding in cursor.fetchall():
    stored_image_path = f"stored_images/{employeeID}.jpg"
    if not os.path.exists(stored_image_path):
        continue
    try:
        result = DeepFace.verify(img1_path=image_path, img2_path=stored_image_path, detector_backend='retinaface')
        if result["verified"] and result["distance"] < 0.4:
            print(json.dumps({"matched": True, "user_id": employeeID}))
            sys.exit()
    except Exception as e:
        continue

print(json.dumps({"matched": False}))
