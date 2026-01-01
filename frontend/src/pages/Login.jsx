import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth.service';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await authService.login(email, password);

            login(data.accessToken);

            if (data.role === 'Admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container" style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2 style={styles.title}>Giriş Yap</h2>

                {error && <div style={styles.error}>{error}</div>}

                <div style={styles.inputGroup}>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={styles.input}
                        placeholder="ornek@mail.com"
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label htmlFor="password">Şifre</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={styles.input}
                        placeholder="******"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        ...styles.button,
                        opacity: isLoading ? 0.7 : 1,
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                </button>
            </form>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f4f7f6'
    },
    form: {
        backgroundColor: '#ffffff',
        padding: '2.5rem',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
    },
    title: {
        marginBottom: '1.5rem',
        textAlign: 'center',
        color: '#333',
        fontWeight: '600'
    },
    inputGroup: {
        marginBottom: '1.2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    input: {
        padding: '0.75rem',
        borderRadius: '6px',
        border: '1px solid #ddd',
        fontSize: '1rem'
    },
    button: {
        width: '100%',
        padding: '0.75rem',
        border: 'none',
        borderRadius: '6px',
        backgroundColor: '#007bff',
        color: 'white',
        fontSize: '1rem',
        fontWeight: '500',
        marginTop: '1rem',
        transition: 'background-color 0.2s'
    },
    error: {
        backgroundColor: '#ffe3e3',
        color: '#d63031',
        padding: '0.75rem',
        borderRadius: '6px',
        marginBottom: '1rem',
        fontSize: '0.9rem',
        textAlign: 'center',
        border: '1px solid #fab1a0'
    }
};

export default Login;
