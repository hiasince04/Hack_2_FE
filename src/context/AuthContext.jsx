import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            // storedUser가 문자열인 경우에만 JSON.parse 시도
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error('Failed to parse user from localStorage:', error);
            // 파싱 오류 발생 시 null 반환하여 기본값으로 처리
            return null;
        }
    });

    const login = (userData) => {
        // userData는 { username: '...', token: '...' } 형태가 될 것입니다.
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    const value = { user, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};
