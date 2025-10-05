"use client";
import { useChat, Message } from "ai/react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Send, User, Bot, Plus, Sparkles, RotateCcw } from "lucide-react";
import { cn } from "../lib/utils";
import { SetStateAction, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import SpinningWheel from "../components/SpinningWheel";
import { useAccount } from "wagmi";

interface ChatHistory {
    id: string;
    title: string;
    timestamp: Date;
}

export default function HomePage() {
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showSpinningWheel, setShowSpinningWheel] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
     const { address } = useAccount();

    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        reload,
        stop,
        setMessages,
        append,
    } = useChat({
        api: "/api/chat",
        body: {
            userAddress: address,
        },
        onError: (error: { message: SetStateAction<string | null>; }) => {
            setError(error.message);
        },
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleNewChat = () => {
        setMessages([]);
        setSelectedChat(null);
        setError(null);
        setShowSpinningWheel(false);
        setIsSpinning(false);
    };

    const handleSpin = (percentage: number) => {
        // Add a message showing the spin result
        const spinResult = `🎰 **Base Faucet Result!** 🎰\n\nYou spun ${percentage}% of the faucet balance!\n\n🎉 Congratulations! Type "Send it" to claim your reward.`;
        
        const resultMessage: Message = {
            id: `result-${Date.now()}`, 
            content: spinResult, 
            role: "assistant" 
        };
        
        setMessages([...messages, resultMessage]);
        setIsSpinning(false);
    };

    const detectSpinRequest = (message: string) => {
        const spinKeywords = [
            'spin', 'wheel', 'mystery box', 'random', 'claim', 'faucet',
            'turn', 'roll', 'try', 'luck', 'chance', 'draw', 'play',
            'tokens', 'reward', 'prize', 'win', 'get', 'receive'
        ];
        return spinKeywords.some(keyword => message.toLowerCase().includes(keyword));
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const inputValue = input.trim();
        if (detectSpinRequest(inputValue)) {
            // Add the user's message to the chat history
            append({ role: "user", content: inputValue });
            setShowSpinningWheel(true);
            // Clear the input field manually
            handleInputChange({ target: { value: "" } } as any);
        } else {
            handleSubmit(e);
        }
    };

    return (
        <div className="flex h-full">
            {/* Sidebar */}
            <div className="hidden md:block w-[260px] h-full border-r border-gray-200 dark:border-gray-800 bg-blue-50 dark:bg-blue-900 overflow-y-auto">
                <div className="p-4">
                    <Button
                        className="w-full mb-4 gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={handleNewChat}
                    >
                        <Plus className="h-4 w-4" />
                        New Chat
                    </Button>

                    <div className="space-y-2 mt-6">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Chat History</h3>
                        {chatHistory.length > 0 ? (
                            chatHistory.map((chat) => (
                                <div
                                    key={chat.id}
                                    className={cn(
                                        "p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-sm",
                                        selectedChat === chat.id && "bg-gray-100 dark:bg-gray-800"
                                    )}
                                    onClick={() => setSelectedChat(chat.id)}
                                >
                                    <h3 className="font-medium truncate">{chat.title}</h3>
                                    <p className="text-xs text-gray-500">
                                        {chat.timestamp.toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-gray-500 px-2">
                                No chat history yet
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full">
                {/* Messages Container with Fixed Height */}
                <div className="flex-1 overflow-y-auto">
                    {error && (
                        <div className="p-4 m-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            {error}
                            <Button 
                                onClick={() => setError(null)} 
                                variant="outline" 
                                size="sm" 
                                className="ml-2">
                                Dismiss
                            </Button>
                        </div>
                    )}
                    
                    {messages.length === 0 && !error ? (
                        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-16 h-16 rounded-full  flex items-center justify-center mb-6">
                                <Sparkles className="h-8 w-8 text-blue-500 " />
                            </div>
                            <h2 className="text-2xl font-bold mb-2 text-blue-500 dark:text-white/90">Ready to spin the Mystery Box?</h2>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
                                Ask me to spin the wheel and claim your random USDC tokens, or learn about the Base faucet.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg text-black/90 dark:text-white/90">
                                <Button variant="outline" className="justify-start text-left p-4 h-auto" onClick={() => 
                                    handleInputChange({ target: { value: "Spin the Base wheel!" } } as any)}>
                                    🎰 Spin the Base wheel
                                </Button>
                                <Button variant="outline" className="justify-start text-left p-4 h-auto" onClick={() => 
                                    handleInputChange({ target: { value: "How does the Base faucet work?" } } as any)}>
                                    📦 How it works
                                </Button>
                                <Button variant="outline" className="justify-start text-left p-4 h-auto" onClick={() => 
                                    handleInputChange({ target: { value: "What tokens can I get from the Mystery Box?" } } as any)}>
                                    💰 Available rewards
                                </Button>
                                <Button variant="outline" className="justify-start text-left p-4 h-auto" onClick={() => 
                                    handleInputChange({ target: { value: "When can I claim again?" } } as any)}>
                                    ⏰ When is next claim time
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="py-6 space-y-8">
                            {messages.map((message: Message, i: number) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        "px-4 md:px-8 max-w-3xl mx-auto",
                                        message.role === "user" ? "text-gray-900 dark:text-white" : ""
                                    )}
                                >
                                    <div className="flex items-start gap-4 mb-1">
                                        {message.role !== "user" ? (
                                            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                                                <Bot className="w-5 h-5 text-white" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                                                <User className="w-5 h-5 text-white" />
                                            </div>
                                        )}
                                        <div className="prose dark:prose-invert max-w-none flex-1 text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                                            <ReactMarkdown>{String(message.content)}</ReactMarkdown>
                                        </div>
                                    </div>
                                    {message.role !== "user" && i === messages.length - 1 && (
                                        <div className="flex ml-12 mt-2 gap-2 text-blue-500 dark:text-gray-400">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-8 text-xs"
                                                onClick={() => reload()}
                                            >
                                                <RotateCcw className="h-3 w-3 mr-2 text-blue-500 dark:text-gray-400" />
                                                Regenerate
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Show spinning wheel when requested */}
                            {showSpinningWheel && (
                                <div className="px-4 md:px-8 max-w-3xl mx-auto">
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                                            <Bot className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <SpinningWheel 
                                                onSpin={handleSpin}
                                                isSpinning={isSpinning}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isLoading && (
                                <div className="px-4 md:px-8 max-w-3xl mx-auto">
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                                            <Bot className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 inline-block">
                                            <div className="flex gap-2 items-center">
                                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} className="pb-20" />
                        </div>
                    )}
                </div>

                {/* Input Container - Static Bottom Position */}
                <div className="shrink-0  bg-white text-black/90 dark:bg-gray-950 p-4 dark:text-white/90">
                    {/* Input Form */}
                    <div>
                        <form
                            onSubmit={handleFormSubmit}
                            className="flex items-center space-x-2"
                        >
                            <Input
                                name="message"
                                placeholder="Ask me to spin the wheel..."
                                className="flex-1"
                                value={input}
                                onChange={handleInputChange}
                                disabled={isLoading}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={isLoading || !input.trim()}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
