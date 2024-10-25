import os
from flask import Flask, render_template, make_response, redirect, url_for, request
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
        redirect("/loggedin")
    rides = database.get_all_rides()
    locations = database.get_all_locations()
    print(rides)
    print(locations)
    html_code = render_template('index.html', rides=rides, locations=locations)
    response = make_response(html_code)
    return response

# We need a CAS login route here that redirects to home page (these other pages should be separate file?)
@app.route('/login', methods=['GET'])
def login():
    netid = _cas.authenticate()
    return redirect(url_for('loggedin', netid=netid))
    
@app.route('/loggedin', methods=['GET'])
def loggedin():
    netid = request.args.get('netid')
    html_code = render_template('loggedin.html', netid=netid)
    response = make_response(html_code)
    return response

@app.route("/logout", methods=["GET"])
def logout():
    _cas.logout()
    return redirect("/")

@app.route("/addride", methods=["GET"])
def addride():
    database.create_ride(24308, 3, 3, 1, 2, "2021-05-01 12:00:00")
    return redirect("/")

@app.route("/addlocation", methods=["GET"])
def addlocation():
    database.create_location(1, "Princeton")
    database.create_location(2, "Airport")
    return redirect("/")

@app.route("/deletelocations", methods=["GET"])
def deletelocations():
    database.delete_all_locations()
    return redirect("/")

if __name__ == "__main__":
    if not app._got_first_request:
        database.database_setup()
    app.run(debug=True)