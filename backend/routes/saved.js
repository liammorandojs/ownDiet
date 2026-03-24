const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/items', async (req, res) => {
    try {
        const items = await db.getAll();
        res.json({ success: true, data: items });
    } catch (error) {
        console.error('Error getting saved items:', error);
        res.status(500).json({ success: false, error: 'Error al obtener elementos guardados' });
    }
});

router.get('/meals', async (req, res) => {
    try {
        const items = await db.getMeals();
        res.json({ success: true, data: items });
    } catch (error) {
        console.error('Error getting saved meals:', error);
        res.status(500).json({ success: false, error: 'Error al obtener comidas guardadas' });
    }
});

router.get('/days', async (req, res) => {
    try {
        const items = await db.getDays();
        res.json({ success: true, data: items });
    } catch (error) {
        console.error('Error getting saved days:', error);
        res.status(500).json({ success: false, error: 'Error al obtener dias guardados' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const item = await db.getById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, error: 'Elemento no encontrado' });
        }
        res.json({ success: true, data: item });
    } catch (error) {
        console.error('Error getting saved item:', error);
        res.status(500).json({ success: false, error: 'Error al obtener elemento' });
    }
});

router.post('/meal', async (req, res) => {
    try {
        const { name, meal } = req.body;
        
        if (!name || !meal) {
            return res.status(400).json({ success: false, error: 'Nombre y datos de comida requeridos' });
        }

        const mealType = meal.tipo || meal.type || null;
        const data = {
            comida: meal.comida || meal.name || name,
            tipo: mealType,
            items: meal.items || [],
            totales: meal.totales || {}
        };

        const result = await db.create(name, 'meal', mealType, 1, data);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error saving meal:', error);
        res.status(500).json({ success: false, error: 'Error al guardar comida' });
    }
});

router.post('/day', async (req, res) => {
    try {
        const { name, meals } = req.body;
        
        if (!name || !meals || !Array.isArray(meals)) {
            return res.status(400).json({ success: false, error: 'Nombre y array de comidas requeridos' });
        }

        const data = meals.map(meal => ({
            comida: meal.comida || meal.name,
            tipo: meal.tipo || meal.type,
            items: meal.items || [],
            totales: meal.totales || {}
        }));

        const result = await db.create(name, 'day', null, meals.length, data);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error saving day:', error);
        res.status(500).json({ success: false, error: 'Error al guardar dia' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deleted = await db.remove(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Elemento no encontrado' });
        }
        res.json({ success: true, data: { deleted: true } });
    } catch (error) {
        console.error('Error deleting saved item:', error);
        res.status(500).json({ success: false, error: 'Error al eliminar elemento' });
    }
});

module.exports = router;
