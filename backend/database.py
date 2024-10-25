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

    # Ask Xinran/TA whether a users table is even needed??

def create_ride(admin, max_capacity, available_spots, origin, destination, arrival_time):
    """
    Adds a ride to the Rides database
    """

    status = 'open'

    sql_command = f"""
        INSERT INTO Rides (admin_owner_id, max_capacity, available_spots, 
        origin, destination, arrival_time, status) VALUES (?, ?, ?, 
        ?, ?, ?, ?);   
    """

    values = (admin, max_capacity, available_spots, origin, destination, 
              arrival_time, status)  
    
    conn = connect()
    
    # if it was successful connection, execute SQL commands to database & commit
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command, values)
                conn.commit()
                print("Ride addded successfully!")
        except Exception as e:
            print(f"Error adding ride: {e}")
        finally:
            conn.close()
    else:
        print("Connection not established.")

def update_ride(ride_id, max_capacity=None, available_spots=None, origin=None, destination=None, 
                arrival_time=None):
    """"
    Updates an existing ride in the Rides database
    """

    # NEED TO FIX TO DEAL WITH INJECTION ATTACKS!!!

    if available_spots == max_capacity:
        status = 'full'
  
    sql_command = f"""
        UPDATE Rides
        SET updated_at = CURRENT_TIMESTAMP
    """

    if max_capacity != None:
        sql_command += f""", max_capacity = {max_capacity}"""
    if available_spots != None:
        sql_command += f""", available_spots = {available_spots}"""
    if origin != None:
        sql_command += f""", origin = {origin}, """
    if destination != None:
        sql_command += f""", destination = {destination}"""
    if arrival_time != None:
        sql_command += f""", arrival_time = {arrival_time}"""
    if status == 'full':
        sql_command += f""", status = {status}"""

    sql_command += f""" WHERE id = {ride_id} AND status != 'completed';"""

    conn = connect()
    
    # if it was successful connection, execute SQL commands to database & commit
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command)
                conn.commit()
                print("Ride updated successfully!")
        except Exception as e:
            print(f"Error updating ride: {e}")
        finally:
            conn.close()
    else:
        print("Connection not established.")

def delete_ride(user_id, ride_id):
    """
    Delete a ride in the Rides database
    """

    sql_command = """ 
        DELETE FROM Rides
        WHERE id = %s AND admin_owner_id = %s;
    """

    values = (user_id, ride_id)

    conn = connect()
    
    # if it was successful connection, execute SQL commands to database & commit
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command, values)
                conn.commit()
                print("Ride deleted successfully!")
        except Exception as e:
            print(f"Error deleting ride: {e}")
        finally:
            conn.close()
    else:
        print("Connection not established.")


def create_ride_request(user_id, ride_id):
    """"
    Adds a ride request in the RidesRequest database
    """

    status = 'pending'
    
    sql_command = f"""
        INSERT INTO RideRequests (user_id, ride_id, status) VALUES (?, 
        ?, ?);
    """

    values = (user_id, ride_id, status)     
    
    conn = connect()
    
    # if it was successful connection, execute SQL commands to database & commit
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command, values)
                conn.commit()
                print("Notification addded successfully!")
        except Exception as e:
            print(f"Error adding notification: {e}")
        finally:
            conn.close()
    else:
        print("Connection not established.")

def create_notification(user_id, message, type):
    """
    Adds a notifiction in the Notifications database
    """

    sql_command = f"""
        INSERT INTO Notifications (user_id, message, type) VALUES 
        (?, ?, ?);        
    """
    
    values = (user_id, message, type)
    
    conn = connect()
    
    # if it was successful connection, execute SQL commands to database & commit
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command, values)
                conn.commit()
                print("Notification addded successfully!")
        except Exception as e:
            print(f"Error adding notification: {e}")
        finally:
            conn.close()
    else:
        print("Connection not established.")


def add_location(id, name):
    """
    Adds a location in the Locations database
    """

    sql_command = f"""
        INSERT INTO PredefinedLocations (id, name) VALUES (?, ?);        
    """

    values = (id, name)
    
    conn = connect()
    
    # if it was successful connection, execute SQL commands to database & commit
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command, values)
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
