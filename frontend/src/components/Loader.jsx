import { Loader2 } from 'lucide-react';

const Loader = ({ size = 'md', text = 'Cargando...' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="relative">
        <Loader2 className={`${sizes[size]} text-brand-200 animate-spin`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className={`${sizes[size]} text-brand-500 animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
      </div>
      {text && (
        <p className="text-gray-500 text-sm font-medium animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default Loader;
