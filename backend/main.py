from flask import Flask, request, jsonify
from config import app
import atexit
from google import genai
from google.genai import types
from openai import OpenAI
import os
import json
from dotenv import load_dotenv

MODELS = [
    "Anthropic Claude Haiku 4.5",
    "OpenAI GPT-5 mini",
    "gemini-3-flash-preview",
]

SYSTEM_INSTRUCTION = (
    "You are a wise individual. You advise anyone who asks you a question "
    "in one-two medium length sentences."
)

scores = {model: 0.0 for model in MODELS}
gemini_client = None
github_client = None


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


def query_model(model_name, question):
    if model_name == "gemini-3-flash-preview":
        return ask_gemini(model_name, question)
    else:
        return ask_github_model(model_name, question)


def ask_gemini(model_name, question):
    response = gemini_client.models.generate_content(
        model=model_name,
        contents=question,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION
        )
    )
    return response.text


def ask_github_model(model_name, question):
    response = github_client.chat.completions.create(
        model=model_name,
        messages=[
            {"role": "system", "content": SYSTEM_INSTRUCTION},
            {"role": "user", "content": question},
        ]
    )
    return response.choices[0].message.content


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
        gemini_client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
        github_client = OpenAI(
            base_url="https://models.inference.ai.azure.com",
            api_key=os.getenv("GITHUB_API_KEY"),
        )
        app.run(debug=True)
    except KeyboardInterrupt:
        save_scores()
