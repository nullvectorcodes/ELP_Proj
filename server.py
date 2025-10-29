from flask import Flask, request, jsonify, session
from gpt4all import GPT4All
from carbon_logic import calculate_carbon
import os

os.environ["GPT4ALL_GPU_LAYERS"] = "0"

app = Flask(__name__)
app.secret_key = "carbon_secret_123"  # for session tracking

model = GPT4All(
    model_name="Llama-3.2-3B-Instruct-Q4_0.gguf",
    model_path=r"C:\Users\Dell\AppData\Local\nomic.ai\GPT4All"
)

@app.route("/")
def home():
    return "✅ Carbon Tracker Chatbot with Scores running!"

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    prompt = data.get("prompt", "")

    # Initialize user score if not set
    if "score" not in session:
        session["score"] = 0.0

    carbon_info, saved_kg = calculate_carbon(prompt)

    # Convert CO₂ savings to points (1 kg CO₂ saved = 1 point)
    points = round(saved_kg, 2)
    session["score"] += points

    # AI friendly message
    with model.chat_session():
        reply = model.generate(
            f"User said: '{prompt}'. Respond in one short friendly sentence about {carbon_info}. Include motivation.",
            max_tokens=60,
            temp=0.6
        )

    # Add notification message
    notif = ""
    if points > 0:
        notif = f"🌿 You earned +{points:.2f} carbon points! Total: {session['score']:.2f}."
    elif points < 0:
        notif = f"⚠️ You used {abs(points):.2f} carbon points. Total: {session['score']:.2f}."

    return jsonify({
        "response": reply,
        "carbon_info": carbon_info,
        "points": session["score"],
        "notification": notif
    })

if __name__ == "__main__":
    app.run(port=5000)
