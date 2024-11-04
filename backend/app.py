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
    html_code = render_template('myrides.html', view_type=view_type, myrides=myrides, myreqrides=myreqrides)
    response = make_response(html_code)
    return response

@app.route('/api/myrequestedrides', methods=['GET'])
def api_my_requested_rides():
    user_info = _cas.authenticate()
    myreqrides = database.get_users_requested_rides(user_info['netid'])
    return jsonify({
        'myreqrides': myreqrides
    })


@app.route("/addride", methods=["GET"])
def addride():
    user_info = _cas.authenticate()
    capacity = request.args.get('max_capacity')
    origin = database.location_to_id(request.args.get('origin'))
    destination = database.location_to_id(request.args.get('destination'))
    arrival_time = request.args.get('arrival_time')
    database.create_ride(user_info['netid'], user_info['displayname'], user_info['mail'], capacity, origin, destination, arrival_time)
    return redirect("/dashboard")

@app.route("/deleteride", methods=["GET"])
def deleteride():
    user_info = _cas.authenticate()
    rideid = request.args.get('rideid')
    database.delete_ride(str(user_info['netid']), rideid)
    return redirect("/myrides")

@app.route("/cancelriderequest", methods=["GET"])
def cancelriderequest():
    user_info = _cas.authenticate()
    rideid = request.args.get('rideid')
    database.delete_ride_request(str(user_info['netid']), rideid)
    return redirect("/myrides")
    
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

@app.route("/searchrides", methods=["GET"])
def searchrides():
    user_info = _cas.authenticate()
    origin = database.location_to_id(request.args.get('origin'))
    destination = database.location_to_id(request.args.get('destination'))
    arrival_time = request.args.get('arrival_time')
    rides = database.search_rides(origin, destination, arrival_time)
    locations = database.get_all_locations()
    html_code = render_template('dashboard.html', in_search=True, origin=origin, destination=destination, arrival_time=arrival_time,
                                user_info=user_info, rides=rides, locations=locations)
    response = make_response(html_code)
    return response

@app.route("/requestride", methods=["GET"])
def requestride():
    user_info = _cas.authenticate()
    rideid = request.args.get('rideid')
    database.create_ride_request(str(user_info['netid']), str(user_info['displayname']), str(user_info['mail']), rideid)
    return redirect("/dashboard")

@app.route("/acceptriderequest", methods=["GET"])
def acceptriderequest():
    database.accept_ride_request(request.args.get('requester_id'), request.args.get('full_name'), request.args.get('mail'), request.args.get('rideid'))
    return redirect("/myrides")

@app.route("/rejectriderequest", methods=["GET"])
def rejectriderequest():
    database.reject_ride_request(request.args.get('requester_id'), request.args.get('rideid'))
    return redirect("/myrides")


@app.route("/removerider", methods=["GET"])
def removerider():
    database.remove_rider(request.args.get('requester_id'), request.args.get('full_name'), request.args.get('mail'), request.args.get('rideid'))
    return redirect("/myrides")

if __name__ == "__main__":
    if not app._got_first_request:
        database.database_setup()
    app.run(host="0.0.0.0", port=3100, debug=True)