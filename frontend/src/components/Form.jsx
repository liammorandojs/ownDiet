import { useState } from 'react';
import { Calculator, TrendingUp, ChevronDown, AlertCircle } from 'lucide-react';

const FloatingInput = ({ 
  label, 
  name, 
  type = 'number', 
  value, 
  onChange, 
  placeholder, 
  min, 
  max, 
  step,
  suffix,
  error,
  required = false
}) => {
  const [focused, setFocused] = useState(false);
  const hasValue = value !== '' && value !== null && value !== undefined;

  return (
    <div className="relative">
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        min={min}
        max={max}
        step={step}
        required={required}
        className={`peer w-full px-4 pt-6 pb-2 pr-12 bg-white border-2 rounded-xl
          text-gray-800 placeholder-transparent
          transition-all duration-200
          focus:outline-none focus:ring-0
          ${error 
            ? 'border-red-400 focus:border-red-500' 
            : 'border-surface-200 focus:border-brand-500 hover:border-surface-300'
          }
          ${hasValue || focused ? 'pt-6 pb-2' : 'pt-2 pb-6'}
          ${type === 'number' ? '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' : ''}
        `}
        placeholder={placeholder}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      <label
        htmlFor={name}
        className={`absolute left-4 transition-all duration-200 pointer-events-none
          ${focused || hasValue 
            ? 'top-2 text-xs' 
            : 'top-1/2 -translate-y-1/2 text-base'
          }
          ${error ? 'text-red-500' : focused ? 'text-brand-600' : 'text-gray-400'}
        `}
      >
        {label}
      </label>
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
          {suffix}
        </span>
      )}
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

const SelectInput = ({ label, name, value, onChange, options, error }) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`peer w-full px-4 pt-6 pb-2 bg-white border-2 rounded-xl
          text-gray-800 appearance-none cursor-pointer
          transition-all duration-200
          focus:outline-none
          ${error 
            ? 'border-red-400 focus:border-red-500' 
            : 'border-surface-200 focus:border-brand-500 hover:border-surface-300'
          }
        `}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <label
        htmlFor={name}
        className={`absolute left-4 top-2 text-xs transition-all duration-200 pointer-events-none
          ${focused ? 'text-brand-600' : 'text-gray-400'}
        `}
      >
        {label}
      </label>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

const Form = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    weightKg: '',
    heightCm: '',
    age: '',
    sex: 'hombre',
    activityLevel: 'moderado',
    goal: 'mantenimiento',
    mealFrequency: 4,
    calorieAdjustment: 500
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const showAdjustment = formData.goal !== 'mantenimiento';

  const goalOptions = [
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'definicion', label: 'Definición' },
    { value: 'volumen', label: 'Volumen' }
  ];

  const validateField = (name, value) => {
    const numValue = parseFloat(value);
    
    switch (name) {
      case 'weightKg':
        if (!value) return 'Requerido';
        if (numValue <= 0) return 'Debe ser mayor a 0';
        if (numValue > 300) return 'Peso inválido';
        return null;
      case 'heightCm':
        if (!value) return 'Requerido';
        if (numValue <= 0) return 'Debe ser mayor a 0';
        if (numValue < 100 || numValue > 250) return 'Altura inválida';
        return null;
      case 'age':
        if (!value) return 'Requerido';
        if (numValue < 1 || numValue > 120) return 'Edad inválida';
        return null;
      case 'mealFrequency':
        if (!value) return 'Requerido';
        if (numValue < 1 || numValue > 10) return 'Entre 1 y 10';
        return null;
      case 'calorieAdjustment':
        if (showAdjustment && (!value || numValue < 200)) {
          return 'Mínimo 200 kcal';
        }
        return null;
      default:
        return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = ['mealFrequency', 'weightKg', 'heightCm', 'age', 'calorieAdjustment'].includes(name) 
      ? parseFloat(value) || '' 
      : value;
    
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
    
    if (touched[name]) {
      const error = validateField(name, parsedValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const fieldsToValidate = ['weightKg', 'heightCm', 'age', 'mealFrequency'];
    if (showAdjustment) {
      fieldsToValidate.push('calorieAdjustment');
    }
    
    const newTouched = {};
    const newErrors = {};
    
    fieldsToValidate.forEach(field => {
      newTouched[field] = true;
      newErrors[field] = validateField(field, formData[field]);
    });
    
    setTouched(newTouched);
    setErrors(newErrors);
    
    const hasErrors = Object.values(newErrors).some(e => e !== null);
    if (hasErrors) return;
    
    const submitData = { ...formData };
    if (!showAdjustment) {
      delete submitData.calorieAdjustment;
    }
    
    onSubmit(submitData);
  };

  const isFormValid = () => {
    const baseFields = ['weightKg', 'heightCm', 'age', 'mealFrequency'].every(
      field => !validateField(field, formData[field])
    );
    
    if (showAdjustment) {
      return baseFields && !validateField('calorieAdjustment', formData.calorieAdjustment);
    }
    
    return baseFields;
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6" noValidate>
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Datos Personales
        </h2>
        <p className="text-gray-500 text-sm">
          Ingresá tu información para calcular tus macros
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FloatingInput
          label="Peso (kg)"
          name="weightKg"
          value={formData.weightKg}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="70"
          min="0.1"
          max="300"
          step="0.1"
          suffix="kg"
          error={touched.weightKg && errors.weightKg}
          required
        />
        
        <FloatingInput
          label="Altura (cm)"
          name="heightCm"
          value={formData.heightCm}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="175"
          min="1"
          max="250"
          suffix="cm"
          error={touched.heightCm && errors.heightCm}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FloatingInput
          label="Edad"
          name="age"
          value={formData.age}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="25"
          min="1"
          max="120"
          suffix="años"
          error={touched.age && errors.age}
          required
        />
        
        <SelectInput
          label="Sexo"
          name="sex"
          value={formData.sex}
          onChange={handleChange}
          options={[
            { value: 'hombre', label: 'Hombre' },
            { value: 'mujer', label: 'Mujer' }
          ]}
        />
      </div>

      <div className="pt-2">
        <SelectInput
          label="Nivel de actividad física"
          name="activityLevel"
          value={formData.activityLevel}
          onChange={handleChange}
          options={[
            { value: 'sedentario', label: 'Sedentario - Poco o nada de ejercicio' },
            { value: 'ligero', label: 'Ligero - Ejercicio 1-3 días/semana' },
            { value: 'moderado', label: 'Moderado - Ejercicio 3-5 días/semana' },
            { value: 'activo', label: 'Activo - Ejercicio 6-7 días/semana' },
            { value: 'muy_activo', label: 'Muy activo - Ejercicio intenso diario' }
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectInput
          label="Objetivo"
          name="goal"
          value={formData.goal}
          onChange={handleChange}
          options={goalOptions}
        />
        
        <FloatingInput
          label="Comidas por día"
          name="mealFrequency"
          value={formData.mealFrequency}
          onChange={handleChange}
          onBlur={handleBlur}
          min="1"
          max="10"
          error={touched.mealFrequency && errors.mealFrequency}
          required
        />
      </div>

      <div className={`transition-all duration-300 ${showAdjustment ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'}`}>
        <div className="bg-gradient-to-r from-brand-50 to-emerald-50 rounded-xl p-4 border border-brand-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                {formData.goal === 'definicion' ? 'Déficit calórico' : 'Superávit calórico'}
              </p>
              <p className="text-xs text-gray-500">kcal sobre tu mantenimiento</p>
            </div>
          </div>
          <FloatingInput
            label="Ajuste calórico (kcal)"
            name="calorieAdjustment"
            value={formData.calorieAdjustment}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="500"
            min="200"
            max="1000"
            suffix="kcal"
            error={touched.calorieAdjustment && errors.calorieAdjustment}
          />
          <p className="text-xs text-gray-500 mt-2">
            Valor recomendado: 200-500 kcal para resultados sostenibles
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !isFormValid()}
        className="btn-primary flex items-center justify-center gap-3 group"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Calculando...
          </>
        ) : (
          <>
            <Calculator className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-lg">Calcular Macros</span>
          </>
        )}
      </button>
    </form>
  );
};

export default Form;
