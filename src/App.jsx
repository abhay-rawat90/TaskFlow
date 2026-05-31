import React, { useState, useEffect } from 'react';
import ToDoList from './ToDoList';
import Auth from './Auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    // Check if the user has a valid cookie the moment the app loads
    const verifySession = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include" // Send the hidden HttpOnly cookie to the server
        });

        if (response.ok) {
          setIsAuthenticated(true); // Cookie is valid, log them in
        } else {
          setIsAuthenticated(false); // No cookie or expired, keep them logged out
        }
      } catch (error) {
        console.error("Session verification failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingSession(false); // Stop the loading animation
      }
    };

    verifySession();
  }, []);

  // Show a sleek loading screen while waiting for the server's answer
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-teal-400 text-xl font-semibold animate-pulse tracking-widest font-logo">
          Loading TaskFlow...
        </div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <ToDoList onLogout={() => setIsAuthenticated(false)} />
      ) : (
        <Auth onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
    </>
  );
}

export default App;