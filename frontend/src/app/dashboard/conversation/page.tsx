"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/auth";
import { api, AIChatResponse, Scenario } from "@/lib/api";
import {
  Mic,
  MicOff,
  Send,
  Bot,
  User,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  Award,
  MessageSquare,
  Loader2,
  Volume2,
  Briefcase,
  UtensilsCrossed,
  Plane,
  Stethoscope,
  Phone,
  ShoppingBag,
  Hotel,
  Users,
  Coffee,
  Map,
} from "lucide-react";

const scenarioIcons: Record<string, typeof Briefcase> = {
  job_interview: Briefcase,
  restaurant: UtensilsCrossed,
  airport: Plane,
  doctor: Stethoscope,
  phone_call: Phone,
  shopping: ShoppingBag,
  hotel: Hotel,
  meeting: Users,
  casual_chat: Coffee,
  travel: Map,
};

const scenarioColors: Record<string, string> = {
  job_interview: "from-blue-500 to-indigo-600",
  restaurant: "from-orange-500 to-red-600",
  airport: "from-cyan-500 to-blue-600",
  doctor: "from-emerald-500 to-teal-600",
  phone_call: "from-violet-500 to-purple-600",
  shopping: "from-pink-500 to-rose-600",
  hotel: "from-amber-500 to-yellow-600",
  meeting: "from-slate-500 to-gray-600",
  casual_chat: "from-green-500 to-emerald-600",
  travel: "from-teal-500 to-cyan-600",
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const difficulties = [
  { id: "GUIDED", label: "Guided", desc: "Hints provided", color: "text-emerald-400" },
  { id: "STANDARD", label: "Standard", desc: "Natural flow", color: "text-blue-400" },
  { id: "CHALLENGE", label: "Challenge", desc: "No hints", color: "text-orange-400" },
];

export default function ConversationPage() {
  const user = useAuthStore((s) => s.user);
  const [phase, setPhase] = useState<"select" | "chat" | "feedback">("select");
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("STANDARD");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const scenarios: Scenario[] = [
    { id: "job_interview", title: "Job Interview", character: "HR Manager" },
    { id: "restaurant", title: "Restaurant", character: "Waiter" },
    { id: "airport", title: "Airport", character: "Check-in Agent" },
    { id: "doctor", title: "Doctor's Visit", character: "Doctor" },
    { id: "phone_call", title: "Phone Call", character: "Customer Service" },
    { id: "shopping", title: "Shopping", character: "Shop Assistant" },
    { id: "hotel", title: "Hotel", character: "Receptionist" },
    { id: "meeting", title: "Business Meeting", character: "Colleague" },
    { id: "casual_chat", title: "Casual Chat", character: "Friend" },
    { id: "travel", title: "Travel", character: "Tour Guide" },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startConversation = async () => {
    if (!selectedScenario) return;
    setPhase("chat");
    setIsLoading(true);

    try {
      const { data } = await api.aiChat({
        scenario: selectedScenario,
        difficulty: selectedDifficulty,
        message: "Hello! Let's start the conversation.",
      });
      setSessionId(data.sessionId);
      setMessages([
        { role: "user", content: "Hello! Let's start the conversation.", timestamp: new Date() },
        { role: "assistant", content: data.message, timestamp: new Date() },
      ]);
    } catch {
      setMessages([
        { role: "user", content: "Hello! Let's start the conversation.", timestamp: new Date() },
        {
          role: "assistant",
          content: "Hello! I'm ready to practice with you. What would you like to talk about?",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    const userMsg = inputText.trim();
    setInputText("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const { data } = await api.aiChat({
        sessionId: sessionId || undefined,
        scenario: selectedScenario || undefined,
        difficulty: selectedDifficulty,
        message: userMsg,
      });
      if (!sessionId) setSessionId(data.sessionId);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message, timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble connecting right now. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setInputText(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const endSession = async () => {
    if (sessionId) {
      try {
        await api.endAISession(sessionId);
      } catch {
        // continue to feedback
      }
    }
    setPhase("feedback");
  };

  // ── Scenario Selection Phase ──
  if (phase === "select") {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">AI Conversation</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            Choose a real-world scenario to practice your English speaking skills.
          </p>
        </div>

        {/* Difficulty Selector */}
        <div>
          <h3 className="text-sm font-medium mb-3">Difficulty</h3>
          <div className="flex gap-3">
            {difficulties.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDifficulty(d.id)}
                className={`flex-1 p-3 rounded-xl border text-center transition-all ${
                  selectedDifficulty === d.id
                    ? "border-violet-500/50 bg-violet-500/10"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))]"
                }`}
              >
                <div className={`text-sm font-medium ${d.color}`}>{d.label}</div>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Scenario Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {scenarios.map((scenario, i) => {
            const Icon = scenarioIcons[scenario.id] || MessageSquare;
            const gradient = scenarioColors[scenario.id] || "from-violet-500 to-indigo-600";
            const isSelected = selectedScenario === scenario.id;

            return (
              <motion.button
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedScenario(scenario.id)}
                className={`p-5 rounded-2xl border text-left transition-all card-hover ${
                  isSelected
                    ? "border-violet-500/50 bg-violet-500/10 ring-2 ring-violet-500/20"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))]"
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="font-medium text-sm">{scenario.title}</div>
                <div className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">
                  {scenario.character}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Start Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!selectedScenario}
          onClick={startConversation}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2 mx-auto"
        >
          <Sparkles className="w-5 h-5" />
          Start Conversation
        </motion.button>
      </div>
    );
  }

  // ── Feedback Phase ──
  if (phase === "feedback") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
          <p className="text-[hsl(var(--muted-foreground))]">
            You had {messages.length} exchanges. Great practice!
          </p>
        </motion.div>

        {/* Score Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Grammar", score: 78, color: "from-emerald-500 to-green-600" },
            { label: "Vocabulary", score: 72, color: "from-blue-500 to-indigo-600" },
            { label: "Fluency", score: 68, color: "from-amber-500 to-orange-600" },
          ].map((item) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-center"
            >
              <div className="text-3xl font-bold gradient-text mb-1">{item.score}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">{item.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Conversation Replay */}
        <div className="p-4 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] max-h-64 overflow-y-auto space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              <div
                className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                  msg.role === "user"
                    ? "bg-violet-500/10 text-[hsl(var(--foreground))]"
                    : "bg-[hsl(var(--muted))]"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              setPhase("select");
              setMessages([]);
              setSessionId(null);
              setSelectedScenario(null);
            }}
            className="px-6 py-3 rounded-xl border border-[hsl(var(--border))] font-medium hover:bg-[hsl(var(--muted))] transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            New Session
          </button>
        </div>
      </div>
    );
  }

  // ── Chat Phase ──
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      {/* Chat Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setPhase("select");
              setMessages([]);
              setSessionId(null);
            }}
            className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-medium text-sm">
              {scenarios.find((s) => s.id === selectedScenario)?.character || "AI Partner"}
            </div>
            <div className="text-[11px] text-[hsl(var(--muted-foreground))]">
              {scenarios.find((s) => s.id === selectedScenario)?.title} · {selectedDifficulty}
            </div>
          </div>
        </div>
        <button
          onClick={endSession}
          className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
        >
          End Session
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user"
                    ? "bg-cyan-500/10"
                    : "bg-gradient-to-br from-violet-500 to-indigo-600"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={`max-w-[75%] group relative ${
                  msg.role === "user" ? "text-right" : ""
                }`}
              >
                <div
                  className={`inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-br-md"
                      : "bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === "assistant" && (
                  <button
                    onClick={() => speakText(msg.content)}
                    className="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-bl-md">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--muted-foreground))] animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--muted-foreground))] animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--muted-foreground))] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="pt-4 border-t border-[hsl(var(--border))]">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleListening}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={isListening ? "Listening..." : "Type or speak your message..."}
            className="flex-1 px-4 py-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] text-sm placeholder:text-[hsl(var(--muted-foreground))]"
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            className="w-11 h-11 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 flex items-center justify-center text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
