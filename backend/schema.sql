CREATE TABLE Rides (
    id SERIAL PRIMARY KEY,
    admin_netid VARCHAR(20),
    admin_name VARCHAR(50),
    admin_email VARCHAR(50),
    max_capacity INTEGER CHECK (max_capacity BETWEEN 1 AND 20) NOT NULL,
    origin_dict JSONB NOT NULL,
    destination_dict JSONB NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    creation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_riders TEXT[][]
    note VARCHAR(250)
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

CREATE TABLE IF NOT EXISTS Notifications (
    id SERIAL PRIMARY KEY,
    netid VARCHAR(20),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);    
