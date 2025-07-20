import React, { useState } from 'react';
import "./signup.css";
import { useNavigate } from "react-router-dom";

export default function SignupSection() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password1: "",
    password2: "",
    nickname: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    if (form.password1 !== form.password2) {
      alert("비밀번호가 일치하지 않습니다!");
      return;
    }

    try {
      const response = await fetch(`/dj/registration/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (response.ok) {
        alert("🎉 회원가입 완료!");
        navigate("/");
      } else {
        const message =
          result.message ||
          result.detail ||
          Object.values(result).flat().join("\n") ||
          "서버 오류가 발생했습니다.";
        alert(message);
      }
    } catch (error) {
      alert("네트워크 오류가 발생했습니다.");
      console.error(error);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="signup-container">
        <div className="signup-title">회원가입</div>

        <div className="signup-inputs">
          <input
            className="signup-input"
            name="username"
            placeholder="아이디"
            onChange={handleChange}
          />
          <input
            className="signup-input"
            name="password1"
            type="password"
            placeholder="비밀번호"
            onChange={handleChange}
          />
          <input
            className="signup-input"
            name="password2"
            type="password"
            placeholder="비밀번호 확인"
            onChange={handleChange}
          />
          <input
            className="signup-input"
            name="nickname"
            placeholder="닉네임"
            onChange={handleChange}
          />
        </div>

        <button className="signup-buttons" onClick={handleSignup}>
          가입하기
        </button>
      </div>
    </div>
  );
}
