# save as app.py
import re
import uuid
import time
from datetime import datetime

from flask import (
    Flask,
    request,
    jsonify,
    session,
    redirect,
    url_for,
    render_template_string,
)
from flask_sqlalchemy import SQLAlchemy

# ---------------------------
# Basic Flask + DB setup
# ---------------------------
app = Flask(__name__)
app.config["SECRET_KEY"] = "change-this-secret-in-production"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///carbon.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


# ---------------------------
# Models
# ---------------------------
class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.String(36), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    name = db.Column(db.String(120), nullable=True)
    total_co2 = db.Column(db.Float, default=0.0)  # positive => saved, negative => emitted

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name or f"User-{self.id[:6]}",
            "created_at": self.created_at.isoformat(),
            "total_co2": round(self.total_co2, 4),
        }


class CarbonLog(db.Model):
    __tablename__ = "carbon_logs"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    activity = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50), nullable=True)
    quantity = db.Column(db.Float, nullable=True)
    unit = db.Column(db.String(20), nullable=True)
    co2 = db.Column(db.Float, nullable=False)  # positive => saved, negative => emitted
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "activity": self.activity,
            "category": self.category,
            "quantity": self.quantity,
            "unit": self.unit,
            "co2": round(self.co2, 4),
            "created_at": self.created_at.isoformat(),
        }


# Create DB tables if missing
with app.app_context():
    db.create_all()


# ---------------------------------------
# Emission factors and helper functions
# ---------------------------------------
EMISSION_FACTORS = {
    "transport": {
        "car": 0.20,  # kg per km
        "motorbike": 0.10,
        "bus": 0.05,
        "train": 0.03,
        "flight": 0.25,
        "cycle": 0.0,  # savings calculated vs car
        "walk": 0.0,
    },
    "energy": {
        "electricity": 0.82,  # kg CO2e per kWh (approx India avg)
        "lpg": 2.98,  # per kg
        "natural_gas": 1.90,  # per m3
    },
    "food": {
        "beef": 27.0,  # per kg
        "chicken": 6.9,
        "milk": 1.3,
        "rice": 2.7,
        "vegetables": 0.5,
    },
    "waste": {
        "plastic": 6.0,  # per kg
        "paper": 1.3,
    },
}


def extract_quantity(text: str):
    """
    Try to extract a numeric quantity and a unit from the text.
    Returns (value: float or None, unit_type: str or None, unit_raw: str or None)
    """
    text = text.lower()
    # capture patterns like "12 km", "3.5 kwh", "0.2 kg", "2 m3"
    m = re.search(r"(\d+(\.\d+)?)\s*(km|kwh|kw|kg|m3)", text)
    if m:
        value = float(m.group(1))
        raw_unit = m.group(3)
        unit_map = {"km": "km", "kwh": "kwh", "kw": "kwh", "kg": "kg", "m3": "m3"}
        return value, unit_map.get(raw_unit, raw_unit), raw_unit
    return None, None, None


def calculate_carbon_structured(activity: str):
    """
    Improved structured carbon calculation.
    Returns a dict:
    {
      activity: "car",
      category: "transport",
      quantity: 12,
      unit: "km",
      co2: -2.4,  # positive means saved, negative means emitted
      message: "..."
    }
    """
    text = (activity or "").lower().strip()
    qty, unit_type, unit_raw = extract_quantity(text)
    if qty is None:
        # sensible defaults when quantity is missing for travel: assume 1 km
        if any(w in text for w in ["car", "cycle", "bike", "walk", "bus", "train"]):
            qty = 1.0
            unit_type = "km"
            unit_raw = "km"
        else:
            qty = 1.0  # fallback generic

    # transport
    for mode, factor in EMISSION_FACTORS["transport"].items():
        if mode in text:
            if mode in ["cycle", "walk"]:
                # treated as saving vs car (assume 0.2 kg/km car saved)
                saved = qty * EMISSION_FACTORS["transport"]["car"]
                return {
                    "activity": mode,
                    "category": "transport",
                    "quantity": qty,
                    "unit": unit_type or "km",
                    "co2": round(+saved, 6),
                    "message": f"🚴 {mode.title()} {qty} {unit_raw} saved {saved:.2f} kg CO₂",
                }
            else:
                emitted = qty * factor
                return {
                    "activity": mode,
                    "category": "transport",
                    "quantity": qty,
                    "unit": unit_type or "km",
                    "co2": round(-emitted, 6),
                    "message": f"🚗 {mode.title()} {qty} {unit_raw} emitted {emitted:.2f} kg CO₂",
                }

    # energy
    for source, factor in EMISSION_FACTORS["energy"].items():
        if source in text or source.replace("_", " ") in text:
            emitted = qty * factor
            return {
                "activity": source,
                "category": "energy",
                "quantity": qty,
                "unit": unit_type or "kWh",
                "co2": round(-emitted, 6),
                "message": f"⚡ {source.title()} use {qty} {unit_raw or 'units'} emitted {emitted:.2f} kg CO₂",
            }

    # food
    for food, factor in EMISSION_FACTORS["food"].items():
        if food in text:
            emitted = qty * factor
            return {
                "activity": food,
                "category": "food",
                "quantity": qty,
                "unit": unit_type or "kg",
                "co2": round(-emitted, 6),
                "message": f"🍽️ {qty} {unit_raw or 'kg'} of {food} emitted {emitted:.2f} kg CO₂",
            }

    # waste
    for item, factor in EMISSION_FACTORS["waste"].items():
        if item in text:
            emitted = qty * factor
            return {
                "activity": item,
                "category": "waste",
                "quantity": qty,
                "unit": unit_type or "kg",
                "co2": round(-emitted, 6),
                "message": f"🗑️ Disposing {qty} {unit_raw or 'kg'} of {item} emitted {emitted:.2f} kg CO₂",
            }

    # fallback: couldn't identify specific category
    return {
        "activity": "unknown",
        "category": "unknown",
        "quantity": qty,
        "unit": unit_type or "",
        "co2": 0.0,
        "message": "🤔 Could not determine activity. Try phrases like 'drove 5 km', 'cycled 3 km', or 'used 2 kWh electricity'.",
    }


