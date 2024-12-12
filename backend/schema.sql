-- backend/schema.sql

-- Drop existing tables if they exist in the correct order
DROP TABLE IF EXISTS WaitingList;
DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS Dependent;
DROP TABLE IF EXISTS Reservation;
DROP TABLE IF EXISTS Passenger;
DROP TABLE IF EXISTS Schedule;
DROP TABLE IF EXISTS Track;
DROP TABLE IF EXISTS Station;
DROP TABLE IF EXISTS Train;
DROP TABLE IF EXISTS Staff;

-- Train Table
CREATE TABLE Train (
  TrainID INT AUTO_INCREMENT PRIMARY KEY,
  English_name VARCHAR(100) NOT NULL,
  Arabic_name VARCHAR(100) NOT NULL
);

-- Station Table
CREATE TABLE Station (
  StationID INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  Location VARCHAR(100)
);

-- Track Table
CREATE TABLE Track (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  originStation INT,
  destinationStation INT,
  FOREIGN KEY (originStation) REFERENCES Station(StationID),
  FOREIGN KEY (destinationStation) REFERENCES Station(StationID)
);

-- Schedule Table
CREATE TABLE Schedule (
  ScheduleID INT AUTO_INCREMENT PRIMARY KEY,
  TrainID INT,
  StationID INT,
  Stop_Sequence INT,
  Arrival_Time TIME,
  Departure_Time TIME,
  FOREIGN KEY (TrainID) REFERENCES Train(TrainID),
  FOREIGN KEY (StationID) REFERENCES Station(StationID)
);

-- Passenger Table
CREATE TABLE Passenger (
  PassengerID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  ContactInfo VARCHAR(100),
  IDDocument VARCHAR(100),
  LoyaltyMiles INT DEFAULT 0,
  LoyaltyStat ENUM('Green', 'Silver', 'Gold') DEFAULT 'Green',
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

-- Dependent Table
CREATE TABLE Dependent (
  DependentID INT AUTO_INCREMENT PRIMARY KEY,
  RelationToPassenger VARCHAR(50),
  Passenger_ID INT,
  Name VARCHAR(100),
  FOREIGN KEY (Passenger_ID) REFERENCES Passenger(PassengerID)
);

-- Reservation Table
CREATE TABLE Reservation (
  ReservationID INT AUTO_INCREMENT PRIMARY KEY,
  TrainID INT,
  Date DATE,
  FromStation INT,
  ToStation INT,
  CoachType ENUM('Economy', 'Business'),
  SeatNumber VARCHAR(10),
  PassengerID INT,
  PaymentID INT,
  FOREIGN KEY (TrainID) REFERENCES Train(TrainID),
  FOREIGN KEY (FromStation) REFERENCES Station(StationID),
  FOREIGN KEY (ToStation) REFERENCES Station(StationID),
  FOREIGN KEY (PassengerID) REFERENCES Passenger(PassengerID)
);

-- Payment Table
CREATE TABLE Payment (
  PaymentID INT AUTO_INCREMENT PRIMARY KEY,
  ResID INT,
  Date DATETIME,
  VAT DECIMAL(5,2),
  Amount DECIMAL(10,2),
  Payment_Status ENUM('Pending', 'Completed', 'Failed'),
  FOREIGN KEY (ResID) REFERENCES Reservation(ReservationID)
);

-- Staff Table
CREATE TABLE Staff (
  StaffID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  ContactInfo VARCHAR(100),
  Role VARCHAR(50),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

-- WaitingList Table
CREATE TABLE WaitingList (
  ReservationID INT PRIMARY KEY,
  Temporary_Reservation BOOLEAN DEFAULT TRUE,
  Expir_Date DATETIME,
  FOREIGN KEY (ReservationID) REFERENCES Reservation(ReservationID)
);
