

from flask import Flask, jsonify, request
import asyncio
import json
import sys
import websockets

app = Flask(__name__)

HOST =   
URI = 

# Maximum message count limit
MAX_MESSAGE_COUNT = 25


user_message_counts = {}

async def run(context, user_id):
    if user_id not in user_message_counts:
        user_message_counts[user_id] = 0

    if user_message_counts[user_id] >= MAX_MESSAGE_COUNT:
        return

    user_message_counts[user_id] += 1

    request = {
        'prompt': context,
        'max_new_tokens': 250,
        'auto_max_new_tokens': False,
        
    }

    async with websockets.connect(URI, ping_interval=None) as websocket:
        await websocket.send(json.dumps(request))

        yield context 
        while True:
            incoming_data = await websocket.recv()
            incoming_data = json.loads(incoming_data)

            match incoming_data['event']:
                case 'text_stream':
                    yield incoming_data['text']
                case 'stream_end':
                    return

@app.route('/api/v1/chat', methods=['POST'])
def chat():
    data = request.json
    prompt = data['prompt']
    user_id = "unique_user_id_here"  
    async def get_responses():
        async for response in run(prompt, user_id):
            yield response

    return jsonify({'responses': list(get_responses())})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005)
