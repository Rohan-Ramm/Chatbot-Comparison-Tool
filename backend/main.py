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

CHARACTERS = [
    "None",
    "Caveman",
    "Sage",
    "Scholar",
    "Youth"
]

MODEL_API_IDS = {
    "GPT-4.1": "openai/gpt-4.1",
    "DeepSeek-R1": "deepseek/DeepSeek-R1",
    "Gemini Flash Preview": "gemini-3-flash-preview",
}

SYSTEM_INSTRUCTION = {
    "None": "",
    "Caveman": "You caveman. No use many word when few word do trick",
    "Sage": "Your greatest enemy is the desires of the flesh. Your second greatest is over-explaining.",
    "Scholar": "You are well-read on every subject and remember everything you've everything read."
               "Furthermore, you have an extensive vocabulary and no inhibitions about using it.",
    "Youth": "You are a smart young one. Your advice is insightful but bolder and more inventive than" 
             "that of your elder's. You spend enough time online to be familiar with all the newest slang and" 
             "brainrot, but spend enough time offline to know when to use it."
}

scores = None
open_router_client = None


def load_scores():
    global scores
    try:
        with open('data.txt', 'r') as file:
            scores = json.load(file)
    except FileNotFoundError:
        print("No existing score file, starting fresh")
        scores = {"models": {model: [0,0] for model in MODELS},
          "characters": {character: [0,0] for character in CHARACTERS}}
    except Exception as e:
        print(f"Error loading scores: {e}")


def save_scores():
    global scores
    try:
        with open('data.txt', 'w') as file:
            print("Scores Saving.")
            print(scores)
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
    instructions1 = data.get("character1")
    model2 = data.get("model2")
    instructions2 = data.get("character2")

    if not question:
        return jsonify({"message": "You must include a question"}), 400
    if not model1 or not model2:
        return jsonify({"message": "You must include model1 and model2"}), 400

    try:
        response1 = query_model(model1, question,instructions1)
        response2 = query_model(model2, question,instructions2)
    except Exception as e:
        return jsonify({"message": str(e)}), 401

    return jsonify({
        "model1_response": response1,
        "model2_response": response2,
    }), 201


def query_model(display_name, question,instructions):
    model = MODEL_API_IDS[display_name]
    system_prompt = SYSTEM_INSTRUCTION[instructions]
    response = open_router_client.chat.send(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "system", "content": "Always give an answer, never return without saying anything."},
            {"role": "user", "content": question}
        ],
    )
    result = response.choices[0].message.content
    if not result: 
        print(f"{display_name} {instructions}")
        print(response)
        raise Exception("No result:" + response.choices[0].finish_reason)
    return re.sub(r'<think>.*?</think>', '', result, flags=re.DOTALL).strip() #Strip thinking section of output

@app.route("/update_scores", methods=["PATCH"])
def update_scores():
    data = request.get_json()
    try:
        update_scores_helper(data["winner_model"],1,"models")
        update_scores_helper(data["winner_character"],1,"characters")
        update_scores_helper(data["loser_model"],0,"models")
        update_scores_helper(data["loser_character"],1,"characters")
    except Exception as err:
        return jsonify({"error": err}), 400
    save_scores()
    return jsonify({"message": "Scores updated"}), 200

def update_scores_helper(name,winner,type):
    if not name or not isinstance(name, str):
        raise TypeError("Name must be provided as a string")
    if name not in scores[type]:
        return LookupError("Name not found")
    scores[type][name][1] += 1
    scores[type][name][0] += winner #wins only incremented if player wins
    
    

@app.route("/reset_scores", methods=["POST"])
def reset_scores():
    global scores
    scores = {"models": {model: [0,0] for model in MODELS},
          "characters": {character: [0,0] for character in CHARACTERS}}
    save_scores()
    return jsonify({"message": "Scores reset"}), 200


if __name__ == "__main__":
    try:
        load_scores()
        load_dotenv()
        open_router_client = OpenRouter(api_key=os.getenv("OPEN_ROUTER_API_KEY"))
        app.run(debug=True)
    except KeyboardInterrupt:
        save_scores()
