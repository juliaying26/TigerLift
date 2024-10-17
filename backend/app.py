from flask import Flask, render_template, make_response
import database
from dotenv import load_dotenv
load_dotenv() # load vars in .env file

app = Flask(__name__, template_folder='../frontend')

# Welcome page route
@app.route('/', methods=['GET'])
@app.route('/index', methods=['GET'])
def index():
    html_code = render_template('index.html')
    response = make_response(html_code)
    return response

# We need a CAS login route here that redirects to home page (these other pages should be separate file?)

if __name__ == "__main__":
    if not app._got_first_request:
        database.database_setup()
    app.run(debug=True)