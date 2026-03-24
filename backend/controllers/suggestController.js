const foodsData = require('../data/foods.json');
const { planDay } = require('../utils/globalMealPlanner');

const suggestDiet = (req, res) => {
    try {
        const { meals, mealCount } = req.body;

        if (!meals || !Array.isArray(meals) || meals.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere un array de comidas con objetivos de macros'
            });
        }

        const mealsTargets = meals.map(meal => ({
            protein: meal.protein_g || 0,
            fat: meal.fat_g || 0,
            carbs: meal.carbs_g || 0
        }));

        const result = planDay(mealsTargets, foodsData.foods);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Suggest diet error:', error);
        res.status(500).json({
            success: false,
            error: 'Error al generar sugerencias'
        });
    }
};

const refreshMeal = (req, res) => {
    try {
        const { protein_g, fat_g, carbs_g, meal_index, meal_count } = req.body;

        if (protein_g === undefined || fat_g === undefined || carbs_g === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Faltan parámetros requeridos'
            });
        }

        const mealNames = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena', 'Colación 1', 'Colación 2'];
        const mealTypes = ['desayuno', 'almuerzo', 'merienda', 'cena', 'colacion', 'colacion'];
        
        const mealType = mealTypes[meal_index] || 'almuerzo';
        
        const result = planDay([{ protein: protein_g, fat: fat_g, carbs: carbs_g }], foodsData.foods);
        
        if (!result.comidas || result.comidas.length === 0) {
            return res.json({
                success: true,
                data: {
                    comida: mealNames[meal_index] || `Comida ${meal_index + 1}`,
                    tipo: mealType,
                    items: [],
                    totales: { proteinas: 0, carbohidratos: 0, grasas: 0, calorias: 0 }
                }
            });
        }
        
        const meal = result.comidas[0];

        res.json({
            success: true,
            data: meal
        });
    } catch (error) {
        console.error('Refresh meal error:', error);
        res.status(500).json({
            success: false,
            error: 'Error al regenerar la comida'
        });
    }
};

const getFoods = (req, res) => {
    res.json({
        success: true,
        data: foodsData.foods
    });
};

module.exports = { suggestDiet, refreshMeal, getFoods };
