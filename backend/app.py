import os
from flask import Flask, redirect, request, jsonify, send_from_directory, url_for, abort
import database
from casclient import CASClient
from dotenv import load_dotenv
load_dotenv() # load vars in .env file
import smtplib # library for emails
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone

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
    print("IS LOGGED IN!!!!")
    return jsonify({'is_logged_in': _cas.is_logged_in(), 'user_info': _cas.getUserInfo()})

@app.route('/api/login', methods=['GET'])
def login():
    user_info = _cas.authenticate() # This will redirect to CAS login page if not logged in
    print("user info")
    print(user_info)
    print("RIGHT BEFORE REDIRECT")
    return redirect(f"{FRONTEND_URL}/dashboard")

@app.route("/api/logout", methods=["GET"])
def logout():
    print("called log out")
    _cas.logout()
    return redirect("/")

@app.route('/api/dashboard', methods=['GET'])
def api_dashboard():
    user_info = _cas.authenticate()
    rides = database.get_all_rides()
    locations = database.get_all_locations()
    ridereqs = database.get_all_my_ride_requests(user_info['netid'])

    # mapping for location
    location_map = {location[0]: location[1] for location in locations}

    current_time = datetime.now(timezone.utc)
    current_time = current_time.replace(tzinfo=None)
    
    # mapping for rides array 
    updated_rides = []
    for ride in rides:
        updated_ride = {
            'id': ride[0],
            'admin_netid': ride[1],
            'admin_name': ride[2],
            'admin_email': ride[3],
            'max_capacity': ride[4],
            'origin': ride[5],
            'origin_name': location_map.get(ride[5], 'Unknown'),
            'destination': ride[6],
            'destination_name': location_map.get(ride[6], 'Unknown'),
            'arrival_time': ride[7],
            'creation_time': ride[8],
            'updated_at': ride[9],
            'current_riders': ride[10]
        }

        if updated_ride['arrival_time'] > current_time:
            updated_rides.append(updated_ride)

    
    ridereqs_map = {}
    for ridereq in ridereqs:
        ridereqs_map[ridereq[1]] = ridereq[2]

    return jsonify({
        'user_info': user_info,
        'rides': updated_rides,
        'locations': locations,
        'ridereqs': ridereqs_map
    })

@app.route('/api/myrides', methods=['GET'])
def get_my_rides():
    user_info = _cas.authenticate()
    myrides = database.get_users_rides(user_info['netid'])
    myreqrides = database.get_users_requested_rides(user_info['netid'])
    locations = database.get_all_locations()

    # mapping for location
    location_map = {location[0]: location[1] for location in locations}
    
    current_time = datetime.now(timezone.utc)
    current_time = current_time.replace(tzinfo=None)

    # mapping for rides array 
    my_rides = []
    past_my_rides = []

    for ride in myrides:
        updated_ride = {
            'id': ride[0],
            'admin_netid': ride[1],
            'admin_name': ride[2],
            'admin_email': ride[3],
            'max_capacity': ride[4],
            'origin': ride[5],
            'origin_name': location_map.get(ride[5], 'Unknown'),
            'destination': ride[6],
            'destination_name': location_map.get(ride[6], 'Unknown'),
            'arrival_time': ride[7],
            'creation_time': ride[8],
            'updated_at': ride[9],
            'current_riders': ride[10],
            'requested_riders':ride[11]
        }
        
        if updated_ride['arrival_time'] > current_time:
            my_rides.append(updated_ride)
        else:
            past_my_rides.append(updated_ride)

        # my_rides.append(updated_ride)

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
            'origin_name': location_map.get(ride[5], 'Unknown'),
            'destination': ride[6],
            'destination_name': location_map.get(ride[6], 'Unknown'),
            'arrival_time': ride[7],
            'creation_time': ride[8],
            'updated_at': ride[9],
            'current_riders': ride[10],
            'request_status': ride[11]
        }

        if updated_ride['arrival_time'] > current_time:
            my_req_rides.append(updated_ride)
        else:
            past_my_req_rides.append(updated_ride)

        # my_req_rides.append(updated_ride)
    
    return jsonify({
        'user_info': user_info,
        'upcoming_posted_rides': my_rides,
        'past_posted_rides': past_my_rides,
        'upcoming_requested_rides': my_req_rides,
        'past_requested_rides': past_my_req_rides,
    })

