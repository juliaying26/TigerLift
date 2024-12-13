import os
from flask import Flask, redirect, request, jsonify, send_from_directory, abort
import database
from casclient import CASClient
from dotenv import load_dotenv
load_dotenv() 
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone
from psycopg2.extras import Json

app = Flask(__name__, template_folder='../frontend', static_folder='../frontend/dist')
app.secret_key = os.environ.get('APP_SECRET_KEY')
_cas = CASClient()

FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
FRONTEND_URL = '' if FLASK_ENV == 'production' else 'http://localhost:5173'

# FOR TESTING -- change to False if you don't want emails sent
app.EMAILS_ON = os.environ.get('EMAILS_ON', "False").lower() == "true"

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    if path.startswith('api/'):
        return abort(404)
    
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/isloggedin', methods=['GET'])
def isloggedin():
    return jsonify({'is_logged_in': _cas.is_logged_in(), 'user_info': _cas.getUserInfo()})

@app.route('/api/login', methods=['GET'])
def login():
    """
    Log users into TigerLift

    Parameters:
        None

    Returns:
        Redirects users to the AllRides page upon logging in
    """
    user_info = _cas.authenticate() # This will redirect to CAS login page if not logged in
    return redirect(f"{FRONTEND_URL}/allrides")

@app.route("/api/logout", methods=["GET"])
def logout():
    """
    Log users out of TigerLift.

    Parameters:
        None

    Returns:
        Redirects users to our login page.
    """
    _cas.logout()
    return redirect("/")

@app.route('/api/dashboard', methods=['GET'])
def api_dashboard():
    """
    Retrieve all rideshares.

    Parameters:
        None

    Returns:
        JSON: user information provided by CAS, all the rides, and
              a mapping of available and upcoming rideshares, sorted by
              upcoming date
    """

    user_info = _cas.authenticate()
    rides = database.get_all_rides()
    ridereqs = database.get_all_my_ride_requests(user_info['netid'])
    current_time = datetime.now(timezone.utc)
    current_time = current_time.replace(tzinfo=None)
    
    # Create the mapping for rides array 
    updated_rides = []
    for ride in rides:
        updated_ride = {
            'id': ride[0],
            'admin_netid': ride[1],
            'admin_name': ride[2],
            'admin_email': ride[3],
            'max_capacity': ride[4],
            'origin': ride[5],
            'destination': ride[6],
            'arrival_time': ride[7],
            'creation_time': ride[8],
            'updated_at': ride[9],
            'current_riders': ride[10],
            'note': ride[11]
        }

        if updated_ride['arrival_time'] > current_time and len(updated_ride['current_riders']) < updated_ride['max_capacity']:
            updated_rides.append(updated_ride)

    updated_rides.sort(key=lambda ride: ride['arrival_time'])
    
    ridereqs_map = {}
    for ridereq in ridereqs:
        ridereqs_map[ridereq[1]] = ridereq[2]

    return jsonify({
        'user_info': user_info,
        'rides': updated_rides,
        'ridereqs': ridereqs_map
    })

@app.route('/api/myrides', methods=['GET'])
def get_my_rides():
    """
    Retrieve all rideshares associated with a specific user.

    Parameters:
        None

    Returns:
        JSON: user information provided by CAS, mappings of a user's 
              upcoming and past posted rides, and mappings of a user's 
              upcoming and past rideshares.
    """
    user_info = _cas.authenticate()
    myrides = database.get_users_rides(user_info['netid'])
    myreqrides = database.get_users_requested_rides(user_info['netid'])
    current_time = datetime.now(timezone.utc)
    current_time = current_time.replace(tzinfo=None)

    my_rides = []
    past_my_rides = []

    # Create the mapping for rides array 
    for ride in myrides:
        updated_ride = {
            'id': ride[0],
            'admin_netid': ride[1],
            'admin_name': ride[2],
            'admin_email': ride[3],
            'max_capacity': ride[4],
            'origin': ride[5],
            'destination': ride[6],
            'arrival_time': ride[7],
            'creation_time': ride[8],
            'updated_at': ride[9],
            'note': ride[10],
            'current_riders': ride[11],
            'requested_riders': ride[12],
        }
        
        if updated_ride['arrival_time'] > current_time:
            my_rides.append(updated_ride)
        else:
            past_my_rides.append(updated_ride)

    my_req_rides = []
    past_my_req_rides = []

    for ride in myreqrides:
        updated_ride = {
            'id': ride[0],
            'admin_netid': ride[1],
            'admin_name': ride[2],
            'admin_email': ride[3],
            'max_capacity': ride[4],
            'origin': ride[5],
            'destination': ride[6],
            'arrival_time': ride[7],
            'creation_time': ride[8],
            'updated_at': ride[9],
            'note': ride[10],
            'current_riders': ride[11],
            'request_status': ride[12],
        }

        if updated_ride['arrival_time'] > current_time:
            my_req_rides.append(updated_ride)
        else:
            past_my_req_rides.append(updated_ride)

    my_rides.sort(key=lambda ride: ride['arrival_time'])
    past_my_rides.sort(key=lambda ride: ride['arrival_time'], reverse=True)
    my_req_rides.sort(key=lambda ride: ride['arrival_time'])
    past_my_req_rides.sort(key=lambda ride: ride['arrival_time'], reverse=True)

    past_my_req_rides = [ride for ride in past_my_req_rides if ride['request_status'] == 'accepted']

    return jsonify({
        'user_info': user_info,
        'upcoming_posted_rides': my_rides,
        'past_posted_rides': past_my_rides,
        'upcoming_requested_rides': my_req_rides,
        'past_requested_rides': past_my_req_rides,
    })

