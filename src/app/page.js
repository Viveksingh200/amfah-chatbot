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
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: text,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
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
          products: data.products || [],
          emailDispatched: data.emailDispatched || false,
          userEmail: data.userEmail || null,
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

            {msg.sender === 'bot' && msg.emailDispatched && (
              <div className={`${styles.messageWrapper} ${styles.bot}`}>
                <div className={styles.emailBadge}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Inquiry email automatically sent to AMFAH team for <strong>{msg.userEmail}</strong>!</span>
                </div>
              </div>
            )}

            {msg.sender === 'bot' && msg.products && msg.products.length > 0 && (
              <>
                <div className={`${styles.messageWrapper} ${styles.bot}`}>
                  <div className={styles.productCarousel}>
                    {msg.products.map((product) => (
                      <div 
                        key={product.id || product.slug} 
                        className={styles.productCard} 
                        onClick={() => window.open(product.link, '_blank')}
                      >
                        <div className={styles.productImageContainer}>
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className={styles.productImage}
                            onError={(e) => {
                              e.target.onerror = null; 
                              e.target.src = 'https://amfah.com/images/amfah-logo.png';
                            }}
                          />
                        </div>
                        <div className={styles.productContent}>
                          <h4 className={styles.productTitle}>{product.name}</h4>
                          {product.description && (
                            <p className={styles.productDesc}>{product.description}</p>
                          )}
                          <a 
                            href={product.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={styles.viewProductBtn}
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Product
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct Company Phone & WhatsApp Inquiry Bar */}
                <div className={`${styles.messageWrapper} ${styles.bot}`}>
                  <div className={styles.contactBanner}>
                    <div className={styles.contactHeader}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                      <span>For quotes or expert inquiry:</span>
                    </div>
                    <div className={styles.contactButtons}>
                      <a href="tel:+919321991812" className={styles.phoneBtn}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        Call Us: +91 93219 91812
                      </a>
                      <a 
                        href="https://wa.me/919004663226?text=Hi%20Amfah,%20I%20have%20an%20inquiry%20about%20your%20products" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={styles.whatsappBtn}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                        WhatsApp Inquiry
                      </a>
                    </div>
                  </div>
                </div>
              </>
            )}

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
          <textarea
            ref={textareaRef}
            rows={1}
            className={styles.textareaInput}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
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
