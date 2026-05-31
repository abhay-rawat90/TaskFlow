import React, { useState } from "react";
import Silk from "./src/blocks/Backgrounds/Silk/Silk";

function Auth({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState({ text: "", type: "" });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: "", type: "" });
        setIsLoading(true);

        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
        const url = `http://localhost:8080${endpoint}`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include", // Crucial for receiving the HttpOnly cookie
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                if (isLogin) {
                    onLoginSuccess(); // Tell App.jsx to show the ToDoList
                } else {
                    setMessage({ text: "Registration successful! Please log in.", type: "success" });
                    setIsLogin(true); // Switch back to login mode
                    setPassword(""); // Clear password for security
                }
            } else {
                const errorText = await response.text();
                setMessage({ text: errorText || "Authentication failed", type: "error" });
            }
        } catch (error) {
            setMessage({ text: "Network error. Is the server running?", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative w-full min-h-screen text-white font-sans flex flex-col items-center justify-center p-4 overflow-hidden bg-slate-900">
            {/* Background Animation */}
            <div className="absolute inset-0 z-0">
                <Silk speed={5} scale={0.6} color="#27BFDD" noiseIntensity={1.5} rotation={1.41} />
            </div>

            <div className="relative z-10 w-full max-w-md animate-fade-in-up">
                <header className="text-center mb-8">
                    <h1 className="font-logo text-5xl font-bold animate-text-gradient bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-500 text-transparent bg-clip-text">
                        TaskFlow
                    </h1>
                    <p className="text-slate-400 mt-2">
                        {isLogin ? "Welcome back. Log in to continue." : "Create your enterprise account."}
                    </p>
                </header>

                <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 focus:outline-none text-white transition-all"
                                placeholder="Enter your username"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 focus:outline-none text-white transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {message.text && (
                            <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'}`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-teal-500/40 transition-all disabled:opacity-50"
                        >
                            {isLoading ? "Processing..." : (isLogin ? "Log In" : "Register")}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-400">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setMessage({ text: "", type: "" });
                            }}
                            className="text-teal-400 hover:text-teal-300 font-semibold underline-offset-4 hover:underline transition-all"
                        >
                            {isLogin ? "Register here" : "Log in here"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Auth;