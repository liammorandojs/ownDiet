import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { RefreshCw, Plus, X, Check, AlertCircle, Trash2, Coffee, UtensilsCrossed, Apple, Moon, Cookie, ClipboardList } from 'lucide-react';
import { suggestDiet, refreshMeal } from '../api';
import FoodSelector from './FoodSelector';
import SavedSection from './SavedSection';

const mealIcons = {
  desayuno: Coffee,
  almuerzo: UtensilsCrossed,
  merienda: Apple,
  cena: Moon,
  colacion: Cookie
};

const mealAccents = {
  desayuno: 'text-amber-600 bg-amber-50 border-amber-200',
  almuerzo: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  merienda: 'text-pink-600 bg-pink-50 border-pink-200',
  cena: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  colacion: 'text-cyan-600 bg-cyan-50 border-cyan-200'
};

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

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4 p-4">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-gray-300" />
          </div>
          <div className="w-24 h-5 bg-gray-200 rounded" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(j => (
            <div key={j} className="h-10 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

const calculateItemMacros = (food, grams) => ({
  proteinas: Math.round((food.proteinas_por_100g / 100) * grams * 10) / 10,
  carbohidratos: Math.round((food.carbohidratos_por_100g / 100) * grams * 10) / 10,
  grasas: Math.round((food.grasas_por_100g / 100) * grams * 10) / 10,
  calorias: Math.round((food.proteinas_por_100g * 4 + food.grasas_por_100g * 9 + food.carbohidratos_por_100g * 4) * grams / 100)
});

const FoodRow = ({ item, onUpdate, onDelete, index, editable }) => {
  const [cantidad, setCantidad] = useState(String(item.cantidad));
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setCantidad(String(item.cantidad));
  }, [item.cantidad]);

  const handleBlur = () => {
    setIsEditing(false);
    const numValue = parseFloat(cantidad) || item.cantidad;
    const finalValue = Math.max(0, numValue);
    
    setCantidad(String(finalValue));
    
    if (finalValue !== item.cantidad && finalValue >= 0) {
      onUpdate(index, finalValue);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCantidad(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  const handleFocus = () => {
    setIsEditing(true);
    setCantidad(String(item.cantidad));
  };

  return (
    <div className={`flex items-center gap-3 py-2 px-3 rounded-lg group transition-colors ${isEditing ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-gray-50'}`}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.nombre}</p>
        <p className="text-xs text-gray-500">{item.cantidad}{item.unidad}</p>
      </div>
      
      {editable && (
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={cantidad}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-16 px-2 py-1.5 text-sm text-center font-medium text-gray-800 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
        />
      )}

      <div className="flex items-center gap-1.5 text-xs min-w-[110px]">
        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-medium w-10 text-center">{item.proteinas}g</span>
        <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded font-medium w-10 text-center">{item.carbohidratos}g</span>
        <span className="px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded font-medium w-10 text-center">{item.grasas}g</span>
      </div>

      {editable && (
        <button
          onClick={() => onDelete(index)}
          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
          title="Eliminar"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

const MealCard = ({ meal, onRefresh, onAddFood, onUpdateItem, onDeleteItem, isRefreshing }) => {
  const accent = mealAccents[meal.tipo] || mealAccents.almuerzo;
  const IconComponent = mealIcons[meal.tipo] || UtensilsCrossed;

  const totals = useMemo(() => ({
    proteinas: meal.items.reduce((sum, item) => sum + item.proteinas, 0),
    carbohidratos: meal.items.reduce((sum, item) => sum + item.carbohidratos, 0),
    grasas: meal.items.reduce((sum, item) => sum + item.grasas, 0),
    calorias: meal.items.reduce((sum, item) => sum + item.calorias, 0)
  }), [meal.items]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${accent}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-gray-900">{meal.comida}</h3>
              <p className="text-xs text-gray-500">{Math.round(totals.calorias)} kcal</p>
            </div>
          </div>
          
          <button
            onClick={() => onRefresh(meal.idx)}
            disabled={isRefreshing}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refrescar comida"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="border-t border-gray-100 my-3" />

        <div className="space-y-0.5">
          {meal.items.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              Sin alimentos - Haz clic en "Anadir" para comenzar
            </div>
          ) : (
            meal.items.map((item, i) => (
              <FoodRow 
                key={item.id || i}
                item={item}
                index={i}
                onUpdate={(idx, cantidad) => onUpdateItem(meal.idx, idx, cantidad)}
                onDelete={(idx) => onDeleteItem(meal.idx, idx)}
                editable={true}
              />
            ))
          )}
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => onRefresh(meal.idx)}
            disabled={isRefreshing}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refrescar
          </button>
          <button
            onClick={() => onAddFood(meal.idx)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Anadir alimento
          </button>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 text-xs text-gray-500">
          <span>Totales:</span>
          <div className="flex items-center gap-3">
            <span className="text-blue-600 font-medium">{Math.round(totals.proteinas * 10) / 10}g P</span>
            <span className="text-purple-600 font-medium">{Math.round(totals.carbohidratos * 10) / 10}g C</span>
            <span className="text-orange-600 font-medium">{Math.round(totals.grasas * 10) / 10}g G</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const DailySummary = ({ meals }) => {
  const totals = useMemo(() => {
    return meals.reduce((acc, meal) => ({
      proteinas: acc.proteinas + meal.items.reduce((sum, item) => sum + item.proteinas, 0),
      carbohidratos: acc.carbohidratos + meal.items.reduce((sum, item) => sum + item.carbohidratos, 0),
      grasas: acc.grasas + meal.items.reduce((sum, item) => sum + item.grasas, 0),
      calorias: acc.calorias + meal.items.reduce((sum, item) => sum + item.calorias, 0)
    }), { proteinas: 0, carbohidratos: 0, grasas: 0, calorias: 0 });
  }, [meals]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Resumen del Dia</h3>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              Calculado
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-gray-900">{Math.round(totals.calorias)}</span>
          <span className="text-sm text-gray-500 ml-1">kcal</span>
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-6 pt-2 text-sm">
        <div className="text-center">
          <span className="text-blue-600 font-bold">{Math.round(totals.proteinas * 10) / 10}g</span>
          <p className="text-[10px] text-gray-400">Proteina</p>
        </div>
        <div className="text-center">
          <span className="text-purple-600 font-bold">{Math.round(totals.carbohidratos * 10) / 10}g</span>
          <p className="text-[10px] text-gray-400">Carbohidratos</p>
        </div>
        <div className="text-center">
          <span className="text-orange-600 font-bold">{Math.round(totals.grasas * 10) / 10}g</span>
          <p className="text-[10px] text-gray-400">Grasa</p>
        </div>
      </div>
    </div>
  );
};

const DietSuggestion = ({ perMeal, mealCount, onClose }) => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [refreshingMeal, setRefreshingMeal] = useState(null);
  const [showFoodSelector, setShowFoodSelector] = useState(false);
  const [selectedMealIdx, setSelectedMealIdx] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  const convertApiMealToLocal = (apiMeal, idx) => ({
    idx,
    comida: apiMeal.comida,
    tipo: apiMeal.tipo,
    items: apiMeal.items.map((item, i) => ({
      id: `${Date.now()}-${i}`,
      nombre: item.nombre,
      cantidad: item.cantidad,
      unidad: item.unidad,
      proteinas: item.proteinas,
      carbohidratos: item.carbohidratos,
      grasas: item.grasas,
      calorias: item.calorias,
      foodData: null
    }))
  });

  const generateSuggestions = async () => {
    setLoading(true);
    
    const mealsData = Array.from({ length: mealCount }, () => ({
      protein_g: perMeal.protein.grams,
      fat_g: perMeal.fat.grams,
      carbs_g: perMeal.carbs.grams
    }));

    try {
      const result = await suggestDiet(mealsData, mealCount);
      const newMeals = result.data.comidas.map((meal, idx) => convertApiMealToLocal(meal, idx));
      setMeals(newMeals);
      showToast('Plan generado', 'success');
    } catch (err) {
      showToast(err.message || 'Error', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateSuggestions();
  }, []);

  const handleRegenerate = async () => {
    setRegenerating(true);
    await generateSuggestions();
    setRegenerating(false);
  };

  const handleRefreshMeal = async (mealIdx) => {
    setRefreshingMeal(mealIdx);
    
    try {
      const result = await refreshMeal(
        perMeal.protein.grams,
        perMeal.fat.grams,
        perMeal.carbs.grams,
        mealIdx,
        mealCount
      );
      
      const newMeal = convertApiMealToLocal(result.data, mealIdx);
      
      setMeals(prev => prev.map(m => m.idx === mealIdx ? newMeal : m));
      showToast('Comida actualizada', 'success');
    } catch (err) {
      showToast(err.message || 'Error', 'error');
    } finally {
      setRefreshingMeal(null);
    }
  };

  const handleUpdateItem = (mealIdx, itemIdx, newCantidad) => {
    if (newCantidad < 0) return;
    
    setMeals(prev => prev.map(meal => {
      if (meal.idx !== mealIdx) return meal;
      
      const item = meal.items[itemIdx];
      if (!item) return meal;
      
      const oldGrams = item.cantidad;
      if (oldGrams === 0) return meal;
      
      const factor = newCantidad / oldGrams;
      
      return {
        ...meal,
        items: meal.items.map((it, i) => {
          if (i !== itemIdx) return it;
          return {
            ...it,
            cantidad: newCantidad,
            proteinas: Math.round(it.proteinas * factor * 10) / 10,
            carbohidratos: Math.round(it.carbohidratos * factor * 10) / 10,
            grasas: Math.round(it.grasas * factor * 10) / 10,
            calorias: Math.round(it.calorias * factor)
          };
        })
      };
    }));
  };

  const handleDeleteItem = (mealIdx, itemIdx) => {
    setMeals(prev => prev.map(meal => {
      if (meal.idx !== mealIdx) return meal;
      return {
        ...meal,
        items: meal.items.filter((_, i) => i !== itemIdx)
      };
    }));
  };

  const handleOpenFoodSelector = (mealIdx) => {
    setSelectedMealIdx(mealIdx);
    setShowFoodSelector(true);
  };

  const handleSelectFood = (food) => {
    const defaultGrams = 100;
    const macros = calculateItemMacros(food, defaultGrams);
    
    const newItem = {
      id: `${Date.now()}`,
      nombre: food.nombre,
      cantidad: defaultGrams,
      unidad: 'g',
      proteinas: macros.proteinas,
      carbohidratos: macros.carbohidratos,
      grasas: macros.grasas,
      calorias: macros.calorias,
      foodData: food
    };

    setMeals(prev => prev.map(meal => {
      if (meal.idx !== selectedMealIdx) return meal;
      return {
        ...meal,
        items: [...meal.items, newItem]
      };
    }));

    showToast(`${food.nombre} anadido`, 'success');
  };

  const handleLoadMeal = (mealData) => {
    const mealType = mealData.tipo;
    const mealIdx = meals.findIndex(m => m.tipo === mealType);
    
    if (mealIdx === -1) {
      showToast('No se encontró comida del mismo tipo para reemplazar', 'error');
      return;
    }

    const convertedItems = mealData.items.map((item, i) => ({
      id: `${Date.now()}-${i}`,
      nombre: item.nombre,
      cantidad: item.cantidad,
      unidad: item.unidad || 'g',
      proteinas: item.proteinas || item.protein || 0,
      carbohidratos: item.carbohidratos || item.carbs || 0,
      grasas: item.grasas || item.fat || 0,
      calorias: item.calorias || 0,
      foodData: null
    }));

    setMeals(prev => prev.map((meal, idx) => {
      if (idx !== mealIdx) return meal;
      return {
        ...meal,
        items: convertedItems
      };
    }));

    showToast(`${mealData.comida} cargado`, 'success');
  };

  const handleLoadDay = (dayData) => {
    const loadedMeals = dayData.map((meal, idx) => ({
      idx,
      comida: meal.comida || meal.name,
      tipo: meal.tipo || meal.type,
      items: (meal.items || []).map((item, i) => ({
        id: `${Date.now()}-${idx}-${i}`,
        nombre: item.nombre || item.name,
        cantidad: item.cantidad || item.grams || 100,
        unidad: item.unidad || item.unit || 'g',
        proteinas: item.proteinas || item.protein || 0,
        carbohidratos: item.carbohidratos || item.carbs || 0,
        grasas: item.grasas || item.fat || 0,
        calorias: item.calorias || item.calories || 0,
        foodData: null
      }))
    }));

    setMeals(loadedMeals);
    showToast('Día cargado', 'success');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Tu Plan de Comidas</h2>
              <p className="text-xs text-gray-500">{mealCount} comidas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              disabled={loading || regenerating}
              className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
              Regenerar
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="mb-4">
              <DailySummary meals={meals} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {meals.map((meal) => (
                <MealCard 
                  key={meal.idx}
                  meal={meal}
                  onRefresh={handleRefreshMeal}
                  onAddFood={handleOpenFoodSelector}
                  onUpdateItem={handleUpdateItem}
                  onDeleteItem={handleDeleteItem}
                  isRefreshing={refreshingMeal === meal.idx}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <SavedSection meals={meals} onLoadMeal={handleLoadMeal} onLoadDay={handleLoadDay} />

      <FoodSelector
        isOpen={showFoodSelector}
        onClose={() => setShowFoodSelector(false)}
        onSelect={handleSelectFood}
        mealType={selectedMealIdx !== null ? meals[selectedMealIdx]?.tipo : null}
      />

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default DietSuggestion;
