import requests
import json
import sys

def main(input_locations):
    try:
        with open('config/modelConfig.txt', 'r') as file:
            prompt = file.read().strip()

        locations_str = ', '.join(input_locations)

        full_prompt = f"{prompt}\nUser: {locations_str}"

        data = {
            "model": "llama3.2:latest",
            "messages": [{"role": "user", "content": full_prompt}],
            "stream": False
        }

        url = "http://localhost:11434/api/chat"
        response = requests.post(url, json=data)

        response_json = json.loads(response.text)

        ai_reply = response_json["message"]["content"]
        print(ai_reply)

    except Exception as e:
        print(f"Unable to load the config file or make the request. Error: {e}")

if __name__ == "__main__":
    locations = sys.argv[1:]  
    main(locations)
