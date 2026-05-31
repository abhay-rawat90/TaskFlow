import React, { useState, useEffect } from "react";
import Silk from "./src/blocks/Backgrounds/Silk/Silk";

// --- SVG Icons for the To-Do List ---
const AddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

function ToDoList({ onLogout }) {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    
    // Connects directly to your Spring Boot server
    const API_URL = "http://localhost:8080/api/tasks";

    // Fetch tasks when the component loads
    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await fetch(API_URL, {
                credentials: "include" // Attaches the PASETO cookie!
            });
            if (response.ok) {
                const data = await response.json();
                setTasks(data);
            }
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        }
    };

    function handleInputChange(event) {
        setNewTask(event.target.value);
    }

    const addTask = async () => {
        if (newTask.trim() !== "") {
            const taskData = {
                title: newTask,
                completed: false
            };

            try {
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify(taskData)
                });
                
                if (response.ok) {
                    const savedTask = await response.json();
                    setTasks(t => [savedTask, ...t]);
                    setNewTask("");
                }
            } catch (error) {
                console.error("Failed to add task:", error);
            }
        }
    };

    const toggleCompletion = async (task) => {
        const updatedTask = { ...task, completed: !task.completed };
        try {
            const response = await fetch(`${API_URL}/${task.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(updatedTask)
            });
            
            if (response.ok) {
                setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
            }
        } catch (error) {
            console.error("Failed to update task:", error);
        }
    };

    const deleteTask = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                credentials: "include"
            });
            
            if (response.ok) {
                setTasks(tasks.filter(t => t.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete task:", error);
        }
    };

    const handleLogout = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/auth/logout", {
                method: "POST",
                credentials: "include"
            });
            
            if (response.ok) {
                onLogout(); // Tell App.jsx to show the login screen
            }
        } catch (error) {
            console.error("Failed to log out:", error);
        }
    };

   return (
        <div className="relative w-full min-h-screen text-white font-sans flex flex-col items-center justify-center p-4 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Silk speed={5} scale={0.6} color="#27BFDD" noiseIntensity={1.5} rotation={1.41} />
            </div>

            {/* Responsive Logout Button pinned to the top right of the viewport */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-50">
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700 border border-slate-700 rounded-lg shadow-lg hover:shadow-teal-500/20 transition-all"
                    title="Log Out"
                >
                    <LogoutIcon />
                    {/* The text is hidden on small screens and inline on larger screens */}
                    <span className="hidden sm:inline">Log Out</span>
                </button>
            </div>

            <div className="relative z-10 w-full flex flex-col items-center justify-center pt-12 sm:pt-0">
                <header className="text-center mb-8 w-full max-w-2xl mx-auto">
                    <h1 className="font-logo text-5xl font-bold animate-text-gradient bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-500 text-transparent bg-clip-text">
                        TaskFlow
                    </h1>
                    <p className="text-slate-400 mt-2">Your enterprise task manager</p>
                </header>

                <div className="w-full max-w-2xl mx-auto">
                    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-lg p-6 sm:p-8 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-white">My Tasks</h2>
                                <span className="bg-teal-500/10 text-teal-400 text-sm font-semibold px-3 py-1 rounded-full">{tasks.length} tasks</span>
                            </div>
                        </div>
                        
                        <div className="flex gap-2 mb-6">
                            <input 
                                type="text" 
                                placeholder="Add a new task..." 
                                className="flex-grow p-3 rounded-lg bg-slate-900 border-2 border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 focus:outline-none text-base transition-all" 
                                value={newTask} 
                                onChange={handleInputChange}
                            />
                            <button 
                                className="group flex-shrink-0 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-4 rounded-lg shadow-md hover:shadow-teal-500/40 transition-all disabled:opacity-50"
                                onClick={addTask}
                            >
                                <AddIcon />
                                <span className="hidden sm:inline">Add Task</span>
                            </button>
                        </div>

                        <ul className="space-y-3">
                            {tasks.map((task) =>
                                <li key={task.id} className={`task-item flex items-center gap-3 bg-slate-700/50 p-3 rounded-lg border transition-all duration-300 ${task.completed ? 'border-teal-500/50 opacity-60' : 'border-slate-700'}`}>
                                    <span className={`flex-grow text-slate-300 ${task.completed ? 'line-through' : ''}`}>{task.title}</span>
                                    <div className="task-actions flex-shrink-0 flex items-center gap-1">
                                        <button className="p-2 rounded-md hover:bg-slate-600 text-slate-400 hover:text-teal-400 transition-colors" onClick={() => toggleCompletion(task)}><CheckIcon /></button>
                                        <button className="p-2 rounded-md hover:bg-slate-600 text-slate-400 hover:text-red-500 transition-colors" onClick={() => deleteTask(task.id)}><DeleteIcon /></button>
                                    </div>
                                </li>
                            )}
                            {tasks.length === 0 && (
                                <p className="text-center text-slate-500 py-8">Your task list is empty. Add a task to get started!</p>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Righteous&display=swap');
  
  body {
    font-family: 'Inter', sans-serif;
    background-color: #0f172a;
    margin: 0;
  }
  
  .font-logo {
      font-family: 'Righteous', cursive;
  }

  .task-actions {
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }

  .task-item:hover .task-actions {
    opacity: 1;
  }

  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 0.5s ease-out forwards;
  }
  
  @keyframes text-gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .animate-text-gradient {
    background-size: 200% 200%;
    animation: text-gradient-shift 5s ease-in-out infinite;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default ToDoList;