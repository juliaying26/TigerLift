import os
from flask import Flask, render_template, make_response, redirect, url_for, request, session, jsonify
import database
from casclient import CASClient
from dotenv import load_dotenv
load_dotenv() # load vars in .env file

app = Flask(__name__, template_folder='../frontend')
app.secret_key = os.environ.get('APP_SECRET_KEY')
_cas = CASClient()

FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
FRONTEND_URL = '' if FLASK_ENV == 'production' else 'http://localhost:5173'

@app.route('/api/isloggedin', methods=['GET'])
def isloggedin():
    return jsonify({'is_logged_in': _cas.is_logged_in()})

@app.route('/api/login', methods=['GET'])
def login():
    user_info = _cas.authenticate() # This will redirect to CAS login page if not logged in
    return redirect(f"{FRONTEND_URL}/dashboard")

@app.route("/api/logout", methods=["GET"])
def logout():
    print("called log out")
    _cas.logout()
    return redirect(f"{FRONTEND_URL}/")

@app.route('/api/dashboard', methods=['GET'])
def api_dashboard():
    user_info = _cas.authenticate()
    rides = database.get_all_rides()
    locations = database.get_all_locations()
    ridereqs = database.get_all_my_ride_requests(user_info['netid'])

    ridereqs_map = {}
    for ridereq in ridereqs:
        ridereqs_map[ridereq[1]] = ridereq[2]
    
    return jsonify({
        'user_info': user_info,
        'rides': rides,
        'locations': locations,
        'ridereqs': ridereqs_map
    })

@app.route('/api/mypostedrides', methods=['GET'])
def api_my_posted_rides():
    user_info = _cas.authenticate()
    myrides = database.get_users_rides(user_info['netid'])
    return jsonify({
        'myrides': myrides,
    })

@app.route('/api/myrequestedrides', methods=['GET'])
def api_my_requested_rides():
    user_info = _cas.authenticate()
    myreqrides = database.get_users_requested_rides(user_info['netid'])
    return jsonify({
        'myreqrides': myreqrides
    })

@app.route("/api/addride", methods=["POST"])
def addride():
    user_info = _cas.authenticate()
    data = request.get_json()
    capacity = data.get('capacity')
    origin = database.location_to_id(data.get('origin'))
    dest = database.location_to_id(data.get('destination'))
    arrival_time = data.get('arrival_time')
    try:
        database.create_ride(user_info['netid'], user_info['displayname'], user_info['mail'], capacity, origin, dest, arrival_time)
        return jsonify({'success': True, 'message': 'Ride request accepted'})
    except:
        return jsonify({'success': False, 'message': 'Failed to accept ride request'}), 400

@app.route("/deleteride", methods=["GET"])
def deleteride():
    user_info = _cas.authenticate()
    rideid = request.args.get('rideid')
    database.delete_ride(str(user_info['netid']), rideid)
    return redirect("/myrides")

@app.route("/api/cancelriderequest", methods=["POST"])
def cancelriderequest():
    user_info = _cas.authenticate()
    data = request.get_json()
    rideid = data.get('rideid')
    try:
        database.delete_ride_request(str(user_info['netid']), rideid)
        return jsonify({'success': True, 'message': 'Ride request canceled'})
    except:
        return jsonify({'success': False, 'message': 'Failed to cancel ride request'}), 400
    
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

    user_info = _cas.authenticate()
    origin = database.location_to_id(request.args.get('origin'))
    destination = database.location_to_id(request.args.get('destination'))
    arrival_time = request.args.get('arrival_time', '')
    rides = database.search_rides(origin, destination, arrival_time)
    # locations = database.get_all_locations() ?? Why is this here

    response = jsonify(rides)
    response.headers['Content-Type'] = 'application/json'
    return response, 200

@app.route("/api/requestride", methods=["POST"])
def requestride():
    user_info = _cas.authenticate()
    data = request.get_json()
    rideid = data.get('rideid')
    try:
        database.create_ride_request(str(user_info['netid']), str(user_info['displayname']), str(user_info['mail']), rideid)
        return jsonify({'success': True, 'message': 'Ride request created'})
    except:
        return jsonify({'success': False, 'message': 'Failed to create ride request'}), 400

@app.route("/api/acceptriderequest", methods=["POST"])
def acceptriderequest():
    data = request.get_json()
    requester_id = data.get('requester_id')
    full_name = data.get('full_name')
    mail = data.get('mail')
    rideid = data.get('rideid')
    try:
        database.accept_ride_request(requester_id, full_name, mail, rideid)
        return jsonify({'success': True, 'message': 'Ride request accepted'})
    except:
        return jsonify({'success': False, 'message': 'Failed to accept ride request'}), 400

@app.route("/api/rejectriderequest", methods=["POST"])
def rejectriderequest():
    data = request.get_json()
    requester_id = data.get('requester_id')
    rideid = data.get('rideid')
    try:
        database.reject_ride_request(requester_id, rideid)
        return jsonify({'success': True, 'message': 'Ride request rejected'})
    except:
        return jsonify({'success': False, 'message': 'Failed to reject ride request'}), 400

@app.route("/api/removerider", methods=["POST"])
def removerider():
    data = request.get_json()
    requester_id = data.get('requester_id')
    full_name = data.get('full_name')
    mail = data.get('mail')
    rideid = data.get('rideid')
    try:
        database.remove_rider(requester_id, full_name, mail, rideid)
        return jsonify({'success': True, 'message': 'Ride request back to pending'})
    except:
        return jsonify({'success': False, 'message': 'Failed to remove ride request'}), 400

if __name__ == "__main__":
    if not app._got_first_request:
        database.database_setup()
    app.run(host="0.0.0.0", port=3100, debug=True)