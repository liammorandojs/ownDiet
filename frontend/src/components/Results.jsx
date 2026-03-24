import { useEffect, useState } from 'react';
import { UtensilsCrossed, Flame, Beef, Wheat, Droplets, Brain, Zap, TrendingUp, TrendingDown, ArrowUpDown, Sparkles, AlertTriangle } from 'lucide-react';

const AnimatedNumber = ({ value, suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), value);
      setDisplayValue(current);
      
      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}{suffix}</span>;
};

const MacroCard = ({ title, value, unit, subtitle, color, icon, delay = 0 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const colorStyles = {
    brand: {
      bg: 'from-brand-500 to-brand-600',
      light: 'bg-brand-50 border-brand-100',
      text: 'text-brand-600',
      icon: 'text-brand-500'
    },
    blue: {
      bg: 'from-blue-500 to-blue-600',
      light: 'bg-blue-50 border-blue-100',
      text: 'text-blue-600',
      icon: 'text-blue-500'
    },
    orange: {
      bg: 'from-orange-500 to-orange-600',
      light: 'bg-orange-50 border-orange-100',
      text: 'text-orange-600',
      icon: 'text-orange-500'
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      light: 'bg-purple-50 border-purple-100',
      text: 'text-purple-600',
      icon: 'text-purple-500'
    },
    gray: {
      bg: 'from-gray-500 to-gray-600',
      light: 'bg-gray-50 border-gray-200',
      text: 'text-gray-600',
      icon: 'text-gray-500'
    }
  };

  const style = colorStyles[color] || colorStyles.brand;

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${style.light} hover:shadow-soft hover:-translate-y-1`}
    >
      <div className="p-5 relative z-10">
        <div className="flex items-start justify-between mb-3">
          <p className={`text-sm font-medium ${style.text}`}>{title}</p>
          {icon && (
            <div className={`w-8 h-8 rounded-lg ${style.bg} bg-opacity-10 flex items-center justify-center`}>
              {icon}
            </div>
          )}
        </div>
        <p className="text-3xl font-bold text-gray-900 mb-1">
          <AnimatedNumber value={Math.round(value)} />
          <span className="text-lg font-medium text-gray-400 ml-1">{unit}</span>
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${style.bg} opacity-20`} />
    </div>
  );
};

