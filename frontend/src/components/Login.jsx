import { useState } from 'react';
import { login as apiLogin } from '../api';
import { useAuth } from '../context/AuthContext';

const Login = ({ onSwitch, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await apiLogin({ email, password });
            login(result.data.user, result.data.token);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">¡Bienvenido de nuevo!</h2>
                <p className="text-gray-500 text-sm">Ingresá tus datos para continuar</p>
            </div>
            
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="peer w-full px-4 pt-6 pb-2 bg-surface-50 border-2 border-transparent rounded-xl
                            text-gray-800 placeholder-transparent
                            focus:bg-white focus:border-brand-500
                            transition-all duration-200"
                        placeholder="Email"
                    />
                    <label
                        htmlFor="email"
                        className="absolute left-4 top-3 text-gray-400 text-sm transition-all duration-200 pointer-events-none
                            peer-focus:text-xs peer-focus:text-brand-600 peer-focus:-top-2.5 peer-focus:left-3 peer-focus:bg-white peer-focus:px-1"
                    >
                        Email
                    </label>
                </div>

                <div className="relative">
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="peer w-full px-4 pt-6 pb-2 bg-surface-50 border-2 border-transparent rounded-xl
                            text-gray-800 placeholder-transparent
                            focus:bg-white focus:border-brand-500
                            transition-all duration-200"
                        placeholder="Contraseña"
                    />
                    <label
                        htmlFor="password"
                        className="absolute left-4 top-3 text-gray-400 text-sm transition-all duration-200 pointer-events-none
                            peer-focus:text-xs peer-focus:text-brand-600 peer-focus:-top-2.5 peer-focus:left-3 peer-focus:bg-white peer-focus:px-1"
                    >
                        Contraseña
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Iniciando sesión...
                        </span>
                    ) : (
                        'Iniciar Sesión'
                    )}
                </button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-surface-200"></div>
                </div>
            </div>

            <p className="text-center text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <button 
                    onClick={onSwitch} 
                    className="text-brand-600 hover:text-brand-700 font-semibold transition-colors"
                >
                    Crea una gratis
                </button>
            </p>
        </div>
    );
};

export default Login;
