import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  Calculator, LogOut, User, X, Leaf, Zap
} from 'lucide-react';
import Form from './components/Form';
import Results from './components/Results';
import Login from './components/Login';
import Register from './components/Register';
import Alert from './components/Alert';
import DietSuggestion from './components/DietSuggestion';
import { calculateMacros } from './api';

const AuthModal = ({ isOpen, onClose }) => {
    const [mode, setMode] = useState('login');

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl p-8 w-full max-w-md relative shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-surface-200 transition-all"
                    aria-label="Cerrar"
                >
                    <X className="w-5 h-5" />
                </button>
                {mode === 'login' ? (
                    <Login onSwitch={() => setMode('register')} onClose={onClose} />
                ) : (
                    <Register onSwitch={() => setMode('login')} onClose={onClose} />
                )}
            </div>
        </div>
    );
};

const Header = ({ onAuthClick, user, onLogout }) => (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-surface-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
                        <Leaf className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                        <h1 className="font-display font-bold text-xl text-gray-900">myOwnDiet</h1>
                        <p className="text-xs text-gray-500 hidden sm:block">Calculadora de macros</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {user ? (
                        <div className="flex items-center gap-3 pl-2 border-l border-surface-200">
                            <div className="hidden md:flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-brand-700">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-sm text-gray-700 font-medium">{user.name}</span>
                            </div>
                            <button
                                onClick={onLogout}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Cerrar sesion"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onAuthClick}
                            className="btn-primary py-2.5 px-5 flex items-center gap-2"
                        >
                            <User className="w-4 h-4" />
                            <span>Iniciar Sesion</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    </header>
);

const HeroSection = () => (
    <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 rounded-full text-brand-700 text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Calcula tus macros en segundos
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Tu plan nutricional personalizado
        </h2>
        <p className="text-gray-500 max-w-md mx-auto">
            Ingresa tus datos y obtén las calorías y macronutrientes exactos que tu cuerpo necesita según tu objetivo.
        </p>
    </div>
);

const Footer = () => (
    <footer className="text-center py-8 text-gray-400 text-sm border-t border-surface-200 mt-8">
        <p className="flex items-center justify-center gap-2">
            <Leaf className="w-4 h-4" />
            Desarrollado para ayudarte a alcanzar tus metas nutricionales
        </p>
    </footer>
);

const CalculatorView = ({ result, setResult }) => {
    const [error, setError] = useState(null);
    const [showDietSuggestion, setShowDietSuggestion] = useState(false);

    const handleSubmit = async (data) => {
        setError(null);
        setShowDietSuggestion(false);
        try {
            const response = await calculateMacros(data);
            setResult(response.data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSuggest = () => {
        setShowDietSuggestion(true);
    };

    const generatePerMealArray = () => {
        if (!result) return [];
        return result.perMeal;
    };

    return (
        <div className="space-y-8">
            <div className="card">
                <HeroSection />
                <Form onSubmit={handleSubmit} />
                
                {error && (
                    <div className="mt-6">
                        <Alert type="error" message={error} />
                    </div>
                )}
            </div>

            {result && (
                <div className="animate-slide-up">
                    <Results data={result} onSuggest={handleSuggest} />
                </div>
            )}

            {showDietSuggestion && result && (
                <div className="animate-slide-up">
                    <DietSuggestion 
                        perMeal={generatePerMealArray()} 
                        mealCount={result.input.mealFrequency}
                        onClose={() => setShowDietSuggestion(false)}
                    />
                </div>
            )}
        </div>
    );
};

const MainContent = () => {
    const { user, logout } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [result, setResult] = useState(null);

    const handleLogout = () => {
        logout();
        setResult(null);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header 
                onAuthClick={() => setShowAuthModal(true)}
                user={user}
                onLogout={handleLogout}
            />

            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
                <CalculatorView result={result} setResult={setResult} />
                <Footer />
            </main>

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <MainContent />
        </AuthProvider>
    );
}

export default App;
