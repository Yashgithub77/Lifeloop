"use client";

import { useState, useRef, useEffect } from "react";
import { Task, Goal } from "@/types";

// Type declarations for Web Speech API
interface ISpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: ((event: ISpeechRecognitionEvent) => void) | null;
    onerror: ((event: Event) => void) | null;
    onend: (() => void) | null;
}

interface ISpeechRecognitionEvent extends Event {
    results: {
        [index: number]: {
            [index: number]: {
                transcript: string;
            };
        };
    };
}

declare global {
    interface Window {
        SpeechRecognition: new () => ISpeechRecognition;
        webkitSpeechRecognition: new () => ISpeechRecognition;
    }
}

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface ChatbotProps {
    tasks: Task[];
    goals: Goal[];
    onCreateTask?: (taskData: { title: string; description: string; goalId: string }) => void;
    onCompleteTask?: (taskId: string) => void;
    onReplan?: () => void;
}

export default function Chatbot({ tasks, goals, onCreateTask, onCompleteTask, onReplan }: ChatbotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "Hi! 👋 I'm your LifeLoop assistant. You can ask me about your tasks, create new ones, or check your progress. Try saying \"What tasks do I have today?\" or \"Create a new study task\".",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<ISpeechRecognition | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Initialize speech recognition
    useEffect(() => {
        if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = "en-US";

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                handleSendMessage(transcript);
            };

            recognitionRef.current.onerror = () => {
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const toggleVoice = () => {
        if (!recognitionRef.current) {
            addMessage("assistant", "Sorry, voice input is not supported in your browser. Try using Chrome!");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const speak = (text: string) => {
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        }
    };

    const addMessage = (role: "user" | "assistant", content: string) => {
        const newMessage: Message = {
            id: `msg-${Date.now()}-${Math.random()}`,
            role,
            content,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newMessage]);

        if (role === "assistant") {
            speak(content);
        }
    };

    const processCommand = (text: string): string => {
        const lowerText = text.toLowerCase();
        const todayTasks = tasks.filter((t) => t.dayIndex === 0);
        const pendingTasks = todayTasks.filter((t) => t.status === "pending" || t.status === "in_progress");
        const completedTasks = todayTasks.filter((t) => t.status === "done");

        // Check remaining tasks
        if (lowerText.includes("what tasks") || lowerText.includes("remaining") || lowerText.includes("pending") || lowerText.includes("left")) {
            if (pendingTasks.length === 0) {
                return "🎉 Amazing! You've completed all your tasks for today! Take a well-deserved break.";
            }
            const taskList = pendingTasks.slice(0, 3).map((t) => `• ${t.title}`).join("\n");
            return `You have ${pendingTasks.length} pending tasks today:\n\n${taskList}${pendingTasks.length > 3 ? `\n\n...and ${pendingTasks.length - 3} more.` : ""}`;
        }

        // Check progress
        if (lowerText.includes("progress") || lowerText.includes("how am i doing") || lowerText.includes("status")) {
            const percent = todayTasks.length > 0 ? Math.round((completedTasks.length / todayTasks.length) * 100) : 0;
            if (percent >= 80) {
                return `🌟 You're doing amazing! ${percent}% complete (${completedTasks.length}/${todayTasks.length} tasks). Keep up the fantastic work!`;
            } else if (percent >= 50) {
                return `💪 Great progress! You're ${percent}% there (${completedTasks.length}/${todayTasks.length} tasks). You've got this!`;
            } else {
                return `📊 You're at ${percent}% (${completedTasks.length}/${todayTasks.length} tasks). Every step counts - let's keep moving!`;
            }
        }

        // Create task
        if (lowerText.includes("create") || lowerText.includes("add") || lowerText.includes("new task")) {
            // Extract task title from command
            const titleMatch = text.match(/(?:create|add|new task)\s*(?:called|named|:)?\s*(.+)/i);
            if (titleMatch && titleMatch[1]) {
                const taskTitle = titleMatch[1].trim();
                const defaultGoal = goals[0];
                if (defaultGoal && onCreateTask) {
                    onCreateTask({
                        title: taskTitle,
                        description: "Created via voice command",
                        goalId: defaultGoal.id,
                    });
                    return `✅ Got it! I've added "${taskTitle}" to your tasks. You can find it in your task list.`;
                }
            }
            return "I can help you create a task! Just say something like \"Create task called Review machine learning notes\" or \"Add new task: Complete assignment\".";
        }

        // Complete task
        if (lowerText.includes("complete") || lowerText.includes("done") || lowerText.includes("finish")) {
            const taskMatch = text.match(/(?:complete|done|finish)\s*(?:task)?\s*(.+)/i);
            if (taskMatch && taskMatch[1]) {
                const searchTerm = taskMatch[1].trim().toLowerCase();
                const matchingTask = pendingTasks.find((t) => t.title.toLowerCase().includes(searchTerm));
                if (matchingTask && onCompleteTask) {
                    onCompleteTask(matchingTask.id);
                    return `🎉 Awesome! I've marked "${matchingTask.title}" as complete. Great job!`;
                }
                return `I couldn't find a task matching "${taskMatch[1]}". Try saying the full task name!`;
            }
            return "Which task would you like to complete? Say something like \"Complete Unit 1 study session\".";
        }

        // Replan
        if (lowerText.includes("replan") || lowerText.includes("reschedule") || lowerText.includes("adjust")) {
            if (onReplan) {
                onReplan();
                return "🔄 I'm analyzing your progress and adjusting tomorrow's schedule. Check the dashboard for the updated plan!";
            }
        }

        // Goals
        if (lowerText.includes("goal") || lowerText.includes("goals")) {
            if (goals.length === 0) {
                return "You haven't set any goals yet. Head to the setup page to create your first goal!";
            }
            const goalList = goals.map((g) => `• ${g.title} (${g.category})`).join("\n");
            return `Here are your active goals:\n\n${goalList}`;
        }

        // Motivation
        if (lowerText.includes("motivate") || lowerText.includes("encourage") || lowerText.includes("help me")) {
            const motivations = [
                "💪 You're capable of amazing things! Every task you complete brings you closer to your goals.",
                "🌟 Remember why you started. You've got this!",
                "🚀 Small steps lead to big achievements. Keep going!",
                "✨ Believe in yourself - you're making progress every day!",
                "🎯 Focus on one task at a time. You're doing great!",
            ];
            return motivations[Math.floor(Math.random() * motivations.length)];
        }

        // Help
        if (lowerText.includes("help") || lowerText.includes("what can you do")) {
            return `Here's what I can help you with:\n\n• 📋 \"What tasks do I have?\" - See pending tasks\n• 📊 \"How's my progress?\" - Check completion status\n• ➕ \"Create task called [name]\" - Add a new task\n• ✅ \"Complete [task name]\" - Mark task as done\n• 🔄 \"Replan my schedule\" - Adjust tomorrow's plan\n• 🎯 \"Show my goals\" - View active goals\n• 💪 \"Motivate me\" - Get encouragement\n\nYou can type or use the 🎤 button for voice!`;
        }

        // Default response
        return "I'm not sure I understood that. Try asking about your tasks, progress, or say \"help\" to see what I can do! 😊";
    };

    const handleSendMessage = async (text?: string) => {
        const messageText = text || input;
        if (!messageText.trim()) return;

        addMessage("user", messageText);
        setInput("");
        setIsProcessing(true);

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const response = processCommand(messageText);
        addMessage("assistant", response);
        setIsProcessing(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                style={{
                    background: "var(--primaryGradient)",
                }}
            >
                {isOpen ? (
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div
                    className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    style={{
                        background: "var(--cardBg)",
                        border: "1px solid var(--cardBorder)",
                        height: "500px",
                        maxHeight: "calc(100vh - 180px)",
                    }}
                >
                    {/* Header */}
                    <div
                        className="p-4 flex items-center gap-3"
                        style={{ background: "var(--primaryGradient)" }}
                    >
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-xl">🤖</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white">LifeLoop Assistant</h3>
                            <p className="text-xs text-white/80">Voice-enabled • Always ready to help</p>
                        </div>
                        <button
                            onClick={toggleVoice}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isListening ? "bg-red-500 animate-pulse" : "bg-white/20 hover:bg-white/30"
                                }`}
                        >
                            <span className="text-xl">{isListening ? "🔴" : "🎤"}</span>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl ${msg.role === "user"
                                        ? "rounded-br-md"
                                        : "rounded-bl-md"
                                        }`}
                                    style={{
                                        background: msg.role === "user" ? "var(--primaryGradient)" : "var(--backgroundSecondary)",
                                        color: msg.role === "user" ? "white" : "var(--foreground)",
                                    }}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isProcessing && (
                            <div className="flex justify-start">
                                <div
                                    className="p-3 rounded-2xl rounded-bl-md"
                                    style={{ background: "var(--backgroundSecondary)" }}
                                >
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t" style={{ borderColor: "var(--cardBorder)" }}>
                        {isListening && (
                            <div className="mb-2 text-center text-sm" style={{ color: "var(--primary)" }}>
                                🎤 Listening... Speak now!
                            </div>
                        )}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type or tap 🎤 to speak..."
                                className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all"
                                style={{
                                    background: "var(--inputBg)",
                                    border: "1px solid var(--inputBorder)",
                                    color: "var(--foreground)",
                                }}
                            />
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!input.trim() || isProcessing}
                                className="px-4 py-3 rounded-xl font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                                style={{ background: "var(--primaryGradient)" }}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
