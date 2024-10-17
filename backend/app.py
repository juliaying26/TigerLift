import os
from flask import Flask, render_template
import SQLAlchemy
from dotenv import load_dotenv
load_dotenv() # load vars in .env file

app = Flask(__name__, template_folder='../frontend')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')

db = SQLAlchemy(app)

# initialize db based on schema -- I need a way to check if this one's right though
def init_db():
    with app.app_context():
        with open('schema.sql', 'r') as f:
            db.engine.execute(f.read())

# Welcome page route
@app.route('/')
def index():
    return render_template('index.html')

# We need a CAS login route here that redirects to home page (these other pages should be separate file?)

if __name__ == "__main__":
    init_db()
    app.run(debug=True)