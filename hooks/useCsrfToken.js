// hooks/useCsrfToken.js
import { useState, useEffect } from 'react';

export function useCsrfToken() {
    const [csrfToken, setCsrfToken] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/csrf', {
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch CSRF token');
                }

                const data = await response.json();
                setCsrfToken(data.csrfToken);

                // Update meta tag
                let metaTag = document.querySelector('meta[name="csrf-token"]');
                if (!metaTag) {
                    metaTag = document.createElement('meta');
                    metaTag.setAttribute('name', 'csrf-token');
                    document.head.appendChild(metaTag);
                }
                metaTag.setAttribute('content', data.csrfToken);

            } catch (err) {
                setError(err.message);
                console.error('CSRF token error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchToken();
    }, []);

    return { csrfToken, loading, error };
}