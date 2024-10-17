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
    admin_owner_id INTEGER REFERENCES Users(id),
    max_capacity INTEGER CHECK (max_capacity BETWEEN 1 AND 10) NOT NULL,
    available_spots INTEGER CHECK (available_spots >= 0) NOT NULL,
    origin INTEGER REFERENCES PredefinedLocations(id) NOT NULL,
    destination INTEGER REFERENCES PredefinedLocations(id) NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    status VARCHAR(20) CHECK (status IN ('open', 'full', 'completed')) NOT NULL,
    creation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE RideRequests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id),
    ride_id INTEGER REFERENCES Rides(id),
    status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected')) NOT NULL,
    request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_time TIMESTAMP
);

CREATE TABLE Notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id),
    message TEXT NOT NULL,
    type VARCHAR(50) CHECK (type IN ('ride update', 'request made', 'request accepted', 'request rejected')) NOT NULL,
    notification_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PredefinedLocations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);
