
import React, { useState } from 'react';

// IMPORTANT: Set your password here
const CORRECT_PASSWORD = 'GFDRR';

const PasswordProtect = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // On the initial render, check if the password is in localStorage
    React.useEffect(() => {
        const storedPassword = localStorage.getItem('site_password');
        if (storedPassword === CORRECT_PASSWORD) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === CORRECT_PASSWORD) {
            localStorage.setItem('site_password', password);
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Incorrect password. Please try again.');
        }
        setPassword('');
    };

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh', 
            fontFamily: 'sans-serif',
            backgroundColor: '#f0f0f0'
        }}>
            <div style={{ 
                textAlign: 'center', 
                padding: '2rem', 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
            }}>
                <h2>Password Required</h2>
                <p>This site is password protected.</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        style={{ padding: '0.5rem', marginRight: '0.5rem' }}
                    />
                    <button type="submit" style={{ padding: '0.5rem 1rem' }}>
                        Enter
                    </button>
                </form>
                {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
            </div>
        </div>
    );
};

export default PasswordProtect;
