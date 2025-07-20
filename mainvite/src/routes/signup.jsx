import React, { useState } from 'react';
import './signup.css';
import { useNavigate } from 'react-router-dom';

export default function SignupSection() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: '',
        password1: '',
        password2: '',
        nickname: '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // handleSignup 함수는 이제 폼의 onSubmit 이벤트에 연결됩니다.
    const handleSignup = async (e) => {
        e.preventDefault(); // 폼의 기본 제출 동작(페이지 새로고침)을 방지합니다.

        if (form.password1 !== form.password2) {
            alert('비밀번호가 일치하지 않습니다!');
            return;
        }

        try {
            // API URL은 환경 변수에서 가져오는 것이 좋습니다.
            // SignupSection에서도 apiUrl을 사용하도록 수정합니다.
            // import.meta.env.VITE_API_URL이 .env 파일에 설정되어 있어야 합니다.
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${apiUrl}/dj/registration/`, {
                // apiUrl 추가
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });

            const text = await response.text();
            const result = text ? JSON.parse(text) : {};

            if (response.ok) {
                alert('🎉 회원가입 완료!');
                navigate('/');
            } else {
                const message =
                    result.message ||
                    result.detail ||
                    Object.values(result).flat().join('\n') ||
                    '서버 오류가 발생했습니다.';
                alert(message);
            }
        } catch (error) {
            alert('네트워크 오류가 발생했습니다.');
            console.error(error);
        }
    };

    return (
        <div className="page-wrapper">
            <div className="signup-container">
                <div className="signup-title">회원가입</div>

                {/* 모든 입력 필드와 제출 버튼을 <form> 태그로 감쌉니다. */}
                {/* 폼 제출 시 handleSignup 함수를 호출하도록 onSubmit 이벤트를 연결합니다. */}
                <form onSubmit={handleSignup}>
                    <div className="signup-inputs">
                        <input
                            className="signup-input"
                            name="username"
                            placeholder="아이디"
                            onChange={handleChange}
                            value={form.username} // controlled component를 위해 value 속성 추가
                        />
                        <input
                            className="signup-input"
                            name="password1"
                            type="password"
                            placeholder="비밀번호"
                            onChange={handleChange}
                            value={form.password1} // controlled component를 위해 value 속성 추가
                        />
                        <input
                            className="signup-input"
                            name="password2"
                            type="password"
                            placeholder="비밀번호 확인"
                            onChange={handleChange}
                            value={form.password2} // controlled component를 위해 value 속성 추가
                        />
                        <input
                            className="signup-input"
                            name="nickname"
                            placeholder="닉네임"
                            onChange={handleChange}
                            value={form.nickname} // controlled component를 위해 value 속성 추가
                        />
                    </div>

                    {/* 버튼의 onClick 대신 폼의 onSubmit을 사용하므로, 버튼은 type="submit"으로 설정합니다. */}
                    <button type="submit" className="signup-buttons">
                        가입하기
                    </button>
                </form>
            </div>
        </div>
    );
}
