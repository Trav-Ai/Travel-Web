"use client";
import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, Send } from "lucide-react";
import Navbar from "@/app/components/NavBar/navbar";
import { AuthProvider } from "@/hooks/AuthContext";
import Footer from "@/app/components/Footer/footer";

const ChatBotPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [typingText, setTypingText] = useState("");
  const messagesEndRef = useRef(null);
  const initialized = useRef(false);

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
        
        const welcomeMessage = greeting + "I'm your Travel Assistant. What can I help you with today? ✈️ 🗺️ ☀️";
        
        await typeMessage(welcomeMessage);
      };
      
      greetUser();
    }
  }, []);

  const typeMessage = async (message) => {
    setTypingText("");
    for (let i = 0; i < message.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 20));
      setTypingText((prev) => prev + message[i]);
    }
    setTypingText("");
    setMessages((prev) => [...prev, { role: "assistant", content: message }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    const recentMessages = messages
      .slice(-5)
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

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
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemma2:2b",
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 100,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLoading(false);
        await typeMessage(data.response);
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
      await typeMessage("I'm sorry, I'm having trouble responding right now.");
    }
  };

  return (
    <AuthProvider>
      <div className="flex flex-col justify-between items-center w-full h-full">
        <Navbar />
        <div className="container mx-auto max-w-4xl h-[90vh] p-4 flex flex-col">
          <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex items-center gap-2">
            <MessageCircle size={24} />
            <h1 className="text-xl font-bold">Travel Assistant</h1>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4 bg-background border-x-2">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } animate-in slide-in-from-bottom-1`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p>{message.content}</p>
                </div>
              </div>
            ))}
            {(isLoading || typingText) && (
              <div className="flex justify-start animate-in fade-in">
                <div className="bg-muted rounded-lg p-3">
                  <p>
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
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-4 border rounded-b-lg bg-background"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 rounded-md border p-3 focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-primary text-primary-foreground p-3 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthProvider>
  );
};

export default ChatBotPage;
