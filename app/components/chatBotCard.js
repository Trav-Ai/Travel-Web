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
  const initialized = useRef(false);
  const router = useRouter();

  const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const greetUser = async () => {
        const currentHour = new Date().getHours();
        let greeting = "";
        
        if (currentHour < 12) {
          greeting = "Good morning!😊 ";
        } else if (currentHour < 17) {
          greeting = "Good afternoon!😊 ";
        } else {
          greeting = "Good evening!😊 ";
        }
        
        const welcomeMessage = greeting + "I'm your AI Travel Assistant. What can I help you with today? ✈️ 🗺️ ☀️";
        
        await typeMessage(welcomeMessage);
      };
      
      greetUser();
    }
  }, []);

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

    const recentMessages = messages.slice(-5).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gemma2-9b-it',
          messages: [
            {
              role: 'system',
              content: `You are a travel assistant chatbot created by Nibil, Gayatri, Melvin, and Nandana as their BTech CSE final year project. 
              Your primary role is to recommend tourist destinations and provide travel-related information.
              If the query is unrelated to travel, respond with: "Sorry, I can assist with travel recommendations only."
              For general greetings or farewells, respond naturally without mentioning you're a chatbot.
              Base your responses on the conversation history when applicable.`
            },
            ...recentMessages,
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsLoading(false);
        await typeMessage(data.choices[0].message.content);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
      await typeMessage("I'm sorry, I'm having trouble responding right now. Please try again later.");
    }
  };

  const handleOpenFullChat = () => {
    router.push('/chat');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-4 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 flex items-center gap-2"
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