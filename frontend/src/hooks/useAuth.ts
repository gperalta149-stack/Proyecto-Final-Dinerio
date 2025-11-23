// frontend/src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import type { User } from '../types';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('authToken');
            console.log('🔐 [useAuth] Verificando autenticación, token presente:', !!token);
            
            if (token) {
                const response = await authService.getCurrentUser();
                console.log('✅ [useAuth] Usuario autenticado:', response.user);
                setUser(response.user);
            } else {
                console.log('⚠️ [useAuth] No hay token, usuario no autenticado');
                setUser(null);
            }
        } catch (error) {
            console.error('❌ [useAuth] Error verificando autenticación:', error);
            localStorage.removeItem('authToken');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<User> => {
        try {
            console.log('🔐 [useAuth] Iniciando sesión para:', email);
            const { user, token } = await authService.login(email, password);
            setUser(user);
            localStorage.setItem('authToken', token);
            console.log('✅ [useAuth] Login exitoso');
            return user;
        } catch (error) {
            console.error('❌ [useAuth] Error en login:', error);
            throw error;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            console.log('🚪 [useAuth] Cerrando sesión');
            await authService.logout();
        } catch (error) {
            console.error('⚠️ [useAuth] Error durante logout:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('authToken');
            navigate('/');
            console.log('✅ [useAuth] Sesión cerrada y redirigido');
        }
    };

    return {
        user,
        login,
        logout,
        loading
    };
};