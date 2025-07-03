from dotenv import load_dotenv
import os
import sys
import mysql.connector
import face_recognition
import shutil

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

# Load the image and encode the face
try:
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")

    image = face_recognition.load_image_file(image_path)
    encodings = face_recognition.face_encodings(image)

    if not encodings:
        raise ValueError("No face detected in the image.")

    # Convert encoding to string
    face_str = ','.join(map(str, encodings[0].tolist()))

    # Connect to the database
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
        database=os.getenv("DB_DATABASE")
    )
    cursor = conn.cursor()

    # Insert or update encoding in DB
    cursor.execute("""
                   INSERT INTO face_data (employeeID, face_encoding)
                   VALUES (%s, %s)
                       ON DUPLICATE KEY UPDATE face_encoding = VALUES(face_encoding)
                   """, (user_id, face_str))
    conn.commit()

    # Save image in stored_images/<userId>.jpg
    os.makedirs("stored_images", exist_ok=True)
    shutil.copy(image_path, f"stored_images/{user_id}.jpg")

    print("Encoding and image saved successfully.")

except Exception as e:
    print("Error:", str(e), file=sys.stderr)
    sys.exit(1)

finally:
    try:
        cursor.close()
        conn.close()
    except:
        pass
