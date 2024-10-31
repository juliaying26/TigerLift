CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    netid VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Rides (
    id SERIAL PRIMARY KEY,
    admin_netid VARCHAR(20),
    admin_name VARCHAR(50),
    admin_email VARCHAR(50),
    max_capacity INTEGER CHECK (max_capacity BETWEEN 1 AND 10) NOT NULL,
    origin INTEGER REFERENCES PredefinedLocations(id) NOT NULL,
    destination INTEGER REFERENCES PredefinedLocations(id) NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    status VARCHAR(20) CHECK (status IN ('open', 'full', 'completed')) NOT NULL,
    creation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_riders TEXT[][]
);

CREATE TABLE IF NOT EXISTS RideRequests (
    id SERIAL PRIMARY KEY,
    netid VARCHAR(10),
    full_name TEXT,
    mail VARCHAR(30),
    ride_id INTEGER REFERENCES Rides(id),
    status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected')) NOT NULL,
    request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_time TIMESTAMP
);

CREATE TABLE Notifications (
    id SERIAL PRIMARY KEY,
    netid VARCHAR(10),
    message TEXT NOT NULL,
    type VARCHAR(50) CHECK (type IN ('ride update', 'request made', 'request accepted', 'request rejected')) NOT NULL,
    notification_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PredefinedLocations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);
