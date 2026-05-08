#Create, Read, Update, Delete
from flask import Flask, request, jsonify
from config import app
import atexit
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv, dotenv_values


# Initialize scores globally
complex_points = 0.0
simple_points = 0.0
client = None


def load_scores():
    """Load scores from file on startup"""
    global complex_points, simple_points
    try:
        with open('data.txt', 'r') as file:
            content = file.read().strip().split()
            if len(content) >= 2:
                complex_points, simple_points = float(content[0]), float(content[1])
            else:
                print("Warning: File doesn't contain enough data")
    except FileNotFoundError:
        print("No existing score file, starting fresh")
    except Exception as e:
        print(f"Error loading scores: {e}")

def save_scores():
    """Save scores to file"""
    try:
        with open('data.txt', 'w') as file:
            file.write(f"{complex_points} {simple_points}\n")
    except Exception as e:
        print(f"Error saving scores: {e}")

@app.route("/scores", methods=["GET"])
def get_scores():
    return jsonify({
        "complex_score": complex_points,
        "simple_score": simple_points
    })


@app.route("/get_responses", methods=["POST"])
def get_responses(): 
    system_instruction = (
    "You are a wise individual. You advise anyone who asks you a question "
    "in one-two medium length sentences."
    )
    model="gemini-3-flash-preview"
    question = request.json.get("usrQuestion")
    if not question:
        return (
            jsonify({"message": "You must include a question"}),
            400,
        )
    try:
        complex_r = ask_model(
            model=model, 
            contents=question, 
            system_instruction=system_instruction 
        )

        simple_r = ask_model(
            model=model, 
            contents=question, 
            system_instruction=system_instruction,
            thinking_config=types.ThinkingConfig(
                thinking_level=types.ThinkingLevel.MINIMAL
            )
        )
    except Exception as e:
        return (
            jsonify({"message": str(e)}),
            401
        )
    return ( jsonify({
        "simple_response": simple_r,
        "complex_response": complex_r
        }), 201
    )
    
    

def ask_model(model, contents, system_instruction, thinking_config=None):
    ai_response = client.models.generate_content(
        model=model,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            thinking_config=thinking_config
        )
    )

    return (ai_response.text)


@app.route("/update_scores",methods=["PATCH"])
def update_scores():
    global complex_points, simple_points
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    if isinstance(data, str):
        winner = data
    elif isinstance(data, dict):
        winner = data.get('id') or data.get('winner')
    else:
        return jsonify({"error": "Invalid data format"}), 400
    
    if winner.lower() == "complex":
        complex_points += 1
        message = "Complex score incremented"
    elif winner.lower() == "simple":
        simple_points += 1
        message = "Simple score incremented"
    else:
        return jsonify({
            "error": "Winner must be 'Complex' or 'Simple'"
        }), 400
    save_scores()
    return  jsonify({"message": message}), 200 

@app.route("/reset_scores", methods=["POST"])
def reset_scores():
    global complex_points, simple_points
    complex_points = 0.0
    simple_points = 0.0
    return jsonify({"message": "Scores reset"}), 200


atexit.register(save_scores)

if __name__ == "__main__":
    try:
        load_scores()
        load_dotenv()
        client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
        app.run(debug=True)
    except KeyboardInterrupt:
        save_scores()