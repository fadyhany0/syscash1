import React, { useState, useEffect, useCallback } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // بيانات الدخول الافتراضية
  const DEFAULT_USERNAME = 'markncode';
  const DEFAULT_PASSWORD = 'Markncode123';

  const showErrorMessage = (message) => {
    setErrorMessage(message);
  };

  const showSuccessMessage = () => {
    setSuccessMessage('تم تسجيل الدخول بنجاح! جاري التحويل...');
  };

  const hideMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleLogin = useCallback(() => {
    const trimmedUsername = username.trim();
    
    // إخفاء رسائل الخطأ والنجاح السابقة
    hideMessages();
    
    // التحقق من صحة البيانات
    if (!trimmedUsername || !password) {
      showErrorMessage('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    // التحقق من صحة بيانات الدخول
    if (trimmedUsername === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
      // تسجيل الدخول ناجح
      showSuccessMessage();
      
      // تحويل المستخدم إلى الصفحة الرئيسية بعد ثانية ونصف
      setTimeout(() => {
        onLogin(trimmedUsername);
      }, 1500);
    } else {
      // بيانات دخول خاطئة
      showErrorMessage('اسم المستخدم أو كلمة المرور غير صحيحة');
      
      // مسح كلمة المرور
      setPassword('');
      document.getElementById('password')?.focus();
    }
  }, [username, password, onLogin]);

  useEffect(() => {
    // إضافة مستمع الأحداث للضغط على Enter
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleLogin();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleLogin]);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="logo">🏪</div>
        <h1 className="title">تسجيل الدخول</h1>
        <p className="subtitle">system cashier from markncode</p>
        
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
        
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
        
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <div className="form-group">
            <label htmlFor="username">اسم المستخدم</label>
            <input 
              type="text" 
              id="username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="أدخل اسم المستخدم"
              autoComplete="username"
              required
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">كلمة المرور</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              autoComplete="current-password"
              required
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>
          
          <button type="submit" className="login-btn">
            تسجيل الدخول
          </button>
        </form>
        
        <div className="credentials-info">
          <strong>بيانات الدخول الافتراضية:</strong><br />
          اسم المستخدم: <strong>markncode</strong><br />
          كلمة المرور: <strong>Markncode123</strong>
        </div>
      </div>
    </div>
  );
};

export default Login;

