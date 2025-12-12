import re
import uuid
import json
import difflib
from datetime import datetime
from flask import Flask, request, jsonify, render_template, session
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SECRET_KEY"] = "change-this"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///carbon.db"
db = SQLAlchemy(app)

# ------------------ MODELS ------------------
class User(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(120))
    total_co2 = db.Column(db.Float, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class CarbonLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(36))
    raw_text = db.Column(db.String(400))
    parsed = db.Column(db.Text)
    co2 = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

with app.app_context():
    db.create_all()

# ------------------ EMISSIONS ------------------
EMISSION_FACTORS = {
    "car": 0.20,
    "bus": 0.05,
    "train": 0.03,
    "cycle": 0,
    "walk": 0,
    "motorbike": 0.10,
    "electricity": 0.82,
    "beef": 27,
    "chicken": 6.9,
    "pork": 12,
    "pizza": 6,
    "burger": 7,
    "vegetables": 2,
    "milk": 1.3,
    "egg": 4.8,
}

SERVING_WEIGHTS = {
    "slice": 0.125,
    "serving": 0.2,
    "meal": 0.3,
    "piece": 0.1,
    "default": 0.2
}

GRAMS_TO_KG = 1/1000

TRANSPORT = ["car", "bus", "train", "cycle", "walk", "motorbike"]
FOODS = ["beef", "chicken", "pizza", "burger", "vegetables"]
ENERGY = ["electricity"]

# ------------------ PARSING HELPERS ------------------
def parse_number(token):
    token = token.lower().replace(",", "")
    if "/" in token:
        a,b = token.split("/")
        return float(a)/float(b)
    try:
        return float(token)
    except:
        return None

def extract_qty_unit(text):
    m = re.search(r"(\d+(\.\d+)?)(\s*)(g|gm|kg|km|kwh|slice|serving|meal|piece)?", text)
    if not m:
        return None, None
    num = parse_number(m.group(1))
    unit = m.group(4)
    return num, unit

def fuzzy(word, group=None):
    word = word.lower()
    if group:
        choices = group
    else:
        choices = list(EMISSION_FACTORS.keys())
    match = difflib.get_close_matches(word, choices, n=1, cutoff=0.6)
    return match[0] if match else None

def parse_text(text):
    parts = re.split(r"and|,|;", text.lower())
    items = []
    for p in parts:
        p = p.strip()
        if not p:
            continue

        qty, unit = extract_qty_unit(p)
        tokens = re.findall(r"[a-zA-Z]+", p)

        # Decide category based on unit
        category = None
        if unit in ["km"]:
            category = "transport"
        elif unit in ["g","gm","kg","slice","serving","meal","piece"]:
            category = "food"
        elif unit == "kwh":
            category = "energy"

        matched = None
        for t in tokens:
            if category == "transport":
                matched = fuzzy(t, TRANSPORT); break
            elif category == "food":
                matched = fuzzy(t, FOODS); break
            elif category == "energy":
                matched = fuzzy(t, ENERGY); break

        if not matched:
            for t in tokens:
                matched = fuzzy(t)
                if matched: break

        if not matched:
            matched = "car" if "km" in p else "pizza"

        # Fix missing qty and unit
        if qty is None:
            qty = 1
        if not unit:
            unit = "km" if matched in TRANSPORT else "meal"

        # Convert to kg if needed
        qkg = None
        u = unit.lower()
        if u in ["g","gm"]:
            qkg = qty * GRAMS_TO_KG
        elif u == "kg":
            qkg = qty
        elif u in ["slice","serving","meal","piece"]:
            qkg = qty * SERVING_WEIGHTS.get(u, SERVING_WEIGHTS["default"])

        items.append({
            "activity": matched,
            "quantity": qty,
            "unit": u,
            "quantity_kg": qkg,
            "raw": p
        })

    return items

def compute_item(item):
    act = item["activity"]
    qty = item["quantity"]
    unit = item["unit"]
    qkg = item["quantity_kg"]

    if unit == "km":
        factor = EMISSION_FACTORS.get(act, 0.2)
        co2 = - qty * factor
        return co2, f"{act} {qty} km → {co2:.2f} kg CO₂"

    if unit == "kwh":
        factor = EMISSION_FACTORS["electricity"]
        co2 = - qty * factor
        return co2, f"electricity {qty} kWh → {co2:.2f} kg CO₂"

    # Food
    if qkg is None:
        qkg = qty * SERVING_WEIGHTS["default"]

    factor = EMISSION_FACTORS.get(act, 6)
    co2 = - qkg * factor
    return co2, f"{act} {qkg:.2f} kg → {co2:.2f} kg CO₂"

def compute_all(text):
    parsed = parse_text(text)
    total = 0
    results = []
    for it in parsed:
        co2, msg = compute_item(it)
        it["co2"] = co2
        it["explain"] = msg
        results.append(it)
        total += co2
    return results, total

# ------------------ SESSION HANDLER ------------------
def get_user():
    uid = session.get("uid")
    if not uid:
        uid = str(uuid.uuid4())
        session["uid"] = uid
        db.session.add(User(id=uid, name=f"User-{uid[:6]}"))
        db.session.commit()
    return User.query.get(uid)

# ------------------ ROUTES ------------------

@app.route("/", methods=["GET"])
def home():
    user = get_user()
    logs = CarbonLog.query.filter_by(user_id=user.id).order_by(CarbonLog.id.desc()).all()
    return render_template("index.html", user=user, logs=logs)


@app.route("/api/parse", methods=["POST"])
def api_parse():
    text = request.json.get("text","")
    parsed, total = compute_all(text)
    return jsonify({"ok": True, "parsed": parsed, "total": total})

@app.route("/api/save", methods=["POST"])
def api_save():
    data = request.json
    text = data.get("text","")
    parsed = data.get("parsed",[])

    user = get_user()

    # Recompute CO₂ safely
    corrected_items = []
    total = 0
    for p in parsed:
        item = {
            "activity": p["activity"],
            "quantity": float(p["quantity"]),
            "unit": p["unit"].lower(),
            "quantity_kg": p.get("quantity_kg")
        }
        co2, msg = compute_item(item)
        item["co2"] = co2
        item["explain"] = msg
        corrected_items.append(item)
        total += co2

    log = CarbonLog(
        user_id=user.id,
        raw_text=text,
        parsed=json.dumps(corrected_items),
        co2=total
    )
    db.session.add(log)

    user.total_co2 += total
    db.session.commit()

    return jsonify({"ok": True, "saved": True})

@app.route("/api/logs")
def api_logs():
    user = get_user()
    logs = CarbonLog.query.filter_by(user_id=user.id).all()
    return jsonify([l.parsed for l in logs])

if __name__ == "__main__":
    app.run(debug=True)
