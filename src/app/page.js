'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './chat.module.css';

export default function Home() {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello! How can I help you today?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: text,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Format messages for OpenAI API (system prompt is handled in backend)
    const chatHistory = [...messages, userMessage].map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://chatbot-backend-a2ih.onrender.com/api/chat';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: chatHistory }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage = {
          id: (Date.now() + 1).toString(),
          text: data.reply,
          suggestions: data.suggestions || [],
          sender: 'bot'
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        console.error('Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I am having trouble connecting to the server.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerProfile}>
            <img src="/fevicon.png" alt="Amfah Expert" className={styles.avatar} />
            <div className={styles.titles}>
              <p className={styles.subTitle}>Chat with</p>
              <h1 className={styles.mainTitle}>Amfah Expert</h1>
            </div>
          </div>
          <div className={styles.headerIcons}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
        <div className={styles.onlineStatus}>We are online!</div>
      </header>

      <div className={styles.chatArea}>
        {messages.map((msg) => (
          <div key={msg.id} className={styles.messageGroup}>
            <div className={`${styles.messageWrapper} ${styles[msg.sender]}`}>
              <div className={`${styles.message} ${styles[msg.sender]}`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
            {msg.sender === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
              <div className={`${styles.messageWrapper} ${styles.bot}`}>
                <div className={styles.suggestionsContainer}>
                  {msg.suggestions.map((suggestion, idx) => (
                    <button 
                      key={idx} 
                      className={styles.suggestionChip}
                      onClick={() => handleSuggestionClick(suggestion)}
                      disabled={isTyping}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className={`${styles.messageWrapper} ${styles.bot}`}>
            <div className={styles.typingIndicator}>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputContainer}>
        <form onSubmit={handleSend} className={styles.inputForm}>
          <input
            type="text"
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your message..."
            disabled={isTyping}
          />
        </form>
        <button type="button" onClick={handleSend} className={styles.sendButton} disabled={!input.trim() || isTyping}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </main>
  );
}
