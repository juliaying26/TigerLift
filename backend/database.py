import os
import psycopg2
from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.environ.get('DATABASE_URL')

def database_setup():
    """
    Sets up the DB for first time-use
    """

    sql_commands = """
        CREATE TABLE IF NOT EXISTS Users (
            id SERIAL PRIMARY KEY,
            netid VARCHAR(10) UNIQUE NOT NULL,
            name VARCHAR(50) NOT NULL,
            email VARCHAR(50) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS Rides (
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

        CREATE TABLE IF NOT EXISTS RideRequests (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES Users(id),
            ride_id INTEGER REFERENCES Rides(id),
            status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected')) NOT NULL,
            request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            response_time TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS Notifications (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES Users(id),
            message TEXT NOT NULL,
            type VARCHAR(50) CHECK (type IN ('ride update', 'request made', 'request accepted', 'request rejected')) NOT NULL,
            notification_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS PredefinedLocations (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL
        );
    """
    # Connect
    conn = connect()
    
    # if it was successful connection, execute SQL commands to database & commit
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_commands)
                conn.commit()
                print("Tables created successfully!")
        except Exception as e:
            print(f"Error creating tables: {e}")
        finally:
            conn.close()
    else:
        print("Connection not established.")

def connect():
    """ 
    Establishes connection to PostgreSQL database via psycopg2
    """
    try:
        conn = psycopg2.connect(DATABASE_URL)
        print("Connected to the database successfully!")
        return conn
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return None

# we will also add other methods to change the DB via user interaction later

def create_user():
    """
    Adds a user to the Users database
    """

    # Ritika: Not sure what argments and how this works in relation to CAS...

def create_ride(admin, max_capacity, available_spots, origin, destination, arrival_time):
    """
    Adds a ride to the Rides database
    """

    status = 'OPEN'

    sql_command = f"""
        INSERT INTO Rides (admin_owner_id, max_capacity, available_spots, 
        origin, destination, arrival_time, status) VALUES ({admin}, {max_capacity}, 
        {available_spots}, {origin}, {destination}, {arrival_time}, {status});        
    """
    
    conn = connect()
    
    # if it was successful connection, execute SQL commands to database & commit
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command)
                conn.commit()
                print("Ride addded successfully!")
        except Exception as e:
            print(f"Error adding ride: {e}")
        finally:
            conn.close()
    else:
        print("Connection not established.")

def update_ride(user_id, ride_id, status, request_time, response_time):
    """"
    Updates an existing ride in the Rides database
    """



def create_ride_request():
    """"
    Adds a ride request in the RidesRequest database
    """

def add_location(id, name):
    """
    Adds a location in the Locations database
    """

    sql_command = f"""
        INSERT INTO PredefinedLocations (id, name) VALUES ({id}, {name});        
    """
    
    conn = connect()
    
    # if it was successful connection, execute SQL commands to database & commit
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command)
                conn.commit()
                print("Location addded successfully!")
        except Exception as e:
            print(f"Error adding location: {e}")
        finally:
            conn.close()
    else:
        print("Connection not established.")


if __name__ == "__main__":
    database_setup()