@app.route("/api/addride", methods=["POST"])
def addride():
    """
    Adds a rideshare to the database.

    Parameters:
        capacity: the capacity of the rideshare
        origin: a dictionary containing the origin location
        dest: a dictionary containing the destination location
        arrival_time: a datetime object with the arrival date & time
        note (optional): note with the rideshare
    
    Returns:
        JSON: a success message
        400: if unable to create rideshare
    """
    user_info = _cas.authenticate()
    data = request.get_json()
    capacity = data.get('capacity')

    origin_obj = data.get('origin')
    dest_obj = data.get('destination')

    note = data.get('note')
    
    origin_addr = origin_obj['formatted_address']
    origin_name = origin_obj['name']
    origin_id = origin_obj['place_id']

    dest_addr = dest_obj['formatted_address']
    dest_name = dest_obj['name']
    dest_id = dest_obj['place_id']

    origin = {'address': origin_addr,
              'name': origin_name,
              'id': origin_id}
    
    dest = {'address': dest_addr,
            'name': dest_name,
            'id': dest_id}

    arrival_time = data.get('arrival_time')

    origin_json = Json(origin)
    dest_json = Json(dest)

    try:
        database.create_ride(user_info['netid'], user_info['displayname'], user_info['mail'], capacity, origin_json, dest_json, arrival_time, note)
        return jsonify({'success': True, 'message': 'Rideshare successfully created!'})
    except:
        return jsonify({'success': False, 'message': 'Failed to create rideshare.'}), 400

@app.route("/api/deleteride", methods=["POST"])
def deleteride():
    """
    Deletes a rideshare from the database and notifies riders of the deletion.

    Parameters:
        rideid: a unique identifier for each rideshare.
    
    Returns:
        JSON: a success message
        400: if unable to delete rideshare
    """

    user_info = _cas.authenticate()
    data = request.get_json()
    rideid = data.get('rideid')

    try:
       database.delete_ride(str(user_info['netid']), rideid)     
    except:
        return jsonify({'success': False, 'message': 'Failed to delete rideshare.'}), 400

    try:
        subject = "🚗 Your Rideshare has been canceled."
        formatted_arrival_time = data.get('formatted_arrival_time')
        origin_name = data.get('origin_name')
        destination_name = data.get('destination_name')
        deleteRideMessage = data.get('deleteRideMessage')
        message = "The rideshare from " + origin_name + " to " + destination_name + " scheduled for " + formatted_arrival_time + " has been canceled.\n"
        if deleteRideMessage:
            message += "Provided reason: " + deleteRideMessage + "\n"
        else:
            message += "No reason provided."

        current_riders = data.get('current_riders')
        for rider in current_riders:
            netid = rider[0]
            mail = rider[2]
            send_email_notification(netid, mail, subject, message)

        return jsonify({'success': True, 'message': 'Rideshare successfully deleted.'})

    except:
        return jsonify({'success': False, 'message': 'Failed to email rider(s).'}), 400
  
 
@app.route("/api/cancelriderequest", methods=["POST"])
def cancelriderequest():
    """
    Deletes the rideshare request from the database.

    Parameters:
        rideid: a unique identifier for each rideshare.
    
    Returns:
        JSON: a success message
        400: if unable to cancel rideshare request
    """
    user_info = _cas.authenticate()
    data = request.get_json()
    rideid = data.get('rideid')
    try:
        database.delete_ride_request(str(user_info['netid']), rideid)
        return jsonify({'success': True, 'message': 'Rideshare request canceled.'})
    except:
        return jsonify({'success': False, 'message': 'Failed to cancel ride request.'}), 400

