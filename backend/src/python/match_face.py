from dotenv import load_dotenv
import sys
import json
import mysql.connector
import os
import numpy as np
from deepface import DeepFace
import pickle
import cv2

# === Load .env
if not load_dotenv():
    sys.exit(1)

# === Inputs
image_path = sys.argv[1]
employee_id = sys.argv[2]

# === Load frame from image path
frame = cv2.imread(image_path)
if frame is None:
    print(json.dumps({"matched": False, "error": "Invalid image path"}))
    sys.exit(1)

# === Anti-spoofing Checks
def check_anti_spoofing(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Brightness
    brightness = np.mean(gray)
    brightness_ok = 50 <= brightness <= 200

    # Sharpness
    sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()
    sharpness_ok = sharpness > 100

    # Texture Analysis (simple uniformity check)
    def texture_uniformity(img):
        hist = cv2.calcHist([img], [0], None, [256], [0, 256])
        return np.sum(hist ** 2) / (img.shape[0] * img.shape[1]) ** 2
    uniformity = texture_uniformity(gray)
    texture_ok = uniformity < 0.01

    # Screen reflection (rectangular contours)
    edges = cv2.Canny(gray, 50, 150)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    rect_count = 0
    for cnt in contours:
        approx = cv2.approxPolyDP(cnt, 0.02 * cv2.arcLength(cnt, True), True)
        if len(approx) == 4 and cv2.contourArea(cnt) > 1000:
            rect_count += 1
    screen_spoof_ok = rect_count <= 2

    spoof_detected = not (brightness_ok and sharpness_ok and texture_ok and screen_spoof_ok)

    return spoof_detected, {
        "brightness": brightness,
        "sharpness": sharpness,
        "uniformity": uniformity,
        "rectangles": rect_count
    }

spoofed, spoof_details = check_anti_spoofing(frame)

if spoofed:
    print(json.dumps({
        "matched": False,
        "spoof_detected": True,
        "spoof_details": spoof_details
    }))
    sys.exit(1)

# === Proceed with Face Matching
try:
    captured_encoding = DeepFace.represent(
        img_path=image_path,
        model_name='Facenet512',
        detector_backend='retinaface'
    )[0]["embedding"]

    captured_encoding = np.array(captured_encoding)

    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
        database=os.getenv("DB_DATABASE")
    )
    cursor = conn.cursor()
    cursor.execute("SELECT employeeID, face_encoding FROM face_data WHERE employeeID = %s", (employee_id,))

    for emp_id, enc_blob in cursor.fetchall():
        try:
            if isinstance(enc_blob, bytes):
                stored_encoding = pickle.loads(enc_blob)
            else:
                stored_encoding = np.array(json.loads(enc_blob))

            stored_encoding = np.array(stored_encoding)

            dot = np.dot(captured_encoding, stored_encoding)
            norm1 = np.linalg.norm(captured_encoding)
            norm2 = np.linalg.norm(stored_encoding)
            cosine_distance = 1 - (dot / (norm1 * norm2))

            if cosine_distance < 0.4:
                print(json.dumps({
                    "matched": True,
                    "user_id": emp_id,
                    "confidence": float(1 - cosine_distance),
                    "spoof_detected": False
                }))
                sys.exit(0)

        except Exception:
            continue

    print(json.dumps({"matched": False, "spoof_detected": False}))

except Exception as e:
    print(json.dumps({"matched": False, "error": str(e)}))

finally:
    try:
        cursor.close()
        conn.close()
    except:
        pass
