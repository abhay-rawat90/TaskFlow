import React, { useState, useEffect } from "react";
import Silk from "./src/blocks/Backgrounds/Silk/Silk"

// --- SVG Icons for the To-Do List ---
const AddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const UpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>;
const DownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const ResetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>;


function ToDoList() {
    // --- State now initializes from localStorage ---
    const [tasks, setTasks] = useState(() => {
        const savedTasks = localStorage.getItem('tasks');
        return savedTasks ? JSON.parse(savedTasks) : [];
    });
    const [newTask, setNewTask] = useState("");

    // --- Effect to save tasks to localStorage whenever they change ---
    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]);

    function handleInputChange(event) {
        setNewTask(event.target.value);
    }

    function addTask() {
        if (newTask.trim() !== "") {
            setTasks(t => [newTask, ...t]);
            setNewTask("");
        }
    }

    function deleteTask(index) {
        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks);
    }

    function moveTaskUp(index) {
        if (index > 0) {
            const updatedTasks = [...tasks];
            [updatedTasks[index], updatedTasks[index - 1]] = [updatedTasks[index - 1], updatedTasks[index]];
            setTasks(updatedTasks);
        }
    }

    function moveTaskDown(index) {
        if (index < tasks.length - 1) {
            const updatedTasks = [...tasks];
            [updatedTasks[index], updatedTasks[index + 1]] = [updatedTasks[index + 1], updatedTasks[index]];
            setTasks(updatedTasks);
        }
    }

    // --- New function to reset the list ---
    function resetList() {
        setTasks([]);
    }

   return (
        <div className="relative w-full min-h-screen text-white font-sans flex flex-col items-center justify-center p-4 overflow-hidden">
            {/* The DarkVeil component is now the background */}
            <div className="absolute inset-0 z-0">
                <Silk
  speed={5}
  scale={0.6}
  color="#27BFDD"
  noiseIntensity={1.5}
  rotation={1.41}
/>
            </div>

            {/* All content is now in a relative container on top of the background */}
            <div className="relative z-10 w-full flex flex-col items-center justify-center">
                {/* Animated Logo Header */}
                <header className="text-center mb-8">
                    <h1 className="font-logo text-5xl font-bold animate-text-gradient bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-500 text-transparent bg-clip-text">
                        TaskFlow
                    </h1>
                    <p className="text-slate-400">Your daily task manager</p>
                </header>

                <div className="w-full max-w-2xl mx-auto">
                    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-lg p-6 sm:p-8 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-white">My Tasks</h2>
                                <span className="bg-teal-500/10 text-teal-400 text-sm font-semibold px-3 py-1 rounded-full">{tasks.length} tasks</span>
                            </div>
                            <button onClick={resetList} className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors">
                                <ResetIcon />
                                Reset List
                            </button>
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
                            {tasks.map((task, index) =>
                                <li key={index} className="task-item flex items-center gap-3 bg-slate-700/50 p-3 rounded-lg border border-slate-700 transition-all duration-300">
                                    <span className="flex-grow text-slate-300">{task}</span>
                                    <div className="task-actions flex-shrink-0 flex items-center gap-1">
                                        <button className="p-2 rounded-md hover:bg-slate-600 text-slate-400 hover:text-white transition-colors" onClick={() => moveTaskUp(index)}><UpIcon /></button>
                                        <button className="p-2 rounded-md hover:bg-slate-600 text-slate-400 hover:text-white transition-colors" onClick={() => moveTaskDown(index)}><DownIcon /></button>
                                        <button className="p-2 rounded-md hover:bg-slate-600 text-slate-400 hover:text-red-500 transition-colors" onClick={() => deleteTask(index)}><DeleteIcon /></button>
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


// Injecting CSS for animations and new font
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Righteous&display=swap');
  
  body {
    font-family: 'Inter', sans-serif;
    background-color: #0f172a; /* bg-slate-900 */
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
  
  /* Shifting Gradient Logo Animation */
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