const Results = ({ data, onSuggest }) => {
  const { daily, perMeal, input, bmr, tdee } = data;
  const mealFrequency = input.mealFrequency;
  const calorieAdjustment = input.calorieAdjustment || 0;

  const goalLabels = {
    mantenimiento: 'Mantenimiento',
    definicion: 'Definición',
    volumen: 'Volumen'
  };

  const activityLabels = {
    sedentario: 'Sedentario',
    ligero: 'Ligeramente activo',
    moderado: 'Moderadamente activo',
    activo: 'Activo',
    muy_activo: 'Muy activo'
  };

  const sexLabels = {
    hombre: 'Hombre',
    mujer: 'Mujer'
  };

  const goalIcons = {
    mantenimiento: <ArrowUpDown className="w-4 h-4" />,
    definicion: <TrendingDown className="w-4 h-4" />,
    volumen: <TrendingUp className="w-4 h-4" />
  };

  const adjustmentInfo = {
    mantenimiento: null,
    definicion: { label: 'Déficit', value: calorieAdjustment, color: 'from-red-500 to-orange-500', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600' },
    volumen: { label: 'Superávit', value: calorieAdjustment, color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600' }
  };

  const currentAdjustment = adjustmentInfo[input.goal];

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 rounded-full text-brand-700 text-sm font-medium mb-3">
          <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
          Resultados personalizados
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Tu Plan Nutricional
        </h2>
        <p className="text-gray-500">
          Basado en tus datos: {sexLabels[input.sex]} • {input.weightKg} kg • {input.heightCm} cm • {input.age} años
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MacroCard
          title="Calorías Diarias"
          value={daily.calories}
          unit="kcal"
          subtitle="Meta diaria"
          color="brand"
          icon={<Flame className="w-4 h-4 text-brand-500" />}
          delay={0}
        />
        <MacroCard
          title="Proteínas"
          value={daily.protein.grams}
          unit="g"
          subtitle={`${daily.protein.calories} kcal`}
          color="blue"
          icon={<Beef className="w-4 h-4 text-blue-500" />}
          delay={100}
        />
        <MacroCard
          title="Grasas"
          value={daily.fat.grams}
          unit="g"
          subtitle={`${daily.fat.calories} kcal`}
          color="orange"
          icon={<Droplets className="w-4 h-4 text-orange-500" />}
          delay={200}
        />
        <MacroCard
          title="Carbohidratos"
          value={daily.carbs.grams}
          unit="g"
          subtitle={`${daily.carbs.calories} kcal`}
          color="purple"
          icon={<Wheat className="w-4 h-4 text-purple-500" />}
          delay={300}
        />
      </div>

      <div className="card bg-gradient-to-br from-surface-50 to-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
            <Brain className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-gray-900">Metabolismo y Gasto</h3>
            <p className="text-sm text-gray-500">Tu consumo calórico según tu actividad</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-surface-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">BMR</span>
              <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center" title="Metabolismo Basal">
                <svg className="w-2.5 h-2.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{bmr} <span className="text-sm font-normal text-gray-400">kcal</span></p>
            <p className="text-xs text-gray-400 mt-1">Calorías en reposo</p>
          </div>
          
          <div className="bg-gradient-to-br from-brand-50 to-white rounded-xl p-4 border border-brand-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-brand-600 uppercase tracking-wide">TDEE</span>
              <div className="w-4 h-4 rounded-full bg-brand-100 flex items-center justify-center" title="Gasto Energético Total">
                <svg className="w-2.5 h-2.5 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-brand-700">{tdee} <span className="text-sm font-normal text-brand-400">kcal</span></p>
            <p className="text-xs text-brand-600 mt-1">Con actividad física</p>
          </div>
        </div>
        
        {currentAdjustment && (
          <div className={`mt-4 p-4 rounded-xl ${currentAdjustment.bg} border ${currentAdjustment.border} bg-gradient-to-r ${currentAdjustment.color} bg-opacity-10`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${currentAdjustment.bg} flex items-center justify-center`}>
                  {input.goal === 'definicion' ? (
                    <TrendingDown className={`w-5 h-5 ${currentAdjustment.text}`} />
                  ) : (
                    <TrendingUp className={`w-5 h-5 ${currentAdjustment.text}`} />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${currentAdjustment.text}`}>
                    {currentAdjustment.label} calórico aplicado
                  </p>
                  <p className="text-xs text-gray-500">
                    {input.goal === 'definicion' ? 'Reduce tus calorías' : 'Aumenta tus calorías'} para alcanzar tu objetivo
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${currentAdjustment.text}`}>
                  {input.goal === 'definicion' ? '-' : '+'}{currentAdjustment.value} <span className="text-sm font-normal">kcal</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-display font-semibold text-gray-900">Distribución por Comida</h3>
              <p className="text-sm text-gray-500">{input.mealFrequency} comidas al día</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm font-medium flex items-center gap-1">
            {goalIcons[input.goal]}
            {goalLabels[input.goal]}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Calorías', value: perMeal.calories, unit: 'kcal', color: 'bg-brand-500' },
            { label: 'Proteína', value: perMeal.protein.grams, unit: 'g', color: 'bg-blue-500' },
            { label: 'Grasa', value: perMeal.fat.grams, unit: 'g', color: 'bg-orange-500' },
            { label: 'Carbos', value: perMeal.carbs.grams, unit: 'g', color: 'bg-purple-500' }
          ].map((item, index) => (
            <div key={item.label} className="text-center p-3 bg-surface-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
              <p className="text-xl font-bold text-gray-900">
                {Math.round(item.value)}
                <span className="text-xs font-normal text-gray-400 ml-0.5">{item.unit}</span>
              </p>
              <div className={`h-1 ${item.color} rounded-full mt-2 mx-auto w-8`} />
            </div>
          ))}
        </div>

        <button
          onClick={onSuggest}
          className="w-full mt-4 py-4 px-6 bg-gradient-to-r from-brand-500 to-emerald-500 text-white font-bold rounded-2xl
            shadow-xl shadow-brand-500/30 transition-all duration-300
            hover:from-brand-600 hover:to-emerald-600 hover:shadow-2xl hover:shadow-brand-500/40
            hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 group"
        >
          <UtensilsCrossed className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <span className="text-lg">Generar Plan de Comidas</span>
        </button>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-display font-semibold text-amber-800 mb-1">Importante</h4>
            <p className="text-sm text-amber-700 leading-relaxed">
              Este cálculo es un punto de partida. Ajusta según tu progreso real y consulta con un profesional de la salud.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