# ---------------------------
# Simple session user helpers
# ---------------------------
def get_or_create_session_user():
    """
    Use Flask session to establish an anonymous user id and persist a User row.
    """
    user_id = session.get("user_id")
    if not user_id:
        user_id = str(uuid.uuid4())
        session["user_id"] = user_id
        # optional: store when created
    user = User.query.get(user_id)
    if not user:
        user = User(id=user_id, name=None, total_co2=0.0)
        db.session.add(user)
        db.session.commit()
    return user


# ---------------------------
# Simple rate limiter (per session)
# ---------------------------
def rate_limit_ok():
    last = session.get("last_submission_at", 0)
    now = time.time()
    # allow 1 req / second per session
    if now - last < 1.0:
        return False
    session["last_submission_at"] = now
    return True


# ---------------------------
# Routes
# ---------------------------
INDEX_HTML = """
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Carbon Tracker Chat</title>
  <style>
    body { font-family: system-ui, Arial; max-width: 720px; margin: 2rem auto; }
    textarea { width: 100%; height: 80px; }
    button { padding: 8px 12px; margin-top: 8px; }
    pre { background:#f8f8f8; padding:12px; }
    .small { color: #555; font-size: 0.9rem; }
  </style>
</head>
<body>
  <h1>Carbon Tracker Chat</h1>
  <p class="small">Try: "drove 5 km by car", "cycled 3 km", "used 4 kWh electricity", "ate 0.2 kg beef"</p>
  <textarea id="prompt">drove 5 km by car</textarea>
  <br/>
  <button onclick="send()">Send</button>
  <p id="out"></p>
  <h3>Your stats</h3>
  <pre id="stats">Loading...</pre>
  <h3>Recent logs</h3>
  <pre id="logs">Loading...</pre>

  <script>
    async function send(){
      const prompt = document.getElementById('prompt').value;
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const json = await res.json();
      document.getElementById('out').innerText = json.message;
      await loadStats();
      await loadLogs();
    }
    async function loadStats(){
      const r = await fetch('/stats');
      const j = await r.json();
      document.getElementById('stats').innerText = JSON.stringify(j, null, 2);
    }
    async function loadLogs(){
      const r = await fetch('/history');
      const j = await r.json();
      document.getElementById('logs').innerText = JSON.stringify(j, null, 2);
    }
    // bootstrap
    loadStats();
    loadLogs();
  </script>
</body>
</html>
"""


@app.route("/")
def home():
    # ensure session user exists
    get_or_create_session_user()
    return render_template_string(INDEX_HTML)


@app.route("/chat", methods=["POST"])
def chat():
    if not rate_limit_ok():
        return jsonify({"ok": False, "error": "Too many requests. Try again in a second."}), 429

    user = get_or_create_session_user()
    data = request.get_json() or {}
    prompt = (data.get("prompt") or "").strip()
    if not prompt:
        return jsonify({"ok": False, "error": "Empty prompt"}), 400

    calc = calculate_carbon_structured(prompt)

    # Persist the log and update user's total_co2
    log = CarbonLog(
        user_id=user.id,
        activity=prompt,
        category=calc["category"],
        quantity=calc["quantity"],
        unit=calc["unit"],
        co2=calc["co2"],
    )
    db.session.add(log)
    # update user's total
    user.total_co2 = (user.total_co2 or 0.0) + calc["co2"]
    db.session.commit()

    response_payload = {
        "ok": True,
        "message": calc["message"],
        "co2": calc["co2"],
        "total_co2": round(user.total_co2, 6),
        "log": log.to_dict(),
    }
    return jsonify(response_payload)


@app.route("/history", methods=["GET"])
def history():
    user = get_or_create_session_user()
    logs = CarbonLog.query.filter_by(user_id=user.id).order_by(CarbonLog.created_at.desc()).limit(50).all()
    return jsonify([l.to_dict() for l in logs])


@app.route("/stats", methods=["GET"])
def stats():
    user = get_or_create_session_user()
    return jsonify(user.to_dict())


@app.route("/leaderboard", methods=["GET"])
def leaderboard():
    # return top users sorted by total_co2 (highest saved on top)
    # note: total_co2 can have negative values (net emissions), positive is net saved
    users = User.query.order_by(User.total_co2.desc()).limit(20).all()
    return jsonify([u.to_dict() for u in users])


# ---------------------------
# Run server
# ---------------------------
if __name__ == "__main__":
    print("✅ Carbon Tracker Chatbot (improved) running at http://127.0.0.1:5000")
    app.run(debug=True)
