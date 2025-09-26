'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
    user: any;
    token: string | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
    login: (token: string, user: any) => void;
    logout: () => void;
    updateUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>(
        'loading'
    );

    // Loads user/token from localStorage and sets status
    const loadUserFromStorage = () => {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');
        if (storedToken && storedUser) {
            try {
                const decoded: any = jwtDecode(storedToken);
                if (!decoded.exp || decoded.exp * 1000 > Date.now()) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                    setStatus('authenticated');
                } else {
                    localStorage.clear();
                    setToken(null);
                    setUser(null);
                    setStatus('unauthenticated');
                }
            } catch {
                localStorage.clear();
                setToken(null);
                setUser(null);
                setStatus('unauthenticated');
            }
        } else {
            setToken(null);
            setUser(null);
            setStatus('unauthenticated');
        }
    };

    useEffect(() => {
        loadUserFromStorage();
    }, []);

    const login = (newToken: string, newUser: any) => {
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('authUser', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        setStatus('authenticated');
    };

    const logout = () => {
        localStorage.clear();
        window.location.href = '/auth/user/login';
        setToken(null);
        setUser(null);
        setStatus('unauthenticated');
    };

    // Call this to refresh user/token from localStorage
    const updateUser = () => {
        loadUserFromStorage();
    };

    return (
        <AuthContext.Provider value={{ user, token, status, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
