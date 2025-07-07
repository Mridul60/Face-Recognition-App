from dotenv import load_dotenv
import mysql.connector
import os

load_dotenv()

try:
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASS"),
        database=os.getenv("DB_DATABASE")
    )
    print("✅ Connected to MySQL successfully.")
    conn.close()
except Exception as e:
    print("❌ DB Connection Failed:", e)
