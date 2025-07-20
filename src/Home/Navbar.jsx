import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');

  const handleLogout = () => {
    logout();
    alert('로그아웃 되었습니다.');
    navigate('/');
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => navigate('/')}>
          🎬 MovieReview
        </div>

        <div className="navbar-search-wrapper">
          
          <button
            className="navbar-search-button"
            onClick={() => {
              navigate(`/search/`);
            }}
          >
            검색하러가기
          </button>
        </div>

        <div className="navbar-auth-buttons">
          {user ? (
            <>
              <span className="navbar-username">{user.username}님</span>
              <button className="logout-button" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button className="login-button" onClick={() => navigate('/login')}>
                로그인
              </button>
              <button className="signup-button" onClick={() => navigate('/signup')}>
                회원가입
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
