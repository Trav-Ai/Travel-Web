from flask import Flask, jsonify, request
from flask_cors import CORS  # Import CORS
import subprocess

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains (or restrict to specific domains)

@app.route('/execute-model', methods=['POST'])
def execute_model():
    try:
        # Get the user_id from the POST request
        user_id = request.json.get('user_id')
        
        if not user_id:
            return jsonify({"message": "User ID is required!"}), 400
        
        # Call the model.py script with the user_id
        result = subprocess.run(
            ['python', 'model.py', user_id], 
            capture_output=True, text=True, check=True
        )

        # Capture the output from the script
        output = result.stdout.strip()
 
        return jsonify({"message": output}), 200

    except subprocess.CalledProcessError as e:
        return jsonify({"message": "Failed to execute the model.", "error": str(e)}), 500

if __name__ == '__main__':  
    app.run(debug=True, host='0.0.0.0', port=5000)
