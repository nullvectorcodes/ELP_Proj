from flask import Flask, render_template, request
from flask_sqlalchemy import SQLAlchemy
from gpt4all import GPT4All
import json

# Initialize Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
db = SQLAlchemy(app)

# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    total_points = db.Column(db.Float, default=0)

# Create tables inside application context
with app.app_context():
    db.create_all()

# Load GPT4All CPU model (ensure you downloaded it)
model = GPT4All("ggml-gpt4all-j-v1.3-groovy")  # Change path if needed

# Carbon emission factors
EMISSION_FACTORS = {
    "car travel": 0.21,
    "bus travel": 0.1,
    "bike travel": 0,
    "walk": 0,
    "meat meal": 5,
    "veg meal": 2,
    "electricity": 0.82
}

# Parse user input using LLM
def parse_user_input(text):
    prompt = f"""
Extract carbon-emitting activities from the text below.
Output as JSON with fields: activity, amount, unit.

Text: "{text}"
"""
    response = model.generate(prompt)
    try:
        data = json.loads(response)
    except:
        data = []
    return data

# Calculate carbon points
def calculate_carbon(activities):
    total = 0
    for act in activities:
        factor = EMISSION_FACTORS.get(act['activity'].lower(), 0)
        total += factor * act['amount']
    return total

# Flask routes
@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == "POST":
        user_text = request.form['user_text']
        activities = parse_user_input(user_text)
        points = calculate_carbon(activities)

        # Use a single demo user
        user = User.query.first()
        if not user:
            user = User(name="Demo User", total_points=0)
            db.session.add(user)
        user.total_points += points
        db.session.commit()

        return render_template("index.html", points=user.total_points, activities=activities)

    return render_template("index.html", points=0, activities=[])

if __name__ == "__main__":
    app.run(debug=True)