@app.route("/api/searchrides", methods=["GET"])
def searchrides():
    """
    Filters out rides that match the given parameters. One of origin or
    destination must be given.

    Parameters:
        arrival_time (optional): a datetime object
        start_search_time (optional): a datetime object
        origin (optional): the id corresponding to the origin, given by 
                           Maps API
        destination (optional): the id corresponding to the destination,
                                given by Maps API
    
    Returns:
       JSON: user information given by CAS, all rides returned from the 
             database that match search criteria, a mapping of available 
             and upcoming rideshares that match the search criteria, sorted 
             by ascending arrival time
       400: If both origin and destination not provided
    """

    user_info = _cas.authenticate()
    arrival_time = request.args.get('arrival_time')
    start_search_time = request.args.get('start_search_time')
    origin = request.args.get('origin')
    destination = request.args.get('destination')
    
    if not origin and not destination and not arrival_time and not start_search_time:
        return jsonify({"error": "You must provide at least one of origin, destination, start time, or end time."}), 400

    rides = database.search_rides(origin, destination, arrival_time, start_search_time)
    ridereqs = database.get_all_my_ride_requests(user_info['netid'])

    current_time = datetime.now(timezone.utc)
    current_time = current_time.replace(tzinfo=None)
    
    # Create the mapping for rides array 
    updated_rides = []
    for ride in rides:
        updated_ride = {
            'id': ride[0],
            'admin_netid': ride[1],
            'admin_name': ride[2],
            'admin_email': ride[3],
            'max_capacity': ride[4],
            'origin': ride[5],
            'destination': ride[6],
            'arrival_time': ride[7],
            'creation_time': ride[8],
            'updated_at': ride[9],
            'current_riders': ride[10],
            'note': ride[11]
        }

        if updated_ride['arrival_time'] > current_time and len(updated_ride['current_riders']) < updated_ride['max_capacity']:
            updated_rides.append(updated_ride)

    updated_rides.sort(key=lambda ride: ride['arrival_time'])

    ridereqs_map = {}
    for ridereq in ridereqs:
        ridereqs_map[ridereq[1]] = ridereq[2]

    return jsonify({
        'user_info': user_info,
        'rides': updated_rides,
        'ridereqs': ridereqs_map
    })

@app.route("/api/requestride", methods=["POST"])
def requestride():
    """
    Adds a ride request to the database and notifies the rideshare admin.

    Parameters:
        rideid: a unique identifier for each rideshare.
    
    Returns:
        JSON: a success message
        400: if unable to create or email the rideshare request

    """
    user_info = _cas.authenticate()
    data = request.get_json()
    rideid = data.get('rideid')
    origin_name = data.get('origin_name')
    destination_name = data.get('destination_name')
    formatted_arrival_time = data.get('formatted_arrival_time')
    if not rideid:
        return jsonify({'success': False, 'message': 'Ride ID is required'}), 400

    try:
        database.create_ride_request(str(user_info['netid']), str(user_info['displayname']), str(user_info['mail']), rideid)

        try: 
            admin_info = database.rideid_to_admin_id_email(rideid)
            subject = '🚗 ' + user_info['displayname'] + ' requested to join your Rideshare!'
            message = user_info['displayname'] + ' requested to join your Rideshare from ' + origin_name + ' to ' + destination_name + ' on ' + formatted_arrival_time + '!\n'
            send_email_notification(str(admin_info[0]), str(admin_info[1]), subject, message)
        except:
            return jsonify({'success': False, 'message': 'Failed to email ride request'}), 400

        return jsonify({'success': True, 'message': 'Ride request created!'})
    except:
        return jsonify({'success': False, 'message': 'Failed to create ride request.'}), 400
    
@app.route("/api/batchupdateriderequest", methods=["POST"])
def batchupdateriderequest():
    """
    Handles managing rideshare operations -- acceping/rejecting
    rideshare requests, removing rideshares, changing arrival time and/or,
    capacity of a rideshare. Notifies riders of changes.

    Parameters:
        rideid: a unique identifier for each rideshare
        changed_time (optional): the new rideshare arrival time
        new_capacity (optional): the new rideshare capacity
        accepted_riders (optional): a list of accepted riders
    
    Returns:
        JSON: a success message
        400: if unable to perform the updates or send out email notifications

    """
    
    user_info = _cas.authenticate()

    try:
        data = request.get_json()
        rideid = data.get('rideid')

        changedTime = data.get('changedTime')
        formatted_arrival_time = data.get('formatted_arrival_time')
        origin_name = data.get('origin_name')
        destination_name = data.get('destination_name')
        capacity = data.get('new_capacity')
        new_arrival_time = data.get('new_arrival_time')

        # For time only
        time_subject =  "🚗 The Arrival Time of your Rideshare has been changed!"
        time_message = "Your Rideshare from " + origin_name + " to " + destination_name + " has changed arrival time to " + formatted_arrival_time + ".\n"  

        for rider in data.get('accepting_riders'):
            requester_id = rider.get('requester_id')
            full_name = rider.get('full_name')
            mail = rider.get('mail')
            status = database.accept_ride_request(requester_id, full_name, mail, rideid)

            # if status is True (meaning new ride request was created)
            if status:
                # send email to accepted rider
                subject = "🚗 Your request to join a Rideshare was accepted!"
                message = "Your request to join the Rideshare from " + origin_name + " to " + destination_name + " on " + formatted_arrival_time + " was recently accepted!\n"
                send_email_notification(requester_id, mail, subject, message)
            
            if changedTime:    
                send_email_notification(requester_id, mail, time_subject, time_message)

        for rider in data.get('rejecting_riders'):
            requester_id = rider.get('requester_id')
            database.reject_ride_request(requester_id, rideid)

        for rider in data.get('pending_riders'):
            requester_id = rider.get('requester_id')
            full_name = rider.get('full_name')
            mail = rider.get('mail')
            database.remove_rider(requester_id, full_name, mail, rideid)

        if capacity:
            database.update_capacity(rideid, capacity)

        if changedTime:
            database.update_arrival_time(rideid, new_arrival_time)

        return jsonify({'success': True, 'message': 'Rideshare successfully updated!'})
    except:
        return jsonify({'success': False, 'message': 'Failed to update rideshare.'}), 400

