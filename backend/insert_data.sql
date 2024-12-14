-- backend/insert_data.sql

-- Disable foreign key checks temporarily to handle circular dependencies
SET FOREIGN_KEY_CHECKS = 0;

-- Insert into Train Table
INSERT INTO Train (English_name, Arabic_name) VALUES
('Express Line', 'خط سريع'),
('Regional Connector', 'الموصل الإقليمي'),
('Night Rider', 'راكب الليل'),
('City Loop', 'حلقة المدينة');

-- Insert into Station Table
INSERT INTO Station (name, Location) VALUES
('Central Station', 'Downtown'),
('North Station', 'Uptown'),
('East Station', 'Eastside'),
('South Station', 'Southside'),
('West Station', 'Westside');

-- Insert into Staff Table
INSERT INTO Staff (Name, ContactInfo, Role, email, password) VALUES
('Ahmed Ali', 'ahmed.ali@example.com', 'Conductor', 'staff1@example.com', 'staff123'),
('Sara Hassan', 'sara.hassan@example.com', 'Engineer', 'staff2@example.com', 'staff456'),
('Mohammed Youssef', 'mohammed.youssef@example.com', 'Ticket Agent', 'staff3@example.com', 'staff789'),
('Laila Karim', 'laila.karim@example.com', 'Station Manager', 'staff4@example.com', 'staff321');


-- Insert into Track Table
INSERT INTO Track (originStation, destinationStation) VALUES
(1, 2),
(2, 3),
(3, 4),
(4, 5),
(5, 1);

-- Insert into Schedule Table
INSERT INTO Schedule (TrainID, StationID, Stop_Sequence, Arrival_Time, Departure_Time) VALUES
(1, 1, 1, '08:00:00', '08:05:00'),
(1, 2, 2, '09:00:00', '09:05:00'),
(1, 3, 3, '10:00:00', '10:05:00'),
(2, 2, 1, '07:30:00', '07:35:00'),
(2, 3, 2, '08:30:00', '08:35:00'),
(3, 4, 1, '22:00:00', '22:05:00'),
(3, 5, 2, '23:00:00', '23:05:00'),
(4, 1, 1, '06:00:00', '06:05:00'),
(4, 5, 2, '07:00:00', '07:05:00');

-- Insert into Passenger Table
INSERT INTO Passenger (Name, ContactInfo, IDDocument, LoyaltyMiles, LoyaltyStat, email, password) VALUES
('John Doe', '+96643434', 'ID123456', 1500, 'Silver', 'passenger1@example.com', 'pass123'),
('Jane Smith', '+966434341', 'ID654321', 3000, 'Gold', 'omaralkholief@gmail.com', 'pass456'),
('waleed meshal', '+966434342', 'ID112233', 500, 'Green', 'waleedal305@hotmail.com', 'pass789'),
('Maria Garcia', '+966434343', 'ID445566', 2500, 'Silver', 'passenger4@example.com', 'pass321');


-- Insert into Dependent Table
INSERT INTO Dependent (RelationToPassenger, Passenger_ID, Name) VALUES
('Spouse', 1, 'Emily Doe'),
('Child', 1, 'Michael Doe'),
('Parent', 2, 'Robert Smith'),
('Sibling', 3, 'Fatima Hassan');

-- Insert into Reservation Table
-- Note: PaymentID will be NULL initially due to circular dependency
INSERT INTO Reservation (TrainID, Date, FromStation, ToStation, CoachType, SeatNumber, PassengerID, PaymentID, Paid) VALUES
(1, '2024-12-15', 1, 3, 'Economy', '12A', 1, NULL, 1),
(2, '2024-12-16', 2, 4, 'Business', '1B', 2, NULL,0),
(3, '2024-12-17', 4, 5, 'Economy', '15C', 3, NULL, 0),
(4, '2024-12-18', 1, 5, 'Business', '2D', 4, NULL,1);


-- unpaid reservations
-- INSERT INTO Passenger (Name, ContactInfo, IDDocument, LoyaltyMiles, LoyaltyStat, email, password)
-- VALUES ('Test Passenger', '1234567890', 'ID1234', 0, 'Green', 'test@example.com', 'password');

-- INSERT INTO Reservation (TrainID, Date, FromStation, ToStation, CoachType, SeatNumber, PassengerID, PaymentID)
-- VALUES (1, CURDATE(), 101, 102, 'Economy', 'A1', LAST_INSERT_ID(), NULL);

-- UPDATE Reservation SET Paid = 0 WHERE ReservationID = 1; -- Set unpaid status


-- Insert into Payment Table
INSERT INTO Payment (ResID, Date, VAT, Amount, Payment_Status) VALUES
(1, '2024-12-10 10:00:00', 15.00, 150.00, 'Completed'),
(2, '2024-12-11 11:30:00', 22.50, 225.00, 'Completed'),
(3, '2024-12-12 09:15:00', 7.50, 75.00, 'Pending'),
(4, '2024-12-13 14:45:00', 22.50, 225.00, 'Failed');

-- Update Reservation Table to set PaymentID now that Payments are inserted
UPDATE Reservation SET PaymentID = 1 WHERE ReservationID = 1;
UPDATE Reservation SET PaymentID = 2 WHERE ReservationID = 2;
UPDATE Reservation SET PaymentID = 3 WHERE ReservationID = 3;
UPDATE Reservation SET PaymentID = 4 WHERE ReservationID = 4;

-- Insert into WaitingList Table
INSERT INTO WaitingList (ReservationID, Temporary_Reservation, Expir_Date) VALUES
(3, TRUE, '2024-12-20 23:59:59'),
(4, FALSE, '2024-12-25 23:59:59');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
