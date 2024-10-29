import os
import psycopg2
import json
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

        CREATE TABLE IF NOT EXISTS PredefinedLocations (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS Rides (
            id SERIAL PRIMARY KEY,
            admin_netid VARCHAR(20),
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
            ride_id INTEGER REFERENCES Rides(id),
            status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected')) NOT NULL,
            request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            response_time TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS Notifications (
            id SERIAL PRIMARY KEY,
            netid VARCHAR(10),
            message TEXT NOT NULL,
            type VARCHAR(50) CHECK (type IN ('ride update', 'request made', 'request accepted', 'request rejected')) NOT NULL,
            notification_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

def create_ride(admin, max_capacity, origin, destination, arrival_time):
    """
    Adds a ride to the Rides database
    """

    status = 'open'
    current_riders = []

    sql_command = f"""
        INSERT INTO Rides (admin_netid, max_capacity, current_riders,
        origin, destination, arrival_time, status) VALUES (%s, %s, %s, 
        %s, %s, %s, %s);   
    """

    values = (admin, max_capacity, current_riders, origin, destination, 
              arrival_time, status)  
    
    conn = connect()
    
    # if it was successful connection, execute SQL commands to database & commit
    if conn:
        try:
            with conn.cursor() as cursor:
                print("here")
                cursor.execute(sql_command, values)
                conn.commit()
                print("Ride addded successfully!")
        except Exception as e:
            print(f"Error adding ride: {e}")
        finally:
            conn.close()
    else:
        print("Connection not established.")

def update_ride(ride_id, current_riders, max_capacity=None, origin=None, destination=None, 
                arrival_time=None):
    """"
    Updates an existing ride in the Rides database
    """

    # NEED TO FIX TO DEAL WITH INJECTION ATTACKS!!!

    if len(current_riders) == max_capacity:
        status = 'full'
  
    sql_command = f"""
        UPDATE Rides
        SET updated_at = CURRENT_TIMESTAMP
    """

    if max_capacity != None:
        sql_command += f""", max_capacity = {max_capacity}"""
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

def delete_ride(netid, ride_id):
    """
    Delete a ride in the Rides database
    """

    sql_command = """ 
        DELETE FROM Rides
        WHERE admin_netid = %s AND id = %s;
    """

    values = (netid, ride_id)

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


def create_ride_request(netid, ride_id):
    """"
    Adds a ride request in the RidesRequest database
    """

    status = 'pending'
    
    sql_command = f"""
        INSERT INTO RideRequests (netid, ride_id, status) VALUES (%s, 
        %s, %s);
    """

    values = (netid, ride_id, status)     
    
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


def update_ride_request(request_id, status):
    """"
    Updates an existing ride request in the RidesRequest database
    """

    sql_command = f"""
        UPDATE RideRequests
        SET status = %s, response_time = CURRENT_TIMESTAMP
        WHERE id = %s;
    """

    values = (status, request_id)

    conn = connect()
    
    # if it was successful connection, execute SQL commands to database & commit
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command, values)
                conn.commit()
                print("Ride request updated successfully!")
        except Exception as e:
            print(f"Error updating ride request: {e}")
        finally:
            conn.close()
    else:
        print("Connection not established.")


def create_notification(netid, message, type):
    """
    Adds a notifiction in the Notifications database
    """

    sql_command = f"""
        INSERT INTO Notifications (netid, message, type) VALUES 
        (%s, %s, %s);        
    """
    
    values = (netid, message, type)
    
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


def create_location(id, name):
    """
    Adds a location in the Locations database
    """

    sql_command = f"""
        INSERT INTO PredefinedLocations (id, name) VALUES (%s, %s);        
    """

    values = (id, name)
    
    conn = connect()
    
    # if it was successful connection, execute SQL commands to database & commit
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command, values)
                conn.commit()
                print("Location created successfully!")
        except Exception as e:
            print(f"Error creating location: {e}")
        finally:
            conn.close()
    else:
        print("Connection not established.")

def delete_all_locations():
    sql_command = "DELETE FROM PredefinedLocations"
    
    conn = connect()
    
    # if it was successful connection, execute SQL commands to database & commit
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command)
                conn.commit()
                print("Location deleted successfully!")
        except Exception as e:
            print(f"Error deleting locations: {e}")
        finally:
            conn.close()
    else:
        print("Connection not established.")

def delete_all_rides():
    sql_command = "DELETE FROM Rides"
    
    conn = connect()
    
    # if it was successful connection, execute SQL commands to database & commit
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command)
                conn.commit()
                print("Ride deleted successfully!")
        except Exception as e:
            print(f"Error deleting rides: {e}")
        finally:
            conn.close()
    else:
        print("Connection not established.")

