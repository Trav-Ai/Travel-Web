from flask import Flask, jsonify
from flask_cors import CORS  # Import CORS
import subprocess

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains (or restrict to specific domains)

@app.route('/execute-model', methods=['POST'])
def execute_model():
    try:
        subprocess.run(['python', 'model.py'], check=True)
        return jsonify({"message": "Model successfully executed!"}), 200
    except subprocess.CalledProcessError as e:
        return jsonify({"message": "Failed to execute the model.", "error": str(e)}), 500

if __name__ == '__main__':  
    app.run(debug=True, host='0.0.0.0', port=5000)
