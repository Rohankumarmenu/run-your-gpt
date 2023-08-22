
import React, { useState, useRef, useEffect } from 'react';
import './Chat.css';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'; 

function Chat() {
    const [userInput, setUserInput] = useState('');
    const [responses, setResponses] = useState([]);
    const chatContainerRef = useRef(null);
    const { transcript, resetTranscript, listening } = useSpeechRecognition();
    const [messageCount, setMessageCount] = useState(0); 

    const startListening = () => {
        SpeechRecognition.startListening();
    };

    const stopListening = () => {
        SpeechRecognition.stopListening();
    };

    const handleUserInput = async () => {
        if (!userInput.trim() || messageCount >= 25) return; 

        try {
            setResponses([...responses, { text: 'AI is typing...', user: 'ai-typing' }]);

            const response = await fetch('/api/v1/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: userInput }),
            });

            if (response.ok) {
                const data = await response.json();
                setResponses([...responses, ...data.responses]);
                setUserInput('');
                setMessageCount(messageCount + 1); 
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [responses]);

    return (
        <div className="chat-container">
            <div className="chat-messages" ref={chatContainerRef}>
                {responses.map((response, index) => (
                    <div key={index} className={`message ${response.user}`}>
                        <div className="avatar">
                            {response.user === 'user' ? 'U' : 'AI'}
                        </div>
                        <div className="message-content">
                            {response.text}
                            {response.user === 'ai-typing' && (
                                <div className="typing-indicator">AI is typing...</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="input-container">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your message..."
                />
                <button onClick={handleUserInput}>Send</button>

                <button onClick={startListening}>
                    { listening ? 'Listening...' : 'Start Listening'}
                </button>
                <button onClick={stopListening}>Stop </button>
                <button onClick={resetTranscript}>Clear</button>
                <div>Transcript: {transcript}</div>
            </div>
            <p>Messages Sent: {messageCount}/25</p> 
        </div>
    );
}

export default Chat;
