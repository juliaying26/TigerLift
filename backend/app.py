from flask import Flask, render_template
app = Flask(__name__, template_folder='../frontend')

# Welcome page route
@app.route('/')
def index():
    return render_template('index.html')

# We need a CAS login route here that redirects to home page (should be separate file?)
    
if __name__ == "__main__":
    app.run(debug=True)