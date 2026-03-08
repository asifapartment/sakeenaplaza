// context/CsrfContext.js
'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const CsrfContext = createContext();

export function CsrfProvider({ children }) {
    const [csrfToken, setCsrfToken] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const response = await fetch('/api/csrf', {
                    credentials: 'include'
                });
                const data = await response.json();
                setCsrfToken(data.csrfToken);
            } catch (error) {
                console.error('Failed to fetch CSRF token:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchToken();
    }, []);

    return (
        <CsrfContext.Provider value={{ csrfToken, loading }}>
            {children}
        </CsrfContext.Provider>
    );
}

export function useCsrf() {
    return useContext(CsrfContext);
}