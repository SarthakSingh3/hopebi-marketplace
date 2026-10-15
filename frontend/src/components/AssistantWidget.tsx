import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MessageSquare, X, Send, Loader2, Bot, Store, ArrowRight, ShieldCheck } from 'lucide-react';
import { assistantService, AssistantResponse } from '../services/assistantService';
import { siteConfig } from '../config/siteConfig';
import { useAuth } from '../context/AuthContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  data?: AssistantResponse;
}

export const AssistantWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: user
        ? `**Namaste, ${user.fullName}!** 🙏\n\nI am your **${siteConfig.name} AI Assistant**. How can I assist you today? I can help you find authentic regional crafts directly from Indian manufacturers, track an order, or explain craft traditions.`
        : `**Namaste!** I am the **${siteConfig.name} AI Assistant**.\n\nI am trained exclusively on our marketplace to help you discover authentic regional Indian manufacturers, explore traditional crafts (Kansa bronze, Moradabad brassware, Nilgiri teas, Kashmir Pashmina, Channapatna toys), check store policies, and track orders.\n\nHow can I help you today?`,
      timestamp: new Date()
    }
  ]);

  // Update greeting when user logs in
  useEffect(() => {
    if (user && messages.length === 1 && messages[0].id === 'welcome') {
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: `**Namaste, ${user.fullName}!** 🙏\n\nI am your **${siteConfig.name} AI Assistant**. How can I assist you today? I can help you find authentic regional crafts directly from Indian manufacturers, track an order, or answer craft inquiries.`,
          timestamp: new Date()
        }
      ]);
    }
  }, [user]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await assistantService.askQuestion(textToSend, undefined, user?.fullName);
      const assistantMsg: ChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date(),
        data: response
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: 'ai_err_' + Date.now(),
        sender: 'assistant',
        text: 'I encountered an issue connecting to the HOPEBI knowledge engine. Please check that the server is online and try asking again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const starterPrompts = [
    "Hi HOPEBI!",
    "What are the benefits of Gujarat Kansa dinnerware?",
    "Show me hand-etched brassware from Moradabad",
    "What is your Pan-India delivery & return policy?"
  ];

  return (
    <>
      {/* Floating Toggle Pill */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-stone-900 text-white px-4 py-3 rounded-full shadow-2xl hover:bg-stone-800 hover:scale-105 transition border border-amber-600/30 group cursor-pointer"
          title="Open HOPEBI AI Assistant"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-700 flex items-center justify-center text-white shadow-xs group-hover:rotate-12 transition">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold tracking-wide flex items-center gap-1">
              {siteConfig.name} AI
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </span>
            <span className="text-[10px] text-stone-400">Ask about products & makers</span>
          </div>
        </button>
      )}

      {/* Interactive AI Chat Dialog */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[95vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-4 flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-700 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-sm tracking-tight">{siteConfig.name} AI Assistant</h3>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-full font-medium">
                    Site-Grounded
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">Regional crafts, makers & verified policies</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-white transition"
              title="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-amber-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed space-y-2.5 shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-amber-700 text-white rounded-tr-none'
                      : 'bg-white text-stone-800 border border-stone-200/80 rounded-tl-none'
                  }`}
                >
                  {/* Message Text with Simple Markdown Line Formatter */}
                  <div className="whitespace-pre-line space-y-1.5">
                    {m.text.split('\n\n').map((para, i) => (
                      <p key={i}>
                        {para.startsWith('### ') ? (
                          <span className="font-bold text-stone-900 block text-xs">{para.replace('### ', '')}</span>
                        ) : (
                          para.split('**').map((chunk, j) =>
                            j % 2 === 1 ? <strong key={j} className="font-bold">{chunk}</strong> : chunk
                          )
                        )}
                      </p>
                    ))}
                  </div>

                  {/* Grounded Matching Products Recommendation Cards */}
                  {m.data?.relevantProducts && m.data.relevantProducts.length > 0 && (
                    <div className="pt-2 border-t border-stone-100 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-amber-700" />
                        Matching Curated Products
                      </p>
                      <div className="space-y-1.5">
                        {m.data.relevantProducts.map((p) => (
                          <Link
                            key={p.id}
                            to={`/product/${p.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 p-2 bg-stone-50 hover:bg-amber-50/60 border border-stone-200 rounded-xl transition group text-left"
                          >
                            <img
                              src={p.primaryImageUrl || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=100&q=80'}
                              alt={p.name}
                              className="w-10 h-10 object-cover rounded-lg border border-stone-200 flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-stone-900 truncate group-hover:text-amber-800 transition">
                                {p.name}
                              </p>
                              <p className="text-[11px] font-bold text-amber-900">
                                ₹{p.effectivePrice}
                              </p>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-800 group-hover:translate-x-0.5 transition flex-shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grounded Matching Regional Makers */}
                  {m.data?.relevantSellers && m.data.relevantSellers.length > 0 && (
                    <div className="pt-2 border-t border-stone-100 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                        <Store className="w-3 h-3 text-amber-700" />
                        Verified Manufacturers
                      </p>
                      <div className="space-y-1.5">
                        {m.data.relevantSellers.map((s) => (
                          <Link
                            key={s.id}
                            to={`/sellers/${s.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-between p-2 bg-stone-50 hover:bg-amber-50/60 border border-stone-200 rounded-xl transition text-left"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold text-stone-900 truncate">{s.companyName}</p>
                              <p className="text-[10px] text-stone-500">{s.state}</p>
                            </div>
                            <span className="text-[10px] text-amber-700 font-bold">View Workshop &rarr;</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Follow-up Queries */}
                  {m.data?.suggestedQueries && m.data.suggestedQueries.length > 0 && (
                    <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-1">
                      {m.data.suggestedQueries.map((sq, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSend(sq)}
                          className="text-[10px] bg-stone-100 hover:bg-amber-100/70 hover:text-amber-900 text-stone-600 px-2.5 py-1 rounded-full border border-stone-200 transition text-left"
                        >
                          {sq}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-stone-500 text-xs">
                <div className="w-7 h-7 rounded-xl bg-amber-700 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-none p-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                  <span>Consulting HOPEBI marketplace knowledge...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick starter chips if first message only */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-stone-100/70 border-t border-stone-200 flex flex-wrap gap-1.5">
              <span className="w-full text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Popular Questions:
              </span>
              {starterPrompts.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(p)}
                  className="text-[11px] bg-white border border-stone-200 hover:border-amber-600 px-2.5 py-1 rounded-lg text-stone-700 hover:text-amber-900 transition text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about products, makers, or policies..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-amber-700 hover:bg-amber-800 text-white flex items-center justify-center disabled:opacity-40 transition shadow-xs flex-shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
