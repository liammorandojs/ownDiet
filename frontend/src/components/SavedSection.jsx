import { useState, useEffect, useCallback } from 'react';
import { Bookmark, Calendar, Trash2, Upload, Plus, X, Check, AlertCircle, BookmarkPlus } from 'lucide-react';
import { getSavedMeals, getSavedDays, saveMeal, saveDay, getSavedItem, deleteSavedItem } from '../api';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-600',
    error: 'bg-red-500',
    info: 'bg-gray-800'
  };

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 ${styles[type]} text-white px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2.5 animate-slide-up z-50 text-sm font-medium`}>
      {type === 'success' && <Check className="w-4 h-4" />}
      {type === 'error' && <AlertCircle className="w-4 h-4" />}
      <span>{message}</span>
    </div>
  );
};

const SaveNameModal = ({ isOpen, onClose, onSave, title, type }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      setName('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Nombre del ${type}`}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            autoFocus
          />
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2 px-4 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancelar
            </button>
            <button type="submit" disabled={!name.trim()} className="flex-1 py-2 px-4 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SavedSection = ({ meals, onLoadMeal, onLoadDay }) => {
  const [savedMeals, setSavedMeals] = useState([]);
  const [savedDays, setSavedDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSaveMealModal, setShowSaveMealModal] = useState(false);
  const [showSaveDayModal, setShowSaveDayModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  const loadSavedItems = async () => {
    setLoading(true);
    try {
      const [mealsRes, daysRes] = await Promise.all([getSavedMeals(), getSavedDays()]);
      setSavedMeals(mealsRes.data || []);
      setSavedDays(daysRes.data || []);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedItems();
  }, []);

  const handleSaveMeal = async (name) => {
    if (!selectedMealType) {
      showToast('Selecciona una comida primero', 'error');
      return;
    }
    
    const meal = meals.find(m => m.tipo === selectedMealType);
    if (!meal) {
      showToast('No se encontró la comida', 'error');
      return;
    }

    try {
      await saveMeal(name, meal);
      setShowSaveMealModal(false);
      setSelectedMealType(null);
      loadSavedItems();
      showToast('Comida guardada', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleSaveDay = async (name) => {
    try {
      await saveDay(name, meals);
      setShowSaveDayModal(false);
      loadSavedItems();
      showToast('Día guardado', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleLoadMeal = async (id) => {
    try {
      const result = await getSavedItem(id);
      const mealData = result.data.data;
      onLoadMeal(mealData);
      showToast('Comida cargada', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleLoadDay = async (id) => {
    try {
      const result = await getSavedItem(id);
      const dayData = result.data.data;
      onLoadDay(dayData);
      showToast('Día cargado', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSavedItem(id);
      loadSavedItems();
      showToast('Eliminado', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const mealTypeOptions = [
    { value: 'desayuno', label: 'Desayuno', emoji: '☕' },
    { value: 'almuerzo', label: 'Almuerzo', emoji: '🍽️' },
    { value: 'merienda', label: 'Merienda', emoji: '🍎' },
    { value: 'cena', label: 'Cena', emoji: '🌙' },
    { value: 'colacion', label: 'Colación', emoji: '🍪' },
  ];

  return (
    <div className="mt-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-brand-600" />
            <h3 className="font-semibold text-gray-900">Comidas Guardadas</h3>
          </div>
          <button
            onClick={() => setShowSaveDayModal(true)}
            className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Guardar día
          </button>
        </div>

        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Guardar comida individual:</p>
          <div className="flex flex-wrap gap-2">
            {mealTypeOptions.map((type) => {
              const meal = meals.find(m => m.tipo === type.value);
              const hasContent = meal && meal.items && meal.items.length > 0;
              
              return (
                <button
                  key={type.value}
                  onClick={() => {
                    setSelectedMealType(type.value);
                    setShowSaveMealModal(true);
                  }}
                  disabled={!hasContent}
                  className={`flex items-center gap-1.5 py-1.5 px-3 text-xs font-medium rounded-lg border transition-colors ${
                    hasContent 
                      ? 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100' 
                      : 'bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span>{type.emoji}</span>
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-6 text-gray-500 text-sm">Cargando...</div>
        ) : (
          <div className="space-y-4">
            {savedDays.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Días completos ({savedDays.length})
                </p>
                <div className="space-y-2">
                  {savedDays.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.meal_count} comidas</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleLoadDay(item.id)}
                          className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Cargar día"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {savedMeals.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                  <Bookmark className="w-3.5 h-3.5" />
                  Comidas individuales ({savedMeals.length})
                </p>
                <div className="space-y-2">
                  {savedMeals.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {mealTypeOptions.find(t => t.value === item.meal_type)?.emoji || '🍽️'}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            {mealTypeOptions.find(t => t.value === item.meal_type)?.label || item.meal_type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleLoadMeal(item.id)}
                          className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Cargar comida"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {savedMeals.length === 0 && savedDays.length === 0 && (
              <div className="text-center py-6 text-gray-400 text-sm">
                <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No hay comidas guardadas</p>
                <p className="text-xs mt-1">Guarda tus comidas favoritas para reutilizarlas</p>
              </div>
            )}
          </div>
        )}
      </div>

      <SaveNameModal
        isOpen={showSaveMealModal}
        onClose={() => {
          setShowSaveMealModal(false);
          setSelectedMealType(null);
        }}
        onSave={handleSaveMeal}
        title="Guardar comida"
        type="comida"
      />

      <SaveNameModal
        isOpen={showSaveDayModal}
        onClose={() => setShowSaveDayModal(false)}
        onSave={handleSaveDay}
        title="Guardar día completo"
        type="día"
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default SavedSection;
