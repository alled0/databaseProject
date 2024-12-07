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
INSERT INTO Staff (Name, ContactInfo, Role) VALUES
('Ahmed Ali', 'ahmed.ali@example.com', 'Conductor'),
('Sara Hassan', 'sara.hassan@example.com', 'Engineer'),
('Mohammed Youssef', 'mohammed.youssef@example.com', 'Ticket Agent'),
('Laila Karim', 'laila.karim@example.com', 'Station Manager');

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
INSERT INTO Passenger (Name, ContactInfo, IDDocument, LoyaltyMiles, LoyaltyStat) VALUES
('John Doe', 'john.doe@example.com', 'ID123456', 1500, 'Silver'),
('Jane Smith', 'jane.smith@example.com', 'ID654321', 3000, 'Gold'),
('Ali Hassan', 'ali.hassan@example.com', 'ID112233', 500, 'Green'),
('Maria Garcia', 'maria.garcia@example.com', 'ID445566', 2500, 'Silver');

-- Insert into Dependent Table
INSERT INTO Dependent (RelationToPassenger, Passenger_ID, Name) VALUES
('Spouse', 1, 'Emily Doe'),
('Child', 1, 'Michael Doe'),
('Parent', 2, 'Robert Smith'),
('Sibling', 3, 'Fatima Hassan');

-- Insert into Reservation Table
-- Note: PaymentID will be NULL initially due to circular dependency
INSERT INTO Reservation (TrainID, Date, FromStation, ToStation, CoachType, SeatNumber, PassengerID, PaymentID) VALUES
(1, '2024-12-15', 1, 3, 'Economy', '12A', 1, NULL),
(2, '2024-12-16', 2, 4, 'Business', '1B', 2, NULL),
(3, '2024-12-17', 4, 5, 'Economy', '15C', 3, NULL),
(4, '2024-12-18', 1, 5, 'Business', '2D', 4, NULL);

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
