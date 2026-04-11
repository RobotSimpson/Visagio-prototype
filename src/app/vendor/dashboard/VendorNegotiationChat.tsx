import React, { useState, useEffect, useRef } from "react";
import { Send, X, Loader2, Settings2, Sparkles } from "lucide-react";
import VendorParametersPanel from "./VendorParametersPanel";

interface Message {
  id?: string;
  negotiation_id: string;
  sender_type: "vendor_human" | "buyer_human" | "buyer_ai";
  content: string;
  price_offered?: number;
  created_at?: string;
  vendor_recommendation?: string;
  vendor_recommendation_action?: string;
}

interface VendorNegotiationChatProps {
  negotiationId: string;
  onClose: () => void;
  supabase: any; // Using any for simplicity
  globalParameters: any;
  setGlobalParameters: (val: any) => void;
}

export default function VendorNegotiationChat({
  negotiationId,
  onClose,
  supabase,
  globalParameters,
  setGlobalParameters,
}: VendorNegotiationChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Fetch initial history
  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from("negotiation_messages")
        .select("*")
        .eq("negotiation_id", negotiationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching chat:", error);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [negotiationId, supabase]);

  // Subscribe to real-time incoming messages for this negotiation
  useEffect(() => {
    const channel = supabase
      .channel(`chat_${negotiationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "negotiation_messages",
          filter: `negotiation_id=eq.${negotiationId}`,
        },
        (payload: any) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [negotiationId, supabase]);

  // Scroll to bottom on new message
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const payload: Message = {
      negotiation_id: negotiationId,
      sender_type: "vendor_human",
      content: inputText.trim(),
    };

    // Optimistically update UI (optional, but skipping here to rely on real-time)
    setInputText("");

    const { error } = await supabase.from("negotiation_messages").insert([payload]);

    if (error) {
      console.error("Error sending message:", error);
    }
  };

  // Find absolute newest recommendation
  const latestMessageWithAi = [...messages].reverse().find(m => m.vendor_recommendation);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-4xl h-full bg-slate-50 shadow-2xl flex flex-row animate-in slide-in-from-right-full duration-300 relative border-l border-slate-300">

        {/* LEFT COLUMN: AI Recommendations */}
        <div className="w-[300px] border-r border-slate-200 bg-white flex flex-col relative z-10 transition-all shadow-[inset_-10px_0_20px_-20px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-indigo-50/50">
            <div className="flex items-center gap-2 text-indigo-700">
              <Sparkles size={20} className="animate-pulse" />
              <h2 className="text-sm font-bold tracking-wide uppercase">AI Co-Pilot</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">Real-time dynamic analysis.</p>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            {!latestMessageWithAi ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-3 opacity-60">
                <Sparkles size={32} />
                <p className="text-sm">No actionable insights yet.</p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                  <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                    Latest Analysis
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {latestMessageWithAi.vendor_recommendation}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Chat Window */}
        <div className="flex-1 flex flex-col h-full bg-slate-50 relative">

          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Negotiation Chat</h2>
              <p className="text-xs text-slate-500">ID: {negotiationId.slice(0, 8)}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                title="Auto-Negotiation Settings"
              >
                <Settings2 size={20} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-slate-400" size={32} />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                <p>No messages yet.</p>
                <p className="text-sm">Start the conversation below.</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isVendor = msg.sender_type === "vendor_human";
                return (
                  <div key={msg.id || idx} className={`flex flex-col ${isVendor ? "items-end" : "items-start"}`}>
                    <span className="text-[10px] text-slate-400 mb-1 ml-1 uppercase tracking-wider">
                      {msg.sender_type === "vendor_human" ? "vendor" : msg.sender_type.replace('_', ' ')}
                    </span>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${isVendor
                          ? "bg-amber-500 text-white rounded-br-none"
                          : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
                        }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      {msg.price_offered !== null && msg.price_offered !== undefined && (
                        <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${isVendor ? "bg-amber-600/50" : "bg-green-100 text-green-700"
                          }`}>
                          Offer: ${msg.price_offered.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={endOfMessagesRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-200">
            <form onSubmit={handleSend} className="flex items-center gap-3">

              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 transition-all">
                <input
                  type="text"
                  placeholder="Type your message or suggested counter-offer..."
                  className="flex-1 bg-transparent text-sm outline-none text-slate-800 placeholder:text-slate-400 py-1"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send size={18} />
              </button>

            </form>
          </div>
        </div> {/* CLOSE RIGHT COLUMN */}

        {showSettings && (
          <VendorParametersPanel
            negotiationId={negotiationId}
            onClose={() => setShowSettings(false)}
            params={globalParameters}
            setParams={setGlobalParameters}
          />
        )}
      </div>
    </div>
  );
}
