// src/pages/AuthPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthPage.css';

const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    name: '',
    website: '',
    description: '',
  });
  const navigate = useNavigate();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    alert('Registration successful! You can now log in.');
    setIsRegister(false);
  };

  return (
    <div className="auth-page">
      <div className="container">
        <h1 className="title">{isRegister ? 'Register' : 'Login'}</h1>
        {isRegister ? (
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Name"
              value={registerForm.name}
              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Website"
              value={registerForm.website}
              onChange={(e) => setRegisterForm({ ...registerForm, website: e.target.value })}
            />
            <textarea
              placeholder="Description"
              value={registerForm.description}
              onChange={(e) => setRegisterForm({ ...registerForm, description: e.target.value })}
            ></textarea>
            <button type="submit" className="styled-button">
              Register
            </button>
            <p>
              Already have an account?{' '}
              <span onClick={() => setIsRegister(false)} className="toggle-link">
                Login here
              </span>
            </p>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              required
            />
            <button type="submit" className="styled-button">
              Login
            </button>
            <p>
              Don't have an account?{' '}
              <span onClick={() => setIsRegister(true)} className="toggle-link">
                Register here
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
