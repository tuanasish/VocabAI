import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';
import { generateRoleplayScenario } from '../lib/aiGenerator';
import { RoleplayScenario } from '../types';
import { useSpeech } from '../hooks/useSpeech';
import { awardXP, updateStreak, XP_REWARDS } from '../lib/gamification';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

type VocabularySet = Database['public']['Tables']['vocabulary_sets']['Row'];
type Word = Database['public']['Tables']['words']['Row'];

type Message = {
    id: string;
    role: 'user' | 'ai';
    text: string;
    timestamp: Date;
};

const RoleplayPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [set, setSet] = useState<VocabularySet | null>(null);
    const [words, setWords] = useState<Word[]>([]);
    const [scenario, setScenario] = useState<RoleplayScenario | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [chatSession, setChatSession] = useState<ChatSession | null>(null);
    const [messageCount, setMessageCount] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { speak } = useSpeech();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                // Fetch set details
                const { data: setData, error: setError } = await supabase
                    .from('vocabulary_sets')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (setError) throw setError;
                setSet(setData);

                // Fetch words
                const { data: wordsData, error: wordsError } = await supabase
                    .from('words')
                    .select('*')
                    .eq('set_id', id);

                if (wordsError) throw wordsError;
                setWords(wordsData || []);

                // Generate Scenario
                if (setData && wordsData && wordsData.length > 0) {
                    const mappedWords = wordsData.map(w => ({
                        word: w.word,
                        meaning: w.definition
                    }));
                    const generatedScenario = await generateRoleplayScenario(setData.title, mappedWords);
                    setScenario(generatedScenario);

                    // Initialize Chat Session
                    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
                    if (apiKey) {
                        const genAI = new GoogleGenerativeAI(apiKey);
                        const model = genAI.getGenerativeModel({
                            model: "gemini-2.0-flash-exp",
                            systemInstruction: `You are acting as a ${generatedScenario.persona} in a scenario: ${generatedScenario.scenario}. 
                            Your goal is to help the user practice these words: ${wordsData.map(w => w.word).join(', ')}.
                            Keep your responses concise (1-3 sentences) and natural. 
                            Correct the user gently if they make a mistake, but prioritize keeping the conversation flowing.`
                        });

                        const session = model.startChat();
                        setChatSession(session);

                        setMessages([
                            {
                                id: 'init',
                                role: 'ai',
                                text: generatedScenario.initialMessage,
                                timestamp: new Date()
                            }
                        ]);
                    }
                }

            } catch (error) {
                console.error("Error initializing roleplay:", error);
                toast.error("Failed to load roleplay. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim() || !chatSession || isSending) return;

        const userMsgText = inputText.trim();
        setInputText('');
        setIsSending(true);

        // Add user message
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: userMsgText,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);

        try {
            const result = await chatSession.sendMessage(userMsgText);
            const response = await result.response;
            const aiText = response.text();

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                text: aiText,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);

            // Award XP for message interaction
            if (user) {
                setMessageCount(prev => prev + 1);
                await awardXP(user.id, XP_REWARDS.WORD_LEARNED); // 10 XP per message

                // Update streak on first message of the session
                if (messageCount === 0) {
                    await updateStreak(user.id);
                }
            }

            // Optional: Auto-speak AI response
            // speak(aiText); 

        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Setting up the stage...</p>
                </div>
            </Layout>
        );
    }

    if (!set || !scenario) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <p className="text-slate-600 dark:text-slate-400">Failed to load scenario.</p>
                    <Link to={`/sets/${id}`} className="text-primary hover:underline mt-4">Back to Set</Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex flex-col h-[calc(100vh-64px)] max-w-4xl mx-auto w-full px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link to={`/sets/${id}`} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">arrow_back</span>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">theater_comedy</span>
                                Roleplay: {scenario.persona}
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{scenario.scenario}</p>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col shadow-sm">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-purple-500 text-white'}`}>
                                        <span className="material-symbols-outlined text-sm">{msg.role === 'user' ? 'person' : 'smart_toy'}</span>
                                    </div>
                                    <div className={`p-3 rounded-2xl ${msg.role === 'user'
                                        ? 'bg-primary text-white rounded-br-none'
                                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-none'
                                        }`}>
                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                    </div>
                                    {msg.role === 'ai' && (
                                        <button
                                            onClick={() => speak(msg.text)}
                                            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                            title="Listen"
                                        >
                                            <span className="material-symbols-outlined text-lg">volume_up</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isSending && (
                            <div className="flex justify-start">
                                <div className="flex flex-row items-end gap-2">
                                    <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-sm">smart_toy</span>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-slate-200 dark:border-slate-700">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border-transparent focus:border-primary focus:ring-0 text-slate-900 dark:text-white placeholder-slate-500"
                                disabled={isSending}
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim() || isSending}
                                className="p-3 rounded-xl bg-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center aspect-square"
                            >
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default RoleplayPage;
