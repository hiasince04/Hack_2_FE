import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './login.css';

// API 기본 URL을 환경 변수에서 가져옵니다.
// 이 변수는 .env 파일에 VITE_API_URL=https://kikoky.shop 와 같이 설정되어 있어야 합니다.
const apiUrl = import.meta.env.VITE_API_URL;

export default function Login() {
    const navigate = useNavigate(); // 페이지 이동을 위한 navigate 훅
    const { login } = useAuth(); // 사용자 인증 컨텍스트에서 login 함수 가져오기
    const [form, setForm] = useState({ username: '', password: '' }); // 로그인 폼 데이터를 저장하는 상태

    // 입력 필드 값 변경 핸들러
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // 로그인 제출 핸들러
    const handleLogin = async (e) => {
        e.preventDefault(); // 폼의 기본 제출 동작(페이지 새로고침)을 방지합니다.

        // 아이디와 비밀번호 입력 여부 확인
        if (!form.username || !form.password) {
            alert('아이디와 비밀번호를 모두 입력해주세요.');
            return;
        }

        try {
            // API URL과 로그인 엔드포인트를 사용하여 요청을 보냅니다.
            // **** 중요: apiUrl 변수를 사용하여 절대 경로로 요청합니다. ****
            const response = await fetch(`${apiUrl}/dj/login/`, {
                method: 'POST', // POST 메서드 사용
                headers: {
                    'Content-Type': 'application/json', // JSON 형식으로 데이터 전송
                },
                body: JSON.stringify(form), // 폼 데이터를 JSON 문자열로 변환하여 전송
            });

            const data = await response.json(); // 응답을 JSON으로 파싱

            if (response.ok) {
                // 백엔드 설정에 따라 'access' 필드에서 토큰을 가져오도록 수정
                const token = data.access; // <--- 이 부분이 핵심 수정입니다.
                if (token) {
                    const userData = { username: form.username, token: token };
                    login(userData); // 인증 컨텍스트에 사용자 데이터와 토큰 저장
                    alert(`${form.username}님, 환영합니다!`); // 사용자에게 환영 메시지
                    navigate('/'); // 메인 페이지로 이동
                } else {
                    alert('로그인 성공. 하지만 액세스 토큰을 받지 못했습니다. 백엔드 응답을 확인하세요.');
                    console.error('로그인 응답 데이터:', data); // 디버깅을 위해 응답 데이터 출력
                }
            } else {
                // 로그인 실패 시 서버에서 받은 오류 메시지 표시
                const message = data.detail || Object.values(data).flat().join('\n') || '로그인 실패';
                alert(message);
            }
        } catch (error) {
            // 네트워크 오류 또는 서버 응답 파싱 오류 발생 시 처리
            alert('네트워크 오류 또는 서버 응답 문제: ' + error.message);
            console.error('로그인 중 오류 발생:', error);
        }
    };

    return (
        <div className="page-wrapper">
            {/* 폼 제출 시 handleLogin 함수를 호출하도록 onSubmit 이벤트를 연결합니다. */}
            <form className="login-container" onSubmit={handleLogin}>
                <h1 className="login-title">로그인</h1>
                <div className="login-inputs">
                    <input
                        name="username"
                        className="login-input"
                        placeholder="아이디"
                        value={form.username} // controlled component를 위해 value 속성 추가
                        onChange={handleChange}
                    />
                    <input
                        name="password"
                        type="password"
                        className="login-input"
                        placeholder="비밀번호"
                        value={form.password} // controlled component를 위해 value 속성 추가
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
