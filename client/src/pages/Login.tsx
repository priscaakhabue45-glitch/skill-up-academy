import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            navigate('/student');
        } catch (err: any) {
            setError(err.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card card">
                    <div className="login-header text-center mb-xl">
                        <Link to="/" className="logo-link">
                            <h2 style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Skill Up Academy
                            </h2>
                        </Link>
                        <p style={{ color: 'var(--color-gray-600)', marginTop: 'var(--spacing-sm)' }}>
                            Sign in to continue your learning journey
                        </p>
                    </div>

                    {error && (
                        <div className="alert-error mb-lg" style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid var(--color-error)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--spacing-md)',
                            color: 'var(--color-error)'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            disabled={loading}
                        >
                            {loading ? <span className="spinner" style={{ width: '20px', height: '20px' }}></span> : 'Sign In'}
                        </button>
                    </form>

                    <div className="login-footer text-center mt-lg">
                        <p style={{ color: 'var(--color-gray-600)', fontSize: '0.875rem' }}>
                            Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Sign Up</Link>
                        </p>
                    </div>
                </div>

                <div className="back-home mt-lg text-center">
                    <Link to="/" className="nav-link">← Back to Home</Link>
                </div>
            </div>

            <style>{`
        .login-page {
          min-height: 100vh;
          background: var(--gradient-hero);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-xl);
          position: relative;
          overflow: hidden;
        }

        .login-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 50%, rgba(66, 141, 255, 0.15), transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(255, 168, 0, 0.15), transparent 50%);
        }

        .login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 450px;
        }

        .login-card {
          animation: fadeIn 0.6s ease-out;
        }

        .logo-link {
          text-decoration: none;
        }

        .back-home a {
          color: var(--color-white);
          font-weight: 600;
        }

        .back-home a:hover {
          color: var(--color-primary-light);
        }
      `}</style>
        </div>
    );
};

export default Login;
