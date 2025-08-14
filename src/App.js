import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // التحقق من حالة تسجيل الدخول عند تحميل التطبيق
    const loginStatus = localStorage.getItem('loginSuccess');
    const savedUsername = localStorage.getItem('username');
    
    if (loginStatus === 'true' && savedUsername) {
      setIsLoggedIn(true);
      setUsername(savedUsername);
    }
  }, []);

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setUsername(user);
    localStorage.setItem('loginSuccess', 'true');
    localStorage.setItem('username', user);
    localStorage.setItem('loginTime', new Date().toISOString());
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    localStorage.removeItem('loginSuccess');
    localStorage.removeItem('username');
    localStorage.removeItem('loginTime');
  };

  return (
    <div className="App">
      {isLoggedIn ? (
        <Dashboard username={username} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;