@app.route("/api/addride", methods=["POST"])
def addride():
    user_info = _cas.authenticate()
    data = request.get_json()
    capacity = data.get('capacity')

    originID = database.location_to_id(data.get('origin'))
    if originID == -1:
        print("HERE")
        database.create_location(data.get('origin'))
        originID = database.location_to_id(data.get('origin'))
    
    destID = database.location_to_id(data.get('destination'))
    if destID == -1:
        database.create_location(data.get('destination'))
        destID = database.location_to_id(data.get('destination'))

    print(originID)
    print(destID)

    arrival_time = data.get('arrival_time')

    try:
        database.create_ride(user_info['netid'], user_info['displayname'], user_info['mail'], capacity, originID, destID, arrival_time)
        return jsonify({'success': True, 'message': 'Ride successfully created!'})
    except:
        return jsonify({'success': False, 'message': 'Failed to create ride.'}), 400

@app.route("/api/deleteride", methods=["POST"])
def deleteride():
    user_info = _cas.authenticate()
    data = request.get_json()
    rideid = data.get('rideid')
    try:
       database.delete_ride(str(user_info['netid']), rideid)
       return jsonify({'success': True, 'message': 'Ride successfully deleted.'})
    except:
        return jsonify({'success': False, 'message': 'Failed to delete ride.'}), 400

@app.route("/api/cancelriderequest", methods=["POST"])
def cancelriderequest():
    user_info = _cas.authenticate()
    data = request.get_json()
    rideid = data.get('rideid')
    try:
        database.delete_ride_request(str(user_info['netid']), rideid)
        return jsonify({'success': True, 'message': 'Ride request canceled.'})
    except:
        return jsonify({'success': False, 'message': 'Failed to cancel ride request.'}), 400
    
@app.route("/addlocation", methods=["GET"])
def addlocation():
    database.create_location(1, "Princeton")
    database.create_location(2, "Airport")
    return redirect("/dashboard")

@app.route("/deletelocations", methods=["GET"])
def deletelocations():
    database.delete_all_locations()
    return redirect("/dashboard")

@app.route("/deleteallrides", methods=["GET"])
def deleteallrides():
    database.delete_all_rides()
    return redirect("/dashboard")

@app.route("/api/searchrides", methods=["GET"])
def searchrides():

    print("in search rides")
    user_info = _cas.authenticate()
    arrival_time = request.args.get('arrival_time')
    start_search_time = request.args.get('start_search_time')

    print("(JUST ADDED) ARRIVE BEFORE:", arrival_time)
    print("(JUST ADDED) ARRIVE AFTER:", start_search_time)

    origin = request.args.get('origin')
    destination = request.args.get('destination')
    if not origin and not destination:
        return jsonify({"error": "You must provide at least one of 'origin' or 'destination'"}), 400

    origin_id = database.location_to_id(origin) if origin else None
    destination_id = database.location_to_id(destination) if destination else None

    rides = database.search_rides(origin_id, destination_id, arrival_time, start_search_time)
    locations = database.get_all_locations()
    ridereqs = database.get_all_my_ride_requests(user_info['netid'])

    print(rides)

    # mapping for location
    location_map = {location[0]: location[1] for location in locations}
    
    # mapping for rides array 
    updated_rides = []
    for ride in rides:
        updated_ride = {
            'id': ride[0],
            'admin_netid': ride[1],
            'admin_name': ride[2],
            'admin_email': ride[3],
            'max_capacity': ride[4],
            'origin': ride[5],
            'origin_name': location_map.get(ride[5], 'Unknown'),
            'destination': ride[6],
            'destination_name': location_map.get(ride[6], 'Unknown'),
            'arrival_time': ride[7],
            'creation_time': ride[8],
            'updated_at': ride[9],
            'current_riders': ride[10]
        }

        updated_rides.append(updated_ride)

    ridereqs_map = {}
    for ridereq in ridereqs:
        ridereqs_map[ridereq[1]] = ridereq[2]

    print("UPDATED RIDES = ", updated_rides)

    return jsonify({
        'user_info': user_info,
        'rides': updated_rides,
        'locations': locations,
        'ridereqs': ridereqs_map
    })

