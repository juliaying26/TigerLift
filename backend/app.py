import os
from flask import Flask, render_template, make_response, redirect, url_for, request, session
import database
from casclient import CASClient
from dotenv import load_dotenv
load_dotenv() # load vars in .env file

app = Flask(__name__, template_folder='../frontend')
app.secret_key = os.environ.get('APP_SECRET_KEY')
_cas = CASClient()

# Welcome page route
@app.route('/', methods=['GET'])
@app.route('/index', methods=['GET'])
def index():
    if(_cas.is_logged_in()):
        return redirect("/dashboard")
    html_code = render_template('index.html')
    response = make_response(html_code)
    return response

@app.route('/login', methods=['GET'])
def login():
    user_info = _cas.authenticate()
    print(user_info)
    rides = database.get_all_rides()
    locations = database.get_all_locations()
    return redirect(url_for('dashboard', user_info=user_info, rides=rides, locations=locations))
    
@app.route('/dashboard', methods=['GET'])
def dashboard():
    user_info = _cas.authenticate()
    rides = database.get_all_rides()
    locations = database.get_all_locations()
    ridereqs = database.get_all_my_ride_requests(user_info['netid'])

    ridereqs_map = {}
    for ridereq in ridereqs:
        ridereqs_map[ridereq[1]] = ridereq[2]

    html_code = render_template('dashboard.html', user_info=user_info, rides=rides, locations=locations, ridereqs=ridereqs_map)
    response = make_response(html_code)
    return response

@app.route('/myrides', methods=['GET'])
def myrides():
    user_info = _cas.authenticate()
    view_type = request.args.get('view_type', 'posted')
    myrides = []
    myreqrides = []
    if view_type == "posted":
        myrides = database.get_users_rides(user_info['netid'])
    else:
        myreqrides = database.get_users_requested_rides(user_info['netid'])
        print("MY REQUESTED RIDES ARE" , myreqrides)
    html_code = render_template('myrides.html', view_type=view_type, myrides=myrides, myreqrides=myreqrides)
    response = make_response(html_code)
    return response

@app.route("/logout", methods=["GET"])
def logout():
    _cas.logout()
    return redirect("/")

@app.route("/addride", methods=["GET"])
def addride():
    user_info = _cas.authenticate()
    capacity = request.args.get('max_capacity')
    origin = request.args.get('origin')
    destination = request.args.get('destination')
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
    origin = request.args.get('origin')
    destination = request.args.get('destination')
    arrival_time = request.args.get('arrival_time')
    rides = database.search_rides(origin, destination, arrival_time)
    locations = database.get_all_locations()
    html_code = render_template('dashboard.html', user_info=user_info, rides=rides, locations=locations)
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