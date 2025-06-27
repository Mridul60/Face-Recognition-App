show databases;
use attendance_app;
show tables;
CREATE TABLE employee (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(100)
);
CREATE TABLE officelocation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    radius FLOAT
);
describe employee;
describe officelocation;
CREATE TABLE facialdata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employeeID INT,
    facialDescriptor BLOB,
    createdDate DATE,
    createdTime TIME,
    updatedDate DATE,
    updatedTime TIME,
    FOREIGN KEY (employeeID) REFERENCES employee(id)
);
describe facialdata;
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employeeID INT,
    date DATE,
    punch_in_time TIME,
    punch_out_time TIME,
    FOREIGN KEY (employeeID) REFERENCES employee(id)
);
describe attendance;
insert into employee values (1, 'Faruk Khan', 'farukkhan1945@gmail.com', '123');
insert into employee values (2, 'Mridul Roy', 'mridulroy543@gmail.com', '123');
select * from employee;
INSERT INTO officelocation (name, latitude, longitude, radius)
VALUES ('Geekworkx Technologies', 26.1383507, 91.8001771, 0.05);
