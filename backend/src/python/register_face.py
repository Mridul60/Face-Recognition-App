# === python/register_face.py (for saving encodings) ===
from dotenv import load_dotenv
import os
import face_recognition
import sys
import mysql.connector
import shutil

image_path = sys.argv[1]
user_id = sys.argv[2]

image = face_recognition.load_image_file(image_path)
encodings = face_recognition.face_encodings(image)

if not encodings:
    print("No face detected")
    sys.exit()

face_str = ','.join(map(str, encodings[0].tolist()))

conn = mysql.connector.connect(
   host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
password=os.getenv("DB_PASS"),
database=os.getenv("DB_DATABASE")
)
cursor = conn.cursor()

cursor.execute("INSERT INTO face_data (user_id, face_encoding) VALUES (%s, %s)", (user_id, face_str))
conn.commit()

# Save image for future match
shutil.copy(image_path, f"stored_images/{user_id}.jpg")

print("Encoding and image saved")