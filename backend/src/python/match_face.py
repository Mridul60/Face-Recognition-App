# === python/match_face.py ===

from dotenv import load_dotenv
import sys
import json
import mysql.connector
import os
from deepface import DeepFace

load_dotenv()

image_path = sys.argv[1]

conn = mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
password=os.getenv("DB_PASS"),
database=os.getenv("DB_DATABASE")

)
cursor = conn.cursor()

#MATCH WITH THE DATABASE
cursor.execute("SELECT user_id, face_encoding FROM face_data")
for user_id, encoding_blob in cursor.fetchall():
    stored_image_path = f"stored_images/{user_id}.jpg"
    if not os.path.exists(stored_image_path):
        continue
    try:
        result = DeepFace.verify(img1_path=image_path, img2_path=stored_image_path, detector_backend='retinaface')
        if result["verified"] and result["distance"] < 0.4:
            print(json.dumps({"matched": True, "user_id": user_id}))
            sys.exit()
    except Exception as e:
        continue

print(json.dumps({"matched": False}))