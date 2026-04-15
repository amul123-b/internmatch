"use client";

import { MessageSquare, X, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function FloatingChatbot() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: string, text: string}[]>([
    { role: "bot", text: "Hi! I'm your AI assistant. Need help finding internships or improving your resume?" }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setInput("");

    // Basic mocked intelligent routing
    setTimeout(() => {
        let botReply = "I'm still learning! But I highly recommend checking out your Dashboard to run a Skill Gap Analysis.";
        
        const lower = userMessage.toLowerCase();
        if (lower.includes("internship") || lower.includes("jobs")) {
            botReply = "I can help with that! Head over to the 'Internships' tab to see AI-matched roles specifically tailored to your skills.";
        } else if (lower.includes("resume") || lower.includes("apply")) {
            botReply = "When you click 'Apply with AI' on any internship, I will automatically draft your cover letter and tailor your resume for you!";
        } else if (lower.includes("skill") || lower.includes("learn") || lower.includes("roadmap")) {
            botReply = "You can use the Roadmap Generator on your Dashboard to get step-by-step guides on any missing skills!";
        }

        setMessages(prev => [...prev, { role: "bot", text: botReply }]);
    }, 1200);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[100]">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full shadow-[0_0_20px_rgba(219,39,119,0.5)] flex items-center justify-center text-white focus:outline-none"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-80 h-[28rem] bg-black/80 border border-purple-500/30 rounded-2xl shadow-2xl flex flex-col z-[100] overflow-hidden backdrop-blur-2xl"
          >
            <div className="bg-gradient-to-r from-purple-700 to-pink-700 p-4 text-white font-bold flex justify-between items-center shadow-md">
              <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4"/> Career Assistant</span>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg, i) => (
                 <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 text-sm rounded-2xl max-w-[85%] leading-relaxed ${msg.role === 'user' ? 'bg-pink-600 text-white rounded-br-sm' : 'bg-purple-900/60 text-gray-200 border border-purple-500/20 rounded-bl-sm'}`}>
                      {msg.text}
                    </div>
                 </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-black/60 border-t border-purple-500/20 flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..." 
                className="flex-1 bg-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-purple-500 border border-transparent text-white transition-all shadow-inner"
              />
              <button onClick={handleSend} className="bg-purple-600 hover:bg-purple-500 px-3 py-2 rounded-xl text-white font-semibold transition flex items-center justify-center shadow-lg">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
