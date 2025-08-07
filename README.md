# GeoFace Attendance

**GeoFace Attendance** is a geo-location-based face recognition app designed to manage attendance with precise in-time and out-time tracking.

This app ensures:
- The user is physically present within the office perimeter
- No check-in/out is allowed outside the defined geo-boundary
- Anti-spoofing measures are in place to prevent fraudulent check-ins

---

## Features

- **Geo-Fencing**: Uses the device's GPS to create a virtual boundary. Attendance can only be marked within this specified area.
- **Facial Recognition**: Uses DeepFace to verify user identity, preventing buddy punching and other identity fraud.
- **Anti-Spoofing**: Implements liveness detection to ensure the user is a real person, not a photo or video.

---

## Getting Started

Follow these steps to set up the project on your local machine for development and testing.
### Prerequisites
You will need the following tools installed:
- Node.js
- Python 3.8.10

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Mridul60/Face-Recognition-App.git
   ```
2. Navigate to the project directory:
    ```bash
    cd Face-Recognition-App
    ```
3. Setup virtual environment (python 3.8.10 recommended):
   - Create virtual environment (replace python directory)
      ```bash
      "<your-python38-dir>" -m venv .venvPython38
      ```
     Generally, it is ```C:\Users\<YourUsername>\AppData\Local\Programs\Python\Python38\python.exe```
   - Activate the virtual environment
      ```bash 
     .venvPython38\Scripts\activate
     ```
4. Install Node.js dependencies
    ```bash
    npm install
    ```
5. Install Python dependencies
    ```bash
    pip install -r requirements.txt
   ```
6. Set up environment variables:
   Create a ```.env``` file in the ```Face-Recognition-App/backend/src``` folder and add the following:
    ```bash
    PORT=9000
    DB_HOST=localhost
    DB_PORT=3306
    DB_USER=root
    DB_PASS=your_password
    DB_DATABASE=your_database_name
    NODE_ENV=development
    TZ=Asia/Kolkata
    ```
### Running the App
1. Setup for MySQL
    ```bash
    # create employee table
    CREATE TABLE `employee` (
  		`id` int(11) NOT NULL AUTO_INCREMENT,
  		`name` varchar(100) DEFAULT NULL,
  		`email` varchar(100) DEFAULT NULL,
  		`password` varchar(100) DEFAULT NULL,
  		PRIMARY KEY (`id`)
   )
   # create face_data table
   CREATE TABLE `face_data` (
  		`id` int(11) NOT NULL AUTO_INCREMENT,
  		`employeeID` int(11) NOT NULL,
  		`face_encoding` longblob NOT NULL,
  		`createdAt` datetime DEFAULT current_timestamp(),
        PRIMARY KEY (`id`),
  		 KEY `face_data_ibfk_1` (`employeeID`),
  		 CONSTRAINT `face_data_ibfk_1` FOREIGN KEY (`employeeID`) REFERENCES `employee` (`id`)
   )
   # create attendance table
   CREATE TABLE `attendance` (
  		`id` int(11) NOT NULL AUTO_INCREMENT,
  		`employeeID` int(11) DEFAULT NULL,
  		`date` date DEFAULT NULL,
  		`punch_in_time` time DEFAULT NULL,
  		`punch_out_time` time DEFAULT NULL,
  		PRIMARY KEY (`id`),
  		KEY `employeeID` (`employeeID`),
  		CONSTRAINT `fk_attendance_employee` FOREIGN KEY (`employeeID`) REFERENCES `employee` (`id`)
   )
   ```
2. Start the backend
   ``` 
   cd backend\src
   node app.js
   ```
3. Run the app
   -  Add your ipv4 address in the ```config.ts``` file (present in root directory). To get ipv4 address, open cmd and type ```ipconfig```.
      ```bash
      const BASE_URL = 'http://<your-ip>:9000'; 
      ```
   - This app needs a development build to run
       ```bash
      npx expo run:android 
       ```
   - Once build, you can use this command to run the app (faster)
       ``` 
        npx expo start
       ```
---
## Troubleshooting
1. **Andoroid sdk error** - When you run the command ```npx expo run:android``` to build for android, then a folder is created in the root project folder. To fix this error, create a file ```local.properties``` in the ```android/``` folder and add sdk directory (this is the general locaiton)
    ```bash
    sdk.dir=C:\\Users\\<your-user-name>\\AppData\\Local\\Android\\Sdk
    ```
2. **Map is not loaded** - This is the Google Maps ```API_KEY``` issue. To solve this:
    ```bash
    # Open AndroidManifest.xml file
    android/app/src/main/AndroidManifest.xml
    
    # Add this in the <application> section (replace <your-api-key>)
    <meta-data
            android:name="com.google.android.geo.API_KEY"
            android:value="<your-api-key>"
    />
    ```
---
## Contact us:
- [Faruk Khan](mailto:faruk.khan.cse@gmail.com)
- [Mridul Roy](mailto:mridulroy543@gmail.com)