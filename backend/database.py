import os
import psycopg2
import json
from dotenv import load_dotenv
load_dotenv()
from datetime import datetime

DATABASE_URL = os.environ.get('DATABASE_URL')

def database_setup():
    """
    Sets up the DB for first time-use
    """

    sql_commands = """

        CREATE TABLE IF NOT EXISTS Rides (
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
            current_riders TEXT[][],
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
            netid VARCHAR(10),
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
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

def create_ride(admin_netid, admin_name, admin_email, max_capacity, origin, destination, arrival_time, note=""):
    """
    Adds a ride to the Rides database
    """

    current_riders = []

    sql_command = f"""
        INSERT INTO Rides (admin_netid, admin_name, admin_email, max_capacity, current_riders,
        origin_dict, destination_dict, arrival_time, note) VALUES (%s, %s, %s, %s, 
        %s, %s, %s, %s, %s);   
    """

    values = (admin_netid, admin_name, admin_email, max_capacity, current_riders, origin, destination, 
              arrival_time, note)  
    
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

# def update_ride(ride_id, current_riders, max_capacity=None, origin=None, destination=None, 
#                 arrival_time=None):
#     """"
#     Updates an existing ride in the Rides database
#     """

#     # NEED TO FIX TO DEAL WITH INJECTION ATTACKS!!!
  
#     sql_command = f"""
#         UPDATE Rides
#         SET updated_at = CURRENT_TIMESTAMP
#     """

#     if max_capacity != None:
#         sql_command += f""", max_capacity = {max_capacity}"""
#     if origin != None:
#         sql_command += f""", origin = {origin}, """
#     if destination != None:
#         sql_command += f""", destination = {destination}"""
#     if arrival_time != None:
#         sql_command += f""", arrival_time = {arrival_time}"""

#     sql_command += f""" WHERE id = {ride_id};"""

#     conn = connect()
    
#     # if it was successful connection, execute SQL commands to database & commit
#     if conn:
#         try:
#             with conn.cursor() as cursor:
#                 cursor.execute(sql_command)
#                 conn.commit()
#                 print("Ride updated successfully!")
#         except Exception as e:
#             print(f"Error updating ride: {e}")
#         finally:
#             conn.close()
#     else:
#         print("Connection not established.")

def delete_ride(netid, ride_id):
    """
    Delete a ride in the Rides database and any associated Ride Requests
    """

    ride_sql_command = """ 
        DELETE FROM Rides
        WHERE admin_netid = %s AND id = %s;
    """

    ride_values = (netid, ride_id)

    ride_request_sql_command = """
        DELETE FROM RideRequests
        WHERE ride_id = %s;
    """

    ride_request_values = (ride_id,)

    conn = connect()
    
    # if it was successful connection, execute SQL commands to database & commit
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(ride_request_sql_command, ride_request_values)
                cursor.execute(ride_sql_command, ride_values)
                conn.commit()
                print("Ride deleted successfully!")
        except Exception as e:
            print(f"Error deleting ride: {e}")
        finally:
            conn.close()
    else:
        print("Connection not established.")


def create_ride_request(netid, full_name, mail, ride_id):
    """"
    Adds a ride request in the RidesRequest database
    """

    status = 'pending'
    
    # check whether exists
    sql_exists_check = """
        SELECT 1 FROM RideRequests WHERE netid = %s AND ride_id = %s;
    """

    sql_command = f"""
        INSERT INTO RideRequests (netid, full_name, mail, ride_id, status, request_time) VALUES (%s, %s, %s, 
        %s, %s, CURRENT_TIMESTAMP);
    """

    values = (netid, full_name, mail, ride_id, status)
    
    conn = connect()
    
    # if it was successful connection, execute SQL commands to database & commit
    if conn:
        try:
            with conn.cursor() as cursor:
                # check if exists
                cursor.execute(sql_exists_check, (netid, ride_id))
                if cursor.fetchone() is not None:
                    print("Request already exists.")
                    return

                # else execute
                cursor.execute(sql_command, values)
                conn.commit()
                print("Ride request addded successfully!")


        except Exception as e:
            print(f"Error adding ride request: {e}")
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


def update_capacity(rideid, new_capacity):
    """
    Updates the capacity of a ride
    """

    sql_command = f"""
        UPDATE Rides
        SET max_capacity = %s
        WHERE id = %s;
    """

    values = (new_capacity, rideid)

    conn = connect()

    # if it was successful connection, execute SQL commands to database & commit
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command, values)
                conn.commit()
                print("Ride capacity updated successfully!")
        except Exception as e:
            print(f"Error updating ride capacity: {e}")
        finally:
            conn.close()


def update_arrival_time(rideid, new_arrival_time):
    """
    Updates the arrival time of a ride
    """
    sql_command = f"""
        UPDATE Rides
        SET arrival_time = %s
        WHERE id = %s;
    """
    values = (new_arrival_time, rideid)
    conn = connect()
    # if it was successful connection, execute SQL commands to database & commit
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command, values)
                conn.commit()
                print("Ride arrival time updated successfully!")
        except Exception as e:
            print(f"Error updating ride arrival time: {e}")
        finally:
            conn.close()

# def create_location(id, name):
#     """
#     Adds a location in the Locations database
#     """

#     sql_command = f"""
#         INSERT INTO PredefinedLocations (id, name) VALUES (%s, %s);        
#     """

#     values = (id, name)
    
#     conn = connect()
    
#     # if it was successful connection, execute SQL commands to database & commit
#     if conn:
#         try:
#             with conn.cursor() as cursor:
#                 cursor.execute(sql_command, values)
#                 conn.commit()
#                 print("Location created successfully!")
#         except Exception as e:
#             print(f"Error creating location: {e}")
#         finally:
#             conn.close()
#     else:
#         print("Connection not established.")

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

    sql_command = """
        SELECT 
            Rides.id, 
            Rides.admin_netid, 
            Rides.admin_name,
            Rides.admin_email,
            Rides.max_capacity, 
            Rides.origin_dict, 
            Rides.destination_dict, 
            Rides.arrival_time, 
            Rides.creation_time, 
            Rides.updated_at, 
            Rides.note,
            Rides.current_riders, 
            COALESCE(ARRAY_AGG(
                CASE 
                    WHEN RideRequests.netid IS NULL THEN NULL 
                    ELSE ARRAY[RideRequests.netid, RideRequests.full_name, RideRequests.mail]
                END
            ) FILTER (WHERE RideRequests.netid IS NOT NULL), ARRAY[]::text[][]) AS riderequesters
        FROM 
            Rides 
        LEFT JOIN 
            RideRequests ON RideRequests.ride_id = Rides.id AND RideRequests.status = 'pending'
        WHERE 
            Rides.admin_netid = %s
        GROUP BY 
            Rides.id, 
            Rides.admin_netid, 
            Rides.admin_name,
            Rides.admin_email,
            Rides.max_capacity, 
            Rides.origin_dict, 
            Rides.destination_dict, 
            Rides.arrival_time, 
            Rides.creation_time, 
            Rides.updated_at, 
            Rides.note,
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
    
    sql_command = """
    SELECT id, admin_netid, admin_name, admin_email, max_capacity, origin_dict,
    destination_dict, arrival_time, creation_time, updated_at, current_riders, note FROM Rides
    """
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


# def get_all_locations():
#     sql_command = "SELECT * FROM PredefinedLocations"
#     conn = connect()

#     locations = []

#     # if it was successful connection, execute SQL commands to database & commit
#     if conn:
#         try:
#             with conn.cursor() as cursor:
#                 cursor.execute(sql_command)
#                 locations = cursor.fetchall()
#                 print("Locations retrieved successfully!")
#         except Exception as e:
#             print(f"Error retrieving locations: {e}")
#         finally:
#             conn.close()
#     else:
#         print("Connection not established.")

#     return locations

def search_rides(origin_id, destination_id, arrival_time=None, start_search_time=None):
    query = """
        SELECT id, admin_netid, admin_name, admin_email, max_capacity, origin_dict, 
        destination_dict, arrival_time, creation_time, updated_at, current_riders, note FROM Rides
        WHERE 1=1
    """

    conn = connect()
    values = []

    if origin_id:
        query += " AND origin_dict->>'id' = %s"
        values.append(origin_id)
    if destination_id:
        query += " AND destination_dict->>'id' = %s"
        values.append(destination_id)

    # start_search_time is arrive after
    if start_search_time:
        query += " AND arrival_time >= %s"
        values.append(start_search_time)
    else:
        query += " AND arrival_time >= %s"
        values.append(datetime.now())
    # arrival_time is arrive before
    if arrival_time:
        query += " AND arrival_time <= %s"
        values.append(arrival_time)

    if not (origin_id or destination_id):
        raise ValueError("At least one of 'origin' or 'destination' must be provided.")

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
    Get all of a user's REQUESTED rides from RideRequests database and its associated status
    """
    
    sql_command = """
        SELECT Rides.id, admin_netid, admin_name, admin_email, max_capacity, origin_dict, destination_dict, 
            arrival_time, creation_time, updated_at, note, 
            current_riders, RideRequests.status as ride_request_status
        FROM Rides
        JOIN RideRequests ON Rides.id = RideRequests.ride_id
        WHERE RideRequests.netid = %s;
        """

    values = (str(netid),)
    req_rides = []
    
    conn = connect()
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command, values)
                req_rides = cursor.fetchall()
                print("riderequests are", req_rides)
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

def accept_ride_request(user_netid, full_name, mail, ride_id):
    """
    Accepts a ride request and updates current_riders in Rides.
    Returns False if user with user_netid already has a ride
    request in that ride. Else returns True if new ride_request
    is successfully created for user with
    """

    # checks status of ride request
    sql_command_check_status = """
        SELECT status
        FROM RideRequests
        WHERE netid = %s AND ride_id = %s
    """
    values_check_status = (user_netid, ride_id)

    request_status = None
    conn = connect()

    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command_check_status, values_check_status)
                result = cursor.fetchone()
                if result:
                    request_status = result[0]
                    if request_status == 'accepted':
                        return False
        except Exception as e:
            print(f"Error checking ride request status: {e}")
        finally:
            conn.close()

    if request_status != 'accepted':
        update_ride_requests_sql_command = """
            UPDATE RideRequests
            SET status = 'accepted', response_time = CURRENT_TIMESTAMP
            WHERE netid = %s AND ride_id = %s;
            """

        ride_request_values = (user_netid, ride_id)

        update_rides_sql_command = """
            UPDATE Rides
            SET current_riders = array_cat(current_riders, ARRAY[ARRAY[%s, %s, %s]]), 
            updated_at = CURRENT_TIMESTAMP
            WHERE id = %s;
        """

        ride_values = (user_netid, full_name, mail, ride_id)

        conn = connect()
        
        # if it was successful connection, execute SQL commands to database & commit
        if conn:
            try:
                with conn.cursor() as cursor:
                    cursor.execute(update_ride_requests_sql_command, ride_request_values)
                    cursor.execute(update_rides_sql_command, ride_values)
                    conn.commit()
                    print("RideRequest accepted successfully!")
                                        
            except Exception as e:
                print(f"Error accepting ride request: {e}")
            finally:
                conn.close()
        else:
            print("Connection not established.")
    return True

# SHOULD THIS AUTO DELETE AFTER A WHILE??? OR ACTUALLY DELETE THE REQUEST INSTEAD OF REJECTING?
#  OR IS A USER WHO IS REJECTED THEREFORE BANNED FROM REQUESTING AGAIN
def reject_ride_request(user_netid, ride_id):
    """
    Rejects a ride request
    """
    sql_command = """
        UPDATE RideRequests
        SET status = 'rejected', response_time = CURRENT_TIMESTAMP
        WHERE netid = %s AND ride_id = %s AND status != 'rejected';
        """

    values = (user_netid, ride_id)

    conn = connect()
    
    # if it was successful connection, execute SQL commands to database & commit
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command, values)
                conn.commit()
                print("RideRequest rejected successfully!")
        except Exception as e:
            print(f"Error rejecting ride request: {e}")
        finally:
            conn.close()
    else:
        print("Connection not established.")

    
def get_all_my_ride_requests(netid):
    sql_command = """
            SELECT netid, ride_id, status FROM RideRequests
            WHERE netid = %s;
    """
    requests = []
    values = (netid,)
    
    conn = connect()
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command, values)
                requests = cursor.fetchall()
                print("Ride requests retrieved successfully!")
        except Exception as e:
            print(f"Error retrieving requests: {e}")
        finally:
            conn.close()
    else:
        print("Connection not established.")

    return requests

def remove_rider(requester_id, full_name, mail, ride_id):
    """
    Rejects a ride request and moves it back into 'Manage Rides' as a pending ride request
    """

    print("INTO remove_rider function now!")
    print("Requester id is ", requester_id)
    print("Ride id is ", ride_id)
    print("Mail is", mail)
    print("Full name is", full_name)

    sql_command_ride_requests = """
        UPDATE RideRequests
        SET status = 'pending', response_time = CURRENT_TIMESTAMP
        WHERE netid = %s AND ride_id = %s AND status = 'accepted';
        """
    values_ride_requests = (requester_id, ride_id)

    conn = connect()
    
    # if it was successful connection, execute SQL commands to database & commit
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command_ride_requests, values_ride_requests)
                conn.commit()
                print("RideRequest removed into PENDING successfully!")
        except Exception as e:
            print(f"Error removing ride request: {e}")

        try:
            with conn.cursor() as cursor:

                cursor.execute("SELECT current_riders FROM Rides WHERE id = %s;", (ride_id,))
                result = cursor.fetchone()

                if result is None:
                    print(f"No record found for ride_id {ride_id}")
                    return

                current_riders = result[0]  # This should be a 2D array (list of lists)

                # Remove the matching sub-array from current_riders
                print("Original current_riders:", current_riders)
                current_riders = [rider for rider in current_riders if not (
                    rider[0] == requester_id and rider[1] == full_name and rider[2] == mail
                )]
                print("Modified current_riders:", current_riders)

                # Step 3: Update the table with the modified current_riders
                cursor.execute(
                    "UPDATE Rides SET current_riders = %s WHERE id = %s;",
                    (current_riders, ride_id)
                )
                conn.commit()
                print("Ride's current_riders updated successfully!")
        except Exception as e:
            print(f"Error updating current_riders: {e}")
        finally:
            conn.close()
    else:
        print("Connection not established.")


