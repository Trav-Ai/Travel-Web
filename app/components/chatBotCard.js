"use client";
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Minimize2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [typingText, setTypingText] = useState('');
  const messagesEndRef = useRef(null);
  const router = useRouter();
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText]);

  const typeMessage = async (message) => {
    setTypingText('');
    for (let i = 0; i < message.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 20));
      setTypingText(prev => prev + message[i]);
    }
    setTypingText('');
    setMessages(prev => [...prev, { role: 'assistant', content: message }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const recentMessages = messages.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join('\n');

    const prompt = `Based on the user's mood and interest, recommend a tourist destination
- If the user message is unrelated to travel, respond with:
  "I can assist with travel recommendations only."
- If it's normal chats like greetings or godbye said that, respond normally without any template that you are the chatbot from AI travel app.
- reply based on recent messages when applicable , also act as a chatbo and reply based on your discretion
- you are  a chabot created by Nibil , Gayatri , Melvin , Nandana as the main project for btech cse final year
Chat history:
${recentMessages}

User message: ${userMessage}`;

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma2:2b',
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 100
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsLoading(false);
        await typeMessage(data.response);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
      await typeMessage("I'm sorry, I'm having trouble responding right now.");
    }
  };
  const handleOpenFullChat = () => {
    router.push('/chat');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed  right-4 bottom-4 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 flex items-center gap-2"
      >
        <MessageCircle size={24} />
        <span className="font-medium">Chat with AI Assistant</span>
      </button>
    );
  }

  return (
    <Card className="fixed overflow-hidden rounded-lg right-4 bottom-4 w-80 h-96 flex flex-col shadow-lg animate-in slide-in-from-bottom-2">
      <CardHeader className="bg-primary text-primary-foreground p-3 flex flex-row justify-between items-center">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageCircle size={16} />
          Travel Assistant
        </CardTitle>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleOpenFullChat}
            className="hover:bg-primary-foreground/10 p-1 rounded-full transition-colors"
            title="Open in full page"
          >
            <ExternalLink size={16} />
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="hover:bg-primary-foreground/10 p-1 rounded-full transition-colors"
          >
            <Minimize2 size={16} />
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto p-3 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-1`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-2 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
        {(isLoading || typingText) && (
          <div className="flex justify-start animate-in fade-in">
            <div className="bg-muted rounded-lg p-2">
              <p className="text-sm">
                {typingText || (
                  <span className="flex gap-1">
                    Thinking
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce delay-100">.</span>
                    <span className="animate-bounce delay-200">.</span>
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <form onSubmit={handleSubmit} className="p-3 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-primary text-primary-foreground p-2 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </Card>
  );
};

export default ChatBot;