@app.route("/api/requestride", methods=["POST"])
def requestride():
    user_info = _cas.authenticate()
    data = request.get_json()
    rideid = data.get('rideid')
    origin_name = data.get('origin_name')
    destination_name = data.get('destination_name')
    arrival_time = data.get('arrival_time')
    print("REQUESTING RIDE")
    if not rideid:
        return jsonify({'success': False, 'message': 'Ride ID is required'}), 400

    try:
        database.create_ride_request(str(user_info['netid']), str(user_info['displayname']), str(user_info['mail']), rideid)

        # send
        try: 
            admin_info = database.rideid_to_admin_id_email(rideid)
            print("Admin info is", admin_info)
            subject = '🚗' + str(user_info['displayname']) + ' requested to join your Rideshare!'
            message = str(user_info['displayname']) + ' requested to join your Rideshare from ' + origin_name + ' to ' + destination_name + ' on ' + arrival_time + '!'
            send_email_notification(str(admin_info[0]), str(admin_info[1]), subject, message)
        except:
            return jsonify({'success': False, 'message': 'Failed to email ride request'}), 400

        return jsonify({'success': True, 'message': 'Ride request created!'})
    except:
        return jsonify({'success': False, 'message': 'Failed to create ride request.'}), 400
    
@app.route("/api/batchupdateriderequest", methods=["POST"])
def batchupdateriderequest():
    print("IN BATCH UPDATE RIDE REQUEST")
    try:
        data = request.get_json()
        rideid = data.get('rideid')
        print(data)

        new_arrival_time = data.get('new_arrival_time')
        origin_name = data.get('origin_name')
        destination_name = data.get('destination_name')

        for rider in data.get('accepting_riders', []):
            requester_id = rider.get('requester_id')
            full_name = rider.get('full_name')
            mail = rider.get('mail')
            status = database.accept_ride_request(requester_id, full_name, mail, rideid)
            print("status is: " , status)
            # if status is True (meaning new ride request was created)
            if status:
                # send email to accepted rider
                subject = "🚗 Your Request to Join the Rideshare from " + origin_name + " to " + destination_name + " Was Accepted!"
                message = "Your request to join the Rideshare from " + origin_name + " to " + destination_name + " on " + new_arrival_time + " was recently accepted!"
                send_email_notification(requester_id, mail, subject, message)
                # PRINT
                print("SENT EMAIL NOTIF BATCH UPDATE")

        for rider in data.get('rejecting_riders', []):
            requester_id = rider.get('requester_id')
            database.reject_ride_request(requester_id, rideid)

        # send_email_notification(requester_id, mail, "Your ride request was rejected", 
        #     "Your ride request was recently rejected. Please see details at tigerlift.onrender.com")

        for rider in data.get('pending_riders', []):
            requester_id = rider.get('requester_id')
            full_name = rider.get('full_name')
            mail = rider.get('mail')
            database.remove_rider(requester_id, full_name, mail, rideid)

        if data.get('new_capacity'):
            database.update_capacity(rideid, data.get('new_capacity'))

        if data.get('new_arrival_time'):
            database.update_arrival_time(rideid, data.get('new_arrival_time'))

        return jsonify({'success': True, 'message': 'Ride successfully updated!'})
    except:
        return jsonify({'success': False, 'message': 'Failed to update ride.'}), 400
    
@app.route("/api/sendemailnotifs", methods=["POST"])
def send_email_notification():
    """
    Sends email notifications
    """
    if not app.EMAILS_ON:
        return jsonify({'success': True, 'message': 'EMAIL_ON set to False!'})

    print("EMAIL NOTIF!!")

    try:
        data = request.get_json()        
        netid = data.get('netid')
        mail = data.get('mail')
        subject = data.get('subject')
        message = data.get('message')
        # if mail is empty for some reason, use netid @ princeton.edu

        # Add this message to notifications table
        try:
            database.add_notification(netid, subject, message)
        except Exception as e:
            print(f"Error adding to notifications table: {e}")

        if not mail:
            mail = netid + "@princeton.edu"

        from_email = os.environ.get('EMAIL_ADDRESS')
        from_password = os.environ.get('EMAIL_PASSWORD')

        # Set up the email
        msg = MIMEMultipart()
        msg['From'] = from_email
        msg['To'] = mail
        msg['Subject'] = subject
        # Attach the message
        message = message + " Please see details on tigerlift.onrender.com"
        msg.attach(MIMEText(message, 'plain'))

        try:
            # Connect to the SMTP server and send the email
            with smtplib.SMTP('smtp.gmail.com', 587) as server:
                server.starttls()  # Secure the connection
                server.login(from_email, from_password)
                server.send_message(msg)
            print(f"Email sent to {mail} successfully!")
            return jsonify({'success': True, 'message': 'Email sent successfully!'})
        except Exception as e:
            print(f"Error sending email to {mail}: {e}")
            return jsonify({'success': False, 'message': 'Failed to send emails'}), 400

    except Exception as e:
         return jsonify({'success': False, 'message': 'Failed to send emails'}), 400


def send_email_notification(netid, mail, subject, message):
    print("EMAIL NOTIF!!")
    """
    Sends email notifications
    """
    if not app.EMAILS_ON:
        return jsonify({'success': True, 'message': 'EMAILS_ON set to False'})

    try:
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
        message = message + " Please see details on tigerlift.onrender.com"
        msg.attach(MIMEText(message, 'plain'))

        try:
            # Connect to the SMTP server and send the email
            with smtplib.SMTP('smtp.gmail.com', 587) as server:
                server.starttls()  # Secure the connection
                server.login(from_email, from_password)
                server.send_message(msg)
            print(f"Email sent to {mail} successfully!")
            return jsonify({'success': True, 'message': 'Ride request created'})
        except Exception as e:
            print(f"Error sending email to {mail}: {e}")
            return jsonify({'success': False, 'message': 'Failed to send emails'}), 400

    except Exception as e:
         return jsonify({'success': False, 'message': 'Failed to send emails'}), 400


@app.route("/api/notifications", methods=["POST"])
def notifications():
    user_info = _cas.authenticate() 
    netid = user_info['netid']
    print("notifications sees that netid is ", netid)

    if not netid:
        return jsonify({"error": "Missing netid parameter"}), 400
    
    try: 
        response = database.get_user_notifs(netid)
        return jsonify({"notifications": response}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# @app.route("/api/acceptriderequest", methods=["POST"])
# def acceptriderequest():
#     data = request.get_json()
#     requester_id = data.get('requester_id')
#     full_name = data.get('full_name')
#     mail = data.get('mail')
#     rideid = data.get('rideid')
#     try:
#         database.accept_ride_request(requester_id, full_name, mail, rideid)
#         return jsonify({'success': True, 'message': 'Ride request accepted'})
#     except:
#         return jsonify({'success': False, 'message': 'Failed to accept ride request'}), 400

# @app.route("/api/rejectriderequest", methods=["POST"])
# def rejectriderequest():
#     data = request.get_json()
#     requester_id = data.get('requester_id')
#     rideid = data.get('rideid')
#     try:
#         database.reject_ride_request(requester_id, rideid)
#         return jsonify({'success': True, 'message': 'Ride request rejected'})
#     except:
#         return jsonify({'success': False, 'message': 'Failed to reject ride request'}), 400

# @app.route("/api/removerider", methods=["POST"])
# def removerider():
#     data = request.get_json()
#     requester_id = data.get('requester_id')
#     full_name = data.get('full_name')
#     mail = data.get('mail')
#     rideid = data.get('rideid')
#     try:
#         database.remove_rider(requester_id, full_name, mail, rideid)
#         return jsonify({'success': True, 'message': 'Ride request back to pending'})
#     except:
#         return jsonify({'success': False, 'message': 'Failed to remove ride request'}), 400

if __name__ == "__main__":
    if not app._got_first_request:
        database.database_setup()
    app.run(host="0.0.0.0", port=3100, debug=True)