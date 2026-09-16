from flask import Flask, request, jsonify
from config import app
import atexit
from openrouter import OpenRouter
import os
import re
import json
from dotenv import load_dotenv

MODELS = [
    "GPT-4.1",
    "DeepSeek-R1",
    "Gemini Flash Preview",
]

MODEL_API_IDS = {
    "GPT-4.1": "openai/gpt-4.1",
    "DeepSeek-R1": "deepseek/DeepSeek-R1",
    "Gemini Flash Preview": "gemini-3-flash-preview",
}

SYSTEM_INSTRUCTION = (
    "You are a wise individual. You advise anyone who asks you a question "
    "in one-two medium length sentences."
)

scores = {model: 0.0 for model in MODELS}
open_router_client = None


def load_scores():
    global scores
    try:
        with open('data.txt', 'r') as file:
            data = json.load(file)
            for model in MODELS:
                if model in data:
                    scores[model] = float(data[model])
    except FileNotFoundError:
        print("No existing score file, starting fresh")
    except Exception as e:
        print(f"Error loading scores: {e}")


def save_scores():
    try:
        with open('data.txt', 'w') as file:
            json.dump(scores, file)
    except Exception as e:
        print(f"Error saving scores: {e}")


@app.route("/scores", methods=["GET"])
def get_scores():
    return jsonify(scores)


@app.route("/get_responses", methods=["POST"])
def get_responses():
    data = request.json
    question = data.get("usrQuestion")
    model1 = data.get("model1")
    model2 = data.get("model2")

    if not question:
        return jsonify({"message": "You must include a question"}), 400
    if not model1 or not model2:
        return jsonify({"message": "You must include model1 and model2"}), 400

    try:
        response1 = query_model(model1, question)
        response2 = query_model(model2, question)
    except Exception as e:
        return jsonify({"message": str(e)}), 401

    return jsonify({
        "model1_response": response1,
        "model2_response": response2,
    }), 201


def query_model(display_name, question):
    api_id = MODEL_API_IDS[display_name]
    response = open_router_client.chat.send(
        model=api_id,
        messages=[
            {"role": "user", "content": question}
        ],
    )
    result = response.choices[0].message.content
    if not result: 
        raise Exception("No result:" + response.choices[0].finish_reason)
    return re.sub(r'<think>.*?</think>', '', result, flags=re.DOTALL).strip() #Strip thinking section of output

@app.route("/update_scores", methods=["PATCH"])
def update_scores():
    winner = request.get_json()
    if not winner or not isinstance(winner, str):
        return jsonify({"error": "Winner model name must be provided as a string"}), 400
    if winner not in scores:
        return jsonify({"error": f"Unknown model: {winner}"}), 400
    scores[winner] += 1
    save_scores()
    return jsonify({"message": f"{winner} score incremented"}), 200


@app.route("/reset_scores", methods=["POST"])
def reset_scores():
    global scores
    scores = {model: 0.0 for model in MODELS}
    save_scores()
    return jsonify({"message": "Scores reset"}), 200


atexit.register(save_scores)

if __name__ == "__main__":
    try:
        load_scores()
        load_dotenv()
        open_router_client = OpenRouter(api_key=os.getenv("OPEN_ROUTER_API_KEY"))
        app.run(debug=True)
    except KeyboardInterrupt:
        save_scores()
