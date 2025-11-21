import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            const { data, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                    },
                },
            });

            if (authError) throw authError;

            // If successful, create profile and send welcome email
            if (data.user) {
                // Create profile in database
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        email: formData.email,
                        full_name: formData.fullName,
                        role: 'student'
                    });

                if (profileError) {
                    console.error('Profile creation error:', profileError);
                }

                // Send welcome email via backend API
                try {
                    await fetch('http://localhost:5000/api/email/welcome', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userEmail: formData.email,
                            userName: formData.fullName,
                            userId: data.user.id
                        }),
                    });
                } catch (emailError) {
                    console.error('Welcome email error:', emailError);
                    // Don't fail registration if email fails
                }

                navigate('/student');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-card card">
                    <div className="register-header text-center mb-xl">
                        <Link to="/" className="logo-link">
                            <h2 style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Skill Up Academy
                            </h2>
                        </Link>
                        <p style={{ color: 'var(--color-gray-600)', marginTop: 'var(--spacing-sm)' }}>
                            Start your learning journey today
                        </p>
                    </div>

                    {error && (
                        <div className="alert-error mb-lg">
                            <p style={{ margin: 0, color: 'var(--color-error)' }}>⚠️ {error}</p>
                        </div>
                    )}

                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                className="form-input"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <p className="form-hint">Must be at least 8 characters</p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            disabled={loading}
                        >
                            {loading ? <span className="spinner" style={{ width: '20px', height: '20px' }}></span> : 'Create Account'}
                        </button>
                    </form>

                    <div className="register-footer text-center mt-lg">
                        <p style={{ color: 'var(--color-gray-600)', fontSize: '0.875rem' }}>
                            Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign In</Link>
                        </p>
                    </div>
                </div>

                <div className="back-home mt-lg text-center">
                    <Link to="/" className="nav-link">← Back to Home</Link>
                </div>
            </div>

            <style>{`
        .register-page {
          min-height: 100vh;
          background: var(--gradient-hero);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-xl);
          position: relative;
          overflow: hidden;
        }

        .register-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 50%, rgba(66, 141, 255, 0.15), transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(255, 168, 0, 0.15), transparent 50%);
        }

        .register-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 500px;
        }

        .register-card {
          animation: fadeIn 0.6s ease-out;
        }

        .logo-link {
          text-decoration: none;
        }

        .form-hint {
          font-size: 0.75rem;
          color: var(--color-gray-500);
          margin-top: var(--spacing-xs);
          margin-bottom: 0;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--color-error);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
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

export default Register;