# def location_to_id(location):    
#     """
#     given location name, returns ID from PredefinedLocations.
#     """
#     sql_command = "SELECT id FROM PredefinedLocations WHERE name = %s"
#     values = (location,)
#     id_result = None
#     print(location)

#     conn = connect()
#     if conn:
#         try:
#             with conn.cursor() as cursor:
#                 cursor.execute(sql_command, values)
#                 result = cursor.fetchone()
#                 if result:
#                     id_result = result[0]
#                     print("id retrieved successfully:", id_result)
#                 else:
#                     print("No matching location found.")
#                     return -1
#         except Exception as e:
#             print(f"Error retrieving requests: {e}")
#         finally:
#             conn.close()
#     else:
#         print("Connection not established.")

#     print("ID corresponding to num is", id_result)
#     return int(id_result)

# def id_to_location(id):
#     """
#      Given id, returns location name from PredefinedLocations
#     """
#     sql_command = "SELECT name FROM PredefinedLocations WHERE id = %s"
#     values = (id,)
#     location_result=None

#     conn = connect()
#     if conn:
#         try:
#             with conn.cursor() as cursor:
#                 cursor.execute(sql_command, values)
#                 result = cursor.fetchone()
#                 if result:
#                     location_result = result[0]
#                     print("location retrieved successfully:", location_result)
#                 else:
#                     print("No matching location found.")
#         except Exception as e:
#             print(f"Error retrieving requests: {e}")
#         finally:
#             conn.close()
#     else:
#         print("Connection not established.")

#     print("ID corresponding to num is", location_result)
#     return int(location_result)

def rideid_to_admin_id_email(ride_id):
    """
    Given a rideid, returns admin_netid and email
    """
    sql_command = "SELECT admin_netid, admin_email FROM Rides WHERE id = %s"
    values = (ride_id,)
    admin_netid_result = None
    admin_mail_result = None

    conn = connect()
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command, values)
                result = cursor.fetchone()
                if result:
                    admin_netid_result = result[0]
                    admin_mail_result = result[1]
                    print("Admin_netid retrieved successfully:", admin_netid_result)
                else:
                    print("No matching admin_netid found.")
        except Exception as e:
            print(f"Error retrieving admin_netid: {e}")
        finally:
            conn.close()
    else:
        print("Connection not established.")

    print("Admin_netid corresponding to ride_id is", admin_netid_result)
    return (admin_netid_result, admin_mail_result) if admin_netid_result else None

def get_user_notifs(netid):
    """
    Given user's netid, finds that user's notifs
    """
    sql_command =  """
            SELECT id, message, notification_time, subject, status
            FROM Notifications 
            WHERE netid = %s
            ORDER BY notification_time DESC
        """
    values = (netid,)
    
    conn = connect()
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command, values)
                result = cursor.fetchall()
                print(result, " is result")
                return result
        except Exception as e:
            print(f"Error fetching notifications: {e}")
            return None # meaning error
        finally:
            conn.close()
    else:
        print("Failed to establish a database connection.")
        return None
    
def add_notification(netid, subject, message):
    """
    Adds the relevant message to notification table
    """
    sql_command =  """
            INSERT INTO Notifications (netid, message, notification_time, subject)
            VALUES (%s, %s, CURRENT_TIMESTAMP, %s)
        """
    values = (netid, message, subject)
    
    conn = connect()
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command, values)
                conn.commit()
                print("Notification added successfully.")
                return True 
        except Exception as e:
            print(f"Error adding to notifications: {e}")
            return None # meaning error
        finally:
            conn.close()
    else:
        print("Failed to establish a database connection.")
        return None
    
def read_notification(netid, notif_id):
    """
    Given user's netid and notif_id, marks that notif as read
    """
    sql_command =  """
            UPDATE Notifications
            SET status = 'read'
            WHERE netid = %s AND id = %s
        """
    values = (netid, notif_id)
    
    conn = connect()
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql_command, values)
                conn.commit()
                print("Notification marked as read successfully.")
                return True
        except Exception as e:
            print(f"Error marking notification as read: {e}")
            return None # meaning error
        finally:
            conn.close()
    else:
        print("Failed to establish a database connection.")
        return None

if __name__ == "__main__":
    database_setup()
