import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { initializeSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export { AuthContext };

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // check if user is logged in
        const token = localStorage.getItem('token');
        const saveduser = localStorage.getItem('user');
        if (token && saveduser) {
            setUser(JSON.parse(saveduser));
            // Initialize Socket.io if user exists
            initializeSocket(token);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { user, token } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            
            // Initialize Socket.io connection
            initializeSocket(token);

            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    const register = async (name, email, password) => {
       try{
            const response = await api.post('/auth/signup', { name, email, password });
            const { user, token } = response.data.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            
            // Initialize Socket.io connection
            initializeSocket(token);
            
            return { success: true };
        
       }catch(error){
        return { 
            success: false, 
            error: error.response?.data?.message || 'Registration failed' 
        };
       }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        
        // Disconnect Socket.io
        disconnectSocket();
    };

    const updateUser = (updates) => {
        setUser((current) => {
            const nextUser = { ...current, ...updates };
            localStorage.setItem('user', JSON.stringify(nextUser));
            return nextUser;
        });
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
