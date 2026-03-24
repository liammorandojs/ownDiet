const db = require('../database');

const calculateMacros = (req, res) => {
    const { weightKg, goal, mealFrequency, heightCm, age, sex, activityLevel, calorieAdjustment } = req.body;
    const userId = req.user ? req.user.userId : null;

    if (!weightKg || weightKg <= 0) {
        return res.status(400).json({
            success: false,
            error: 'El peso debe ser un número mayor a 0'
        });
    }

    if (!heightCm || heightCm <= 0) {
        return res.status(400).json({
            success: false,
            error: 'La altura debe ser un número mayor a 0'
        });
    }

    if (!age || age <= 0) {
        return res.status(400).json({
            success: false,
            error: 'La edad debe ser un número mayor a 0'
        });
    }

    const validSex = ['hombre', 'mujer'];
    if (!sex || !validSex.includes(sex)) {
        return res.status(400).json({
            success: false,
            error: 'El sexo debe ser: hombre o mujer'
        });
    }

    const validActivityLevels = ['sedentario', 'ligero', 'moderado', 'activo', 'muy_activo'];
    if (!activityLevel || !validActivityLevels.includes(activityLevel)) {
        return res.status(400).json({
            success: false,
            error: 'El nivel de actividad debe ser: sedentario, ligero, moderado, activo o muy_activo'
        });
    }

    const validGoals = ['mantenimiento', 'definicion', 'volumen'];
    if (!goal || !validGoals.includes(goal)) {
        return res.status(400).json({
            success: false,
            error: 'El objetivo debe ser: mantenimiento, definicion o volumen'
        });
    }

    if (!mealFrequency || mealFrequency < 1 || mealFrequency > 10 || !Number.isInteger(mealFrequency)) {
        return res.status(400).json({
            success: false,
            error: 'La frecuencia de comidas debe ser un número entero entre 1 y 10'
        });
    }

    if (goal !== 'mantenimiento') {
        const adjustment = calorieAdjustment !== undefined ? parseInt(calorieAdjustment) : 500;
        
        if (adjustment < 200) {
            return res.status(400).json({
                success: false,
                error: 'El ajuste calórico debe ser al menos 200 kcal para resultados seguros'
            });
        }
    }

    const bmr = sex === 'hombre'
        ? (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5
        : (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;

    const activityMultipliers = {
        sedentario: 1.2,
        ligero: 1.375,
        moderado: 1.55,
        activo: 1.725,
        muy_activo: 1.9
    };

    const tdee = bmr * activityMultipliers[activityLevel];

    let adjustedCalories = tdee;
    let appliedAdjustment = 0;

    if (goal === 'definicion') {
        appliedAdjustment = calorieAdjustment !== undefined ? parseInt(calorieAdjustment) : 500;
        adjustedCalories = tdee - appliedAdjustment;
    } else if (goal === 'volumen') {
        appliedAdjustment = calorieAdjustment !== undefined ? parseInt(calorieAdjustment) : 500;
        adjustedCalories = tdee + appliedAdjustment;
    }

    if (adjustedCalories < 1200) {
        adjustedCalories = 1200;
    }

    const proteinGrams = weightKg * 2;
    const proteinCalories = proteinGrams * 4;

    const fatGrams = weightKg * 0.8;
    const fatCalories = fatGrams * 9;

    const carbCalories = adjustedCalories - (proteinCalories + fatCalories);
    const carbGrams = carbCalories / 4;

    let finalProteinGrams = proteinGrams;
    let finalFatGrams = fatGrams;
    let finalCarbsGrams = carbGrams;

    if (carbGrams < 0) {
        const proteinCaloriesAdjusted = adjustedCalories * 0.3;
        finalProteinGrams = proteinCaloriesAdjusted / 4;
        const fatCaloriesAdjusted = adjustedCalories * 0.35;
        finalFatGrams = fatCaloriesAdjusted / 9;
        finalCarbsGrams = (adjustedCalories - proteinCaloriesAdjusted - fatCaloriesAdjusted) / 4;
    }

    const result = {
        input: { weightKg, goal, mealFrequency, heightCm, age, sex, activityLevel, calorieAdjustment: appliedAdjustment },
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        daily: {
            calories: Math.round(adjustedCalories),
            protein: {
                grams: Math.round(finalProteinGrams * 10) / 10,
                calories: Math.round(finalProteinGrams * 4)
            },
            fat: {
                grams: Math.round(finalFatGrams * 10) / 10,
                calories: Math.round(finalFatGrams * 9)
            },
            carbs: {
                grams: Math.round(finalCarbsGrams * 10) / 10,
                calories: Math.round(finalCarbsGrams * 4)
            }
        },
        perMeal: {
            calories: Math.round(adjustedCalories / mealFrequency),
            protein: { grams: Math.round((finalProteinGrams / mealFrequency) * 10) / 10 },
            fat: { grams: Math.round((finalFatGrams / mealFrequency) * 10) / 10 },
            carbs: { grams: Math.round((finalCarbsGrams / mealFrequency) * 10) / 10 }
        }
    };

    if (userId) {
        try {
            db.prepare(`
                INSERT INTO calculation_history 
                (user_id, weight_kg, height_cm, age, sex, activity_level, goal, meal_frequency, 
                bmr, tdee, calories, protein_grams, fat_grams, carbs_grams)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                userId, weightKg, heightCm, age, sex, activityLevel, goal, mealFrequency,
                Math.round(bmr), Math.round(tdee), Math.round(adjustedCalories),
                Math.round(finalProteinGrams * 10) / 10, Math.round(finalFatGrams * 10) / 10, Math.round(finalCarbsGrams * 10) / 10
            );
            result.saved = true;
        } catch (error) {
            console.error('Error saving to history:', error);
        }
    }

    return res.json({
        success: true,
        data: result
    });
};

const getHistory = (req, res) => {
    const userId = req.user.userId;

    try {
        const history = db.prepare(`
            SELECT * FROM calculation_history 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `).all(userId);

        const formattedHistory = history.map(item => ({
            id: item.id,
            input: {
                weightKg: item.weight_kg,
                heightCm: item.height_cm,
                age: item.age,
                sex: item.sex,
                activityLevel: item.activity_level,
                goal: item.goal,
                mealFrequency: item.meal_frequency
            },
            bmr: item.bmr,
            tdee: item.tdee,
            daily: {
                calories: item.calories,
                protein: { grams: item.protein_grams },
                fat: { grams: item.fat_grams },
                carbs: { grams: item.carbs_grams }
            },
            createdAt: item.created_at
        }));

        res.json({
            success: true,
            data: formattedHistory
        });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener el historial'
        });
    }
};

const deleteHistoryItem = (req, res) => {
    const userId = req.user.userId;
    const { id } = req.params;

    try {
        const result = db.prepare(`
            DELETE FROM calculation_history WHERE id = ? AND user_id = ?
        `).run(id, userId);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                error: 'Registro no encontrado'
            });
        }

        res.json({
            success: true,
            data: { deleted: true }
        });
    } catch (error) {
        console.error('Error deleting history item:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar el registro'
        });
    }
};

module.exports = { calculateMacros, getHistory, deleteHistoryItem };
