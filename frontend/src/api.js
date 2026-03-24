const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const register = async (data) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Error al registrar');
    }

    return result;
};

export const login = async (data) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Error al iniciar sesión');
    }

    return result;
};

export const calculateMacros = async (data) => {
    const response = await fetch(`${API_URL}/api/calculate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            throw new Error('Sesión expirada');
        }
        throw new Error(result.error || 'Error al calcular los macronutrientes');
    }

    return result;
};

export const getHistory = async () => {
    const response = await fetch(`${API_URL}/api/history`, {
        headers: {
            ...getAuthHeaders()
        },
    });

    const result = await response.json();

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            throw new Error('Sesión expirada');
        }
        throw new Error(result.error || 'Error al obtener el historial');
    }

    return result;
};

export const deleteHistoryItem = async (id) => {
    const response = await fetch(`${API_URL}/api/history/${id}`, {
        method: 'DELETE',
        headers: {
            ...getAuthHeaders()
        },
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar');
    }

    return result;
};

export const suggestDiet = async (meals, mealCount) => {
    const response = await fetch(`${API_URL}/api/suggest`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meals, mealCount }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Error al generar sugerencias');
    }

    return result;
};

export const refreshMeal = async (protein_g, fat_g, carbs_g, meal_index, meal_count) => {
    const response = await fetch(`${API_URL}/api/refresh-meal`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ protein_g, fat_g, carbs_g, meal_index, meal_count }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Error al regenerar la comida');
    }

    return result;
};

export const getSavedMeals = async () => {
    const response = await fetch(`${API_URL}/api/saved/meals`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Error al obtener comidas guardadas');
    return result;
};

export const getSavedDays = async () => {
    const response = await fetch(`${API_URL}/api/saved/days`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Error al obtener días guardados');
    return result;
};

export const saveMeal = async (name, meal) => {
    const response = await fetch(`${API_URL}/api/saved/meal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, meal }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Error al guardar comida');
    return result;
};

export const saveDay = async (name, meals) => {
    const response = await fetch(`${API_URL}/api/saved/day`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, meals }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Error al guardar día');
    return result;
};

export const getSavedItem = async (id) => {
    const response = await fetch(`${API_URL}/api/saved/${id}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Error al obtener elemento');
    return result;
};

export const deleteSavedItem = async (id) => {
    const response = await fetch(`${API_URL}/api/saved/${id}`, {
        method: 'DELETE',
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Error al eliminar');
    return result;
};