@app.route("/api/notifications", methods=["GET"])
def notifications():
    """"
    Retrievers a user's notifications.

    Parameters:
        None

    Returns:
        JSON: a mapping of a user's new notifications and old notifications 
        400: if CAS authentication exception occurs/cannot authenticate
        500: if database exception occurs
    """
    user_info = _cas.authenticate() 
    netid = user_info['netid']

    if not netid:
        return jsonify({"error": "Missing netid parameter"}), 400
    
    try: 
        response = database.get_user_notifs(netid)
        new_notifs = [notif for notif in response if not notif[4]]
        past_notifs = [notif for notif in response if notif[4] == 'read']
        return jsonify({"new_notifs": new_notifs,
                        "past_notifs": past_notifs}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/api/readnotification", methods=["POST"])
def mark_as_read():
    """
    Marks a notification as read, i.e. it becomes a past notification

    Parameters:
        notifid: a unique identifier for each notification.
    
    Returns:
        JSON: a success message
        400: if database exception

    """
    user_info = _cas.authenticate()
    data = request.get_json()
    notif_id = data.get('notif_id')
    try:
        database.read_notification(user_info['netid'], notif_id)
        return jsonify({'success': True, 'message': 'Notification marked as read'})
    except:
        return jsonify({'success': False, 'message': 'Failed to mark notification as read'}), 400
    
@app.route("/api/markallread", methods=["POST"])
def mark_all_as_read():
    """
    Marks all of a user's notifications as read, i.e. they become past notifications

    Parameters:
        None
    
    Returns:
        JSON: a success message
        400: if database exception

    """
    user_info = _cas.authenticate()
    try:
        database.read_all_users_notifications(user_info['netid'])
        return jsonify({'success': True, 'message': 'All notifications marked as read'})
    except:
        return jsonify({'success': False, 'message': 'Failed to mark all notifications as read'}), 400

def send_email_notification(netid, mail, subject, message):
    """
    Sends email notifications

    Parameters:
        netid: netid of sender
        mail: email address of sender
        subject: subject of the email
        message: content of the email

    Returns:
        JSON: success 
        400: unable to send emails
    """

    user_info = _cas.authenticate()

    if not app.EMAILS_ON:
        return jsonify({'success': True, 'message': 'EMAILS_ON set to False'})

    try:
        # if mail is empty for some reason, use netid @ princeton.edu
        if not mail:
            mail = netid + "@princeton.edu"

        from_email = os.environ.get('EMAIL_ADDRESS')
        from_password = os.environ.get('EMAIL_PASSWORD')

        # Add this message to notifications table
        try:
            database.add_notification(netid, subject, message)
        except Exception as e:
            print(f"Error adding to notifications table: {e}")

        # Set up the email
        msg = MIMEMultipart()
        msg['From'] = from_email
        msg['To'] = mail
        msg['Subject'] = subject
        # Attach the message
        message = message + "Please see details on tigerlift.onrender.com\n"
        msg.attach(MIMEText(message, 'plain'))

        try:
            # Connect to the SMTP server and send the email
            with smtplib.SMTP('smtp.gmail.com', 587) as server:
                server.starttls()  # Secure the connection
                server.login(from_email, from_password)
                server.send_message(msg)
            return jsonify({'success': True, 'message': 'Ride request created'})
        except Exception as e:
            print(f"Error sending email to {mail}: {e}")
            return jsonify({'success': False, 'message': 'Failed to send emails'}), 400

    except Exception as e:
         return jsonify({'success': False, 'message': 'Failed to send emails'}), 400

if __name__ == "__main__":
    if not app._got_first_request:
        database.database_setup()
    app.run(host="0.0.0.0", port=3100, debug=True)