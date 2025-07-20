import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './login.css';

const apiUrl = import.meta.env.VITE_API_URL;

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ username: '', password: '' });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!form.username || !form.password) {
            alert('아이디와 비밀번호를 모두 입력해주세요.');
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/dj/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();
            if (response.ok) {
                const token = data.access;
                if (token) {
                    const userData = { username: form.username, token: token };
                    login(userData);
                    alert(`${form.username}님, 환영합니다!`);
                    navigate('/');
                } else {
                    alert('로그인 성공. 하지만 액세스 토큰을 받지 못했습니다. 백엔드 응답을 확인하세요.');
                    console.error('로그인 응답 데이터:', data);
                }
            } else {
                const message = data.detail || Object.values(data).flat().join('\n') || '로그인 실패';
                alert(message);
            }
        } catch (error) {
            alert('네트워크 오류 또는 서버 응답 문제: ' + error.message);
            console.error('로그인 중 오류 발생:', error);
        }
    };

    return (
        <div className="page-wrapper">
            <form className="login-container" onSubmit={handleLogin}>
                <h1 className="login-title">로그인</h1>
                <div className="login-inputs">
                    <input
                        name="username"
                        className="login-input"
                        placeholder="아이디"
                        value={form.username}
                        onChange={handleChange}
                    />
                    <input
                        name="password"
                        type="password"
                        className="login-input"
                        placeholder="비밀번호"
                        value={form.password}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" className="login-button">
                    로그인
                </button>
            </form>
        </div>
    );
}