def get_users_rides(netid):
    """
    Get all of a user's rides from Rides database
    """

    sql_command = sql_command = """
        SELECT 
            Rides.id, 
            Rides.admin_netid, 
            Rides.max_capacity, 
            Rides.origin, 
            Rides.destination, 
            Rides.arrival_time, 
            Rides.status, 
            Rides.creation_time, 
            Rides.updated_at, 
            Rides.current_riders, 
            ARRAY_AGG(RideRequests.netid) AS netids 
        FROM 
            Rides 
        LEFT JOIN 
            RideRequests ON RideRequests.ride_id = Rides.id 
        WHERE 
            Rides.admin_netid = %s
        GROUP BY 
            Rides.id, 
            Rides.admin_netid, 
            Rides.max_capacity, 
            Rides.origin, 
            Rides.destination, 
            Rides.arrival_time, 
            Rides.status, 
            Rides.creation_time, 
            Rides.updated_at, 
            Rides.current_riders;
    """


    values = (str(netid),)
    rides = []
    
    conn = connect()
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command, values)
                rides = cursor.fetchall()
                print("Rides retrieved successfully!")
        except Exception as e:
            print(f"Error retrieving rides: {e}")
        finally:
            conn.close()
    else:
        print("Connection not established.")

    return rides

def get_all_rides():
    sql_command = "SELECT id, admin_netid, max_capacity, origin, destination, arrival_time, status, creation_time, updated_at, current_riders FROM Rides"
    conn = connect()

    rides = []

    # if it was successful connection, execute SQL commands to database & commit
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command)
                rides = cursor.fetchall()
                print("Rides retrieved successfully!")
        except Exception as e:
            print(f"Error retrieving rides: {e}")
        finally:
            conn.close()
    else:
        print("Connection not established.")

    return rides


def get_all_locations():
    sql_command = "SELECT * FROM PredefinedLocations"
    conn = connect()

    locations = []

    # if it was successful connection, execute SQL commands to database & commit
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command)
                locations = cursor.fetchall()
                print("Locations retrieved successfully!")
        except Exception as e:
            print(f"Error retrieving locations: {e}")
        finally:
            conn.close()
    else:
        print("Connection not established.")

    return locations

def search_rides(origin, destination, arrival_time=None):
    query = """
        SELECT id, admin_netid, max_capacity, origin, destination, arrival_time, status, creation_time, updated_at, current_riders FROM Rides
        WHERE origin = %s AND destination = %s
    """

    conn = connect()
    values = [origin, destination]

    # if user also searched for arrival_time
    if arrival_time:
        # for now: searching for EARLIER arrival time than given
        query += " AND arrival_time <= %s"
        values.append(arrival_time)

    if conn:
        try: 
            with conn.cursor() as cursor:
                cursor.execute(query, values)
                rides = cursor.fetchall()
                cursor.close()
                conn.close()
        except Exception as e:
            print(f"Error retrieving locations: {e}")
        finally:
            conn.close()
    else:
        print("Connection not established.")

    return rides

def get_users_requested_rides(netid):
    """
    Get all of a user's REQUESTED rides from RideRequests database
    """
    
    sql_command = """
        SELECT id, admin_netid, max_capacity, origin, destination, 
            arrival_time, status, creation_time, updated_at, 
            current_riders 
        FROM Rides 
        WHERE id IN (
            SELECT ride_id FROM RideRequests WHERE netid = %s
        );
        """

    values = (str(netid),)
    req_rides = []
    
    conn = connect()
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command, values)
                req_rides = cursor.fetchall()
                print("RideRequests retrieved successfully!")
        except Exception as e:
            print(f"Error retrieving ride requests: {e}")
        finally:
            conn.close()
    else:
        print("Connection not established.")

    return req_rides

def delete_ride_request(netid, ride_id):
    """
    Deletes row with ride of ride_id & User of netid from RideRequests
    """
    sql_command = """
        DELETE FROM RideRequests
        WHERE netid = %s AND ride_id = %s;
    """

    values = (str(netid), ride_id)

    conn = connect()
    
    # if it was successful connection, execute SQL commands to database & commit
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command, values)
                conn.commit()
                print("RideRequest deleted successfully!")
        except Exception as e:
            print(f"Error deleting ride: {e}")
        finally:
            conn.close()
    else:
        print("Connection not established.")

if __name__ == "__main__":
    database_setup()
