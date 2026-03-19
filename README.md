# Saudi Railways System

A full-stack railway reservation management system built as a database portfolio project. The system demonstrates real-world relational database design with complex relationships, foreign key constraints, transactions, and multi-table queries.

**Live Demo:** [saudi-railways.vercel.app](https://saudi-railways.vercel.app)
**GitHub:** [github.com/alled0/databaseProject](https://github.com/alled0/databaseProject)

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Passenger | passenger1@example.com | pass123 |
| Passenger | passenger4@example.com | pass321 |
| Admin | staff1@example.com | staff123 |
| Admin | staff2@example.com | staff456 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MySQL 8.0 |
| Email | Nodemailer + Resend SMTP |
| Scheduler | node-cron |
| Deployment | Vercel (frontend) + Railway (backend + MySQL) |

---

## Features

### Passenger
- **Search Trains** — search available trains between two stations based on the schedule
- **Book a Seat** — reserve a seat with coach type (Economy/Business), auto-linked to passenger account
- **Payment** — complete payment for a reservation (updates `Paid` flag in DB)
- **Reports** — view personal reservation history, filter by date

### Admin
- **Manage Reservations** — add, edit, or cancel any reservation on behalf of passengers
- **Assign Staff** — assign staff members to trains with specific roles (Driver, Engineer, Conductor, Ticket Agent)
- **Promote Passenger** — promote a waitlisted passenger to a confirmed reservation
- **Reports** — active trains, train station routes, waitlisted loyalty passengers, load factor by date, dependents traveling by date

---

## Database Design

### Entity-Relationship Overview

The database consists of **11 tables** with carefully designed relationships enforced through foreign key constraints.

```
Train ──────── Schedule ──────── Station
  │                                 │
  │                                Track
  │                            (self-join on Station)
  │
  └──── Reservation ──── Passenger ──── Dependent
           │                  │
         Payment          WaitingList
           │
      StaffAssignment ──── Staff
```

---

### Tables & Relationships

#### `Train`
The central entity. Almost every other table references Train directly or indirectly.
```sql
TrainID (PK) | English_name | Arabic_name
```

#### `Station`
Physical railway stations. Referenced by Schedule, Track, and Reservation (as both FromStation and ToStation).
```sql
StationID (PK) | name | Location
```

#### `Track`
Defines physical track connections between stations. A **self-referencing many-to-many** relationship on Station — both `originStation` and `destinationStation` are foreign keys pointing to the same `Station` table.
```sql
ID (PK) | originStation (FK → Station) | destinationStation (FK → Station)
```

#### `Schedule`
The heart of route planning. Links trains to their ordered station stops. A train has one Schedule row per stop, ordered by `Stop_Sequence`. This allows the system to verify direction of travel.
```sql
ScheduleID (PK) | TrainID (FK → Train) | StationID (FK → Station)
              | Stop_Sequence | Arrival_Time | Departure_Time
```
> **Self-join query:** Train search joins Schedule twice to verify a train passes through both `fromStation` and `toStation` in the correct forward direction:
> ```sql
> JOIN Schedule AS s1 ON Train.TrainID = s1.TrainID
> JOIN Schedule AS s2 ON Train.TrainID = s2.TrainID
> WHERE s1.StationID = ? AND s2.StationID = ?
> AND s1.Stop_Sequence < s2.Stop_Sequence
> ```

#### `Passenger`
Registered users with a built-in loyalty program. `LoyaltyStat` is enforced at the DB level using ENUM.
```sql
PassengerID (PK) | Name | ContactInfo | IDDocument
               | LoyaltyMiles | LoyaltyStat (ENUM: Green/Silver/Gold)
               | email (UNIQUE) | password
```

#### `Dependent`
Family members linked to a passenger. Demonstrates a **one-to-many** relationship — one passenger can have multiple dependents, but each dependent belongs to exactly one passenger.
```sql
DependentID (PK) | Passenger_ID (FK → Passenger) | Name | RelationToPassenger
```

#### `Reservation`
The central transaction table. Links a passenger to a train journey between two stations. References 4 other tables through foreign keys.
```sql
ReservationID (PK) | TrainID (FK → Train) | PassengerID (FK → Passenger)
                 | FromStation (FK → Station) | ToStation (FK → Station)
                 | Date | CoachType (ENUM: Economy/Business)
                 | SeatNumber | PaymentID | Paid (BOOLEAN DEFAULT 0)
```
> **Dependency chain:** Deleting a reservation requires deleting child records first:
> `WaitingList → Payment → Reservation` (strict FK-enforced order)

#### `Payment`
Tracks payment status per reservation. **One-to-one** with Reservation via `ResID`.
```sql
PaymentID (PK) | ResID (FK → Reservation) | Date | VAT | Amount
             | Payment_Status (ENUM: Pending/Completed/Failed)
```

#### `WaitingList`
Passengers on a waitlist for a fully-booked train. The `ReservationID` is both the Primary Key and a Foreign Key — enforcing a strict one-to-one dependency with Reservation.
```sql
ReservationID (PK, FK → Reservation) | Temporary_Reservation (BOOLEAN) | Expir_Date
```
> **Promotion flow:** Admin promotes a passenger by removing their WaitingList entry. The reservation already exists — it just gets confirmed.

#### `Staff`
Railway employees who log in as admins. Separate from Passenger table — different roles, different authentication path.
```sql
StaffID (PK) | Name | ContactInfo | Role | email (UNIQUE) | password
```

#### `StaffAssignment`
A **many-to-many** junction table between Staff and Train. One staff member can work on multiple trains; one train can have multiple staff. The `UNIQUE KEY (StaffID, TrainID)` prevents duplicate assignments and is enforced at the database level — not just in application code.
```sql
AssignmentID (PK) | StaffID (FK → Staff) | TrainID (FK → Train) | Role
               | UNIQUE KEY (StaffID, TrainID)
```

---

### Key Database Concepts Demonstrated

#### Foreign Key Constraints
Every inter-table relationship is enforced with `FOREIGN KEY` constraints, preventing orphaned records. You cannot insert a Reservation with a non-existent `PassengerID`, `TrainID`, or `StationID` — the database rejects it.

#### Cascading Delete Order
When cancelling a reservation, the backend must delete in this strict FK-enforced order:
```
1. WaitingList  (references Reservation)
2. Payment      (references Reservation)
3. Reservation  (now safe to delete)
```
Skipping any step causes a `Cannot delete or update a parent row` FK violation.

#### Transactions (Atomicity)
All multi-step operations are wrapped in MySQL transactions to guarantee atomicity:
```js
await connection.beginTransaction();
// Step 1: delete WaitingList
// Step 2: delete Payment
// Step 3: delete Reservation
await connection.commit();
// On any error:
await connection.rollback(); // all steps undone
```
This ensures the database never ends up in a partially-deleted state.

#### ENUM Constraints
`CoachType`, `Payment_Status`, and `LoyaltyStat` use MySQL `ENUM` — invalid values are rejected at the database level before reaching application logic.

#### Self-Join for Route Validation
The train search uses a self-join on Schedule to find trains that pass through both stations in the correct direction — ensuring a passenger can't book a train in reverse:
```sql
SELECT DISTINCT Train.TrainID, Train.English_name
FROM Train
JOIN Schedule AS s1 ON Train.TrainID = s1.TrainID
JOIN Schedule AS s2 ON Train.TrainID = s2.TrainID
WHERE s1.StationID = ? AND s2.StationID = ?
AND s1.Stop_Sequence < s2.Stop_Sequence
```

#### Complex Multi-Table JOIN Reports
The admin reports section demonstrates advanced SQL:

**Load Factor** — calculates seat utilization per train per date:
```sql
SELECT r.TrainID, t.English_name,
       COUNT(*) AS BookedSeats, 150 AS TotalSeats,
       ROUND((COUNT(*) / 150) * 100, 2) AS AverageLoadFactor
FROM Reservation r
JOIN Train t ON r.TrainID = t.TrainID
WHERE r.Date = ?
GROUP BY r.TrainID, t.English_name
```

**Waitlisted Loyalty Passengers** — joins 3 tables, filters by loyalty tier:
```sql
SELECT p.Name, p.LoyaltyStat, r.CoachType
FROM WaitingList w
JOIN Reservation r ON w.ReservationID = r.ReservationID
JOIN Passenger p ON r.PassengerID = p.PassengerID
WHERE r.TrainID = ? AND p.LoyaltyStat IN ('Silver', 'Gold')
```

**Stations per Train** — uses `GROUP_CONCAT` to aggregate station names:
```sql
SELECT t.TrainID, t.English_name,
       GROUP_CONCAT(s.name ORDER BY sc.Stop_Sequence ASC) AS Stations
FROM Train t
JOIN Schedule sc ON t.TrainID = sc.TrainID
JOIN Station s ON sc.StationID = s.StationID
GROUP BY t.TrainID
```

**Dependents Traveling** — 4-table join:
```sql
SELECT d.Name AS DependentName, p.Name AS PassengerName, r.Date, t.English_name
FROM Dependent d
JOIN Passenger p ON d.Passenger_ID = p.PassengerID
JOIN Reservation r ON p.PassengerID = r.PassengerID
JOIN Train t ON r.TrainID = t.TrainID
WHERE r.Date = ?
```

#### Connection Pooling
The backend uses `mysql2/promise` with a connection pool. Connections are acquired, used, and released — avoiding the overhead of opening a new connection per request, and preventing connection exhaustion under load.

---

## Project Structure

```
databaseProject/
├── backend/
│   ├── config/
│   │   ├── database.js           # MySQL connection pool (utf8mb4, dateStrings)
│   │   └── emailTransporter.js   # Nodemailer + Resend SMTP
│   ├── controllers/
│   │   ├── authController.js     # Login for passengers and staff
│   │   ├── trainController.js    # Trains and stations
│   │   ├── reservationController.js
│   │   ├── reportController.js   # All 6 report queries
│   │   ├── staffController.js    # Staff assignment
│   │   └── promotionController.js
│   ├── routes/
│   │   ├── index.js              # All API routes
│   │   ├── train.js
│   │   └── reservation.js
│   ├── services/
│   │   ├── reservationService.js # bookSeat, completePayment, manageReservations
│   │   └── reminderService.js    # Email reminder logic
│   ├── jobs/
│   │   └── emailReminders.js     # node-cron scheduled jobs
│   ├── schema.sql                # DDL — all CREATE TABLE statements
│   ├── insert_data.sql           # DML — sample data
│   └── server.js                 # Express entry point + CORS
└── frontend/
    └── src/
        ├── components/
        │   ├── Login.js
        │   ├── SearchTrains.js
        │   ├── BookSeat.js
        │   ├── Payment.js
        │   ├── Reports.js
        │   ├── ManageReservations.js
        │   ├── AssignStaff.js
        │   ├── PromotePassenger.js
        │   └── Navbar.js
        ├── style/                # Page-specific CSS overrides
        ├── index.css             # Global design system
        ├── config.js             # API base URL (env-aware)
        └── App.js                # Routes + auth state + localStorage
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Authenticate passenger or staff |
| GET | `/api/trains/` | Get all trains |
| GET | `/api/trains/stations` | Get all stations |
| GET | `/api/trains/searchTrains` | Search trains by route (self-join) |
| POST | `/api/reservations/bookSeat` | Create reservation + payment record |
| POST | `/api/reservations/completePayment` | Mark reservation as paid |
| POST | `/api/reservations/manageReservations` | Add / Edit / Cancel (admin) |
| POST | `/api/assignStaff` | Assign staff to train |
| GET | `/api/staff` | Get all staff members |
| POST | `/api/promotePassenger` | Promote waitlisted passenger |
| GET | `/api/reports/active-trains` | Trains with reservations on a date |
| GET | `/api/reports/stations-for-trains` | All stations per train (GROUP_CONCAT) |
| GET | `/api/reports/reservations/:id` | Passenger reservation history |
| GET | `/api/reports/waitlisted-loyalty/:train` | Waitlisted loyalty passengers |
| GET | `/api/reports/load-factor/:date` | Train load factor by date |
| GET | `/api/reports/dependents/:date` | Dependents traveling by date |

---

## Local Development

**Prerequisites:** Node.js 18+, MySQL 8.0

```bash
# Clone
git clone https://github.com/alled0/databaseProject.git
cd databaseProject

# Backend setup
cd backend
npm install
# Create .env with: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, EMAIL_USER, EMAIL_PASS
npm run dev

# Frontend setup
cd ../frontend
npm install
npm start
```

Create and seed the database:
```sql
CREATE DATABASE SaudiRailwaysDB CHARACTER SET utf8mb4;
```
```bash
mysql -u root -p SaudiRailwaysDB < backend/schema.sql
mysql -u root -p SaudiRailwaysDB < backend/insert_data.sql
```
