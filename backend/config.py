from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
# Configure CORS properly
CORS(app)