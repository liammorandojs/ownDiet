import { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

const FoodSelector = ({ isOpen, onClose, onSelect, mealType }) => {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && foods.length === 0) {
      fetchFoods();
    }
  }, [isOpen]);

  const fetchFoods = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const baseUrl = window.location.origin.replace(/:\d+$/, ':5000');
      const response = await fetch(`${baseUrl}/api/foods`);
      
      if (!response.ok) {
        throw new Error('Error al cargar alimentos');
      }
      
      const result = await response.json();
      const foodsList = result.data || result || [];
      setFoods(foodsList);
    } catch (error) {
      console.error('Error loading foods:', error);
      setError('No se pudo cargar la lista de alimentos');
      setFoods([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.nombre.toLowerCase().includes(search.toLowerCase());
    const matchesMealType = !mealType || 
      !food.suitableFor || 
      food.suitableFor.includes(mealType);
    return matchesSearch && matchesMealType;
  });

  const handleSelect = (food) => {
    onSelect(food);
    setSearch('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Anadir alimento</h3>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar alimento..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
              <span className="text-sm">Cargando alimentos...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <p className="text-sm mb-3">{error}</p>
              <button 
                onClick={fetchFoods}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                Reintentar
              </button>
            </div>
          ) : filteredFoods.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              {search ? 'No se encontraron alimentos' : 'No hay alimentos disponibles'}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredFoods.map((food) => (
                <button
                  key={food.id}
                  onClick={() => handleSelect(food)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{food.nombre}</p>
                    <p className="text-xs text-gray-500">
                      P: {food.proteinas_por_100g}g • C: {food.carbohidratos_por_100g}g • G: {food.grasas_por_100g}g
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">{food.calorias_por_100g} kcal</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodSelector;
