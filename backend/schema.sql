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
DROP EVENT IF EXISTS NotifyPassengersBeforeDeparture;


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


CREATE EVENT NotifyPassengersBeforeDeparture
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
  UPDATE Reservation r
  JOIN Schedule s ON r.TrainID = s.TrainID
  SET r.ReminderSent = 1  -- Assuming 'ReminderSent' is an available column
  WHERE TIMESTAMPDIFF(HOUR, NOW(), s.Departure_Time) = 3
    AND r.ReminderSent = 0;

  -- Optional: Log to console or fetch for backend processing
  SELECT PassengerID, CONCAT('Reminder: Your train is departing in 3 hours.') AS Message
  FROM Reservation r
  JOIN Schedule s ON r.TrainID = s.TrainID
  WHERE TIMESTAMPDIFF(HOUR, NOW(), s.Departure_Time) = 3
    AND r.ReminderSent = 1;
END;




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
  Paid BOOLEAN DEFAULT 0,
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
