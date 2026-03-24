/**
 * Global Meal Planner - Garantiza macros diarios exactos
 * Usa planificación global con selección de combinaciones y ajuste fino
 */

const MAX_COMBINATIONS = 3000;
const TOLERANCE = 0.1;
const MAX_GRAMS = 600;
const MIN_GRAMS = 10;

const getFoodsByMealType = (foods, mealType) => {
    return foods.filter(f => {
        if (!f.suitableFor || !Array.isArray(f.suitableFor)) return false;
        return f.suitableFor.includes(mealType);
    });
};

const calculateFoodMacros = (food, grams) => ({
    protein: grams * food.proteinas_por_100g / 100,
    fat: grams * food.grasas_por_100g / 100,
    carbs: grams * food.carbohidratos_por_100g / 100,
    calories: grams * food.calorias_por_100g / 100
});

const gaussianElimination = (A, b) => {
    const n = b.length;
    const aug = A.map((row, i) => [...row, b[i]]);
    
    for (let col = 0; col < n; col++) {
        let maxRow = col;
        for (let row = col + 1; row < n; row++) {
            if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
        }
        [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
        
        if (Math.abs(aug[col][col]) < 1e-12) return null;
        
        for (let row = col + 1; row < n; row++) {
            const factor = aug[row][col] / aug[col][col];
            for (let j = col; j <= n; j++) aug[row][j] -= factor * aug[col][j];
        }
    }
    
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        x[i] = aug[i][n];
        for (let j = i + 1; j < n; j++) x[i] -= aug[i][j] * x[j];
        x[i] /= aug[i][i];
    }
    return x;
};

const generateCombinations = (arr, size) => {
    if (size > arr.length) return [];
    const result = [];
    const combine = (start, combo) => {
        if (combo.length === size) {
            result.push([...combo]);
            return;
        }
        for (let i = start; i < arr.length && arr.length - i >= size - combo.length; i++) {
            combo.push(arr[i]);
            combine(i + 1, combo);
            combo.pop();
        }
    };
    combine(0, []);
    return result;
};

const findBestCombination = (foods, targets) => {
    const n = foods.length;
    if (n < 3) return null;
    
    const proteinArr = foods.map(f => f.proteinas_por_100g / 100);
    const fatArr = foods.map(f => f.grasas_por_100g / 100);
    const carbsArr = foods.map(f => f.carbohidratos_por_100g / 100);
    
    let bestSolution = null;
    let bestError = Infinity;
    let count = 0;
    
    for (let size = 3; size <= Math.min(4, n); size++) {
        const combos = generateCombinations([...Array(n).keys()], size);
        
        for (const combo of combos) {
            if (count++ > MAX_COMBINATIONS) break;
            
            const A = [
                combo.map(i => proteinArr[i]),
                combo.map(i => fatArr[i]),
                combo.map(i => carbsArr[i])
            ];
            
            const x = gaussianElimination([...A], [targets.protein, targets.fat, targets.carbs]);
            if (!x) continue;
            
            if (x.some(v => v < -0.01 || v > MAX_GRAMS * 2)) continue;
            
            const rounded = x.map(v => Math.max(0, Math.round(v * 10) / 10));
            
            const actualProtein = combo.reduce((sum, idx) => sum + rounded[combo.indexOf(idx)] * proteinArr[idx], 0);
            const actualFat = combo.reduce((sum, idx) => sum + rounded[combo.indexOf(idx)] * fatArr[idx], 0);
            const actualCarbs = combo.reduce((sum, idx) => sum + rounded[combo.indexOf(idx)] * carbsArr[idx], 0);
            
            const proteinErr = Math.abs(actualProtein - targets.protein);
            const fatErr = Math.abs(actualFat - targets.fat);
            const carbsErr = Math.abs(actualCarbs - targets.carbs);
            const totalErr = proteinErr + fatErr + carbsErr;
            
            if (totalErr < bestError) {
                bestError = totalErr;
                bestSolution = {
                    items: combo.map((foodIdx, i) => ({ food: foods[foodIdx], grams: rounded[i] })),
                    macros: { protein: actualProtein, fat: actualFat, carbs: actualCarbs },
                    error: { protein: proteinErr, fat: fatErr, carbs: carbsErr }
                };
                
                if (totalErr < TOLERANCE) return bestSolution;
            }
        }
        if (bestError < TOLERANCE) break;
    }
    
    return bestSolution;
};

const selectFoods = (mealFoods, mealType, count = 6) => {
    const categories = mealType === 'desayuno' || mealType === 'merienda' || mealType === 'colacion'
        ? ['proteina', 'carbohidratos', 'grasa', 'lacteo', 'fruta', 'verdura']
        : ['proteina', 'carbohidratos', 'grasa', 'verdura', 'legumbre'];
    
    const selected = [];
    const usedCategories = new Set();
    
    for (const cat of categories) {
        const catFoods = mealFoods.filter(f => f.categoria === cat && !usedCategories.has(f.id));
        if (catFoods.length > 0) {
            const shuffled = [...catFoods].sort(() => Math.random() - 0.5);
            selected.push(shuffled[0]);
            usedCategories.add(shuffled[0].id);
        }
        if (selected.length >= count) break;
    }
    
    if (selected.length < count) {
        const remaining = mealFoods.filter(f => !usedCategories.has(f.id));
        const shuffled = [...remaining].sort(() => Math.random() - 0.5);
        while (selected.length < count && shuffled.length > 0) {
            selected.push(shuffled.shift());
        }
    }
    
    return selected;
};

const fineTune = (items, targets) => {
    let currentItems = items.map(i => ({ ...i }));
    
    for (let iter = 0; iter < 500; iter++) {
        const currentProtein = currentItems.reduce((sum, i) => sum + i.grams * i.food.proteinas_por_100g / 100, 0);
        const currentFat = currentItems.reduce((sum, i) => sum + i.grams * i.food.grasas_por_100g / 100, 0);
        const currentCarbs = currentItems.reduce((sum, i) => sum + i.grams * i.food.carbohidratos_por_100g / 100, 0);
        
        const proteinErr = currentProtein - targets.protein;
        const fatErr = currentFat - targets.fat;
        const carbsErr = currentCarbs - targets.carbs;
        
        if (Math.abs(proteinErr) < 0.05 && Math.abs(fatErr) < 0.05 && Math.abs(carbsErr) < 0.05) break;
        
        let improved = false;
        
        for (let i = 0; i < currentItems.length; i++) {
            const pPerG = currentItems[i].food.proteinas_por_100g / 100;
            const fPerG = currentItems[i].food.grasas_por_100g / 100;
            const cPerG = currentItems[i].food.carbohidratos_por_100g / 100;
            
            for (const delta of [-0.5, 0.5]) {
                const newGrams = Math.max(MIN_GRAMS, Math.min(MAX_GRAMS, currentItems[i].grams + delta));
                if (newGrams === currentItems[i].grams) continue;
                
                const newProtein = currentItems.reduce((sum, item, j) => 
                    sum + (j === i ? newGrams : item.grams) * item.food.proteinas_por_100g / 100, 0);
                const newFat = currentItems.reduce((sum, item, j) => 
                    sum + (j === i ? newGrams : item.grams) * item.food.grasas_por_100g / 100, 0);
                const newCarbs = currentItems.reduce((sum, item, j) => 
                    sum + (j === i ? newGrams : item.grams) * item.food.carbohidratos_por_100g / 100, 0);
                
                const oldErr = Math.abs(proteinErr) + Math.abs(fatErr) + Math.abs(carbsErr);
                const newErr = Math.abs(newProtein - targets.protein) + Math.abs(newFat - targets.fat) + Math.abs(newCarbs - targets.carbs);
                
                if (newErr < oldErr - 0.01) {
                    currentItems[i] = { ...currentItems[i], grams: newGrams };
                    improved = true;
                }
            }
        }
        
        if (!improved) break;
    }
    
    return currentItems;
};

const getPureFoods = (foods) => ({
    fat: foods.find(f => f.nombre === 'Aceite de oliva'),
    protein: foods.find(f => f.nombre === 'Clara de huevo líquida'),
    carbs: foods.find(f => f.nombre === 'Dextrosa')
});

const applyExactAdjustment = (meals, dailyTargets, pureFoods) => {
    let totalProtein = 0, totalFat = 0, totalCarbs = 0;
    
    meals.forEach(meal => {
        totalProtein += meal.macros.protein;
        totalFat += meal.macros.fat;
        totalCarbs += meal.macros.carbs;
    });
    
    let deltaProtein = dailyTargets.protein - totalProtein;
    let deltaFat = dailyTargets.fat - totalFat;
    let deltaCarbs = dailyTargets.carbs - totalCarbs;
    
    const adjustments = [];
    const MIN_ADJUSTMENT = 0.5;
    
    if (pureFoods.fat && Math.abs(deltaFat) > MIN_ADJUSTMENT) {
        const grams = Math.max(0, Math.round(deltaFat / (pureFoods.fat.grasas_por_100g / 100)));
        if (grams >= MIN_ADJUSTMENT) {
            adjustments.push({ food: pureFoods.fat, grams, macro: 'fat' });
            deltaFat -= grams * pureFoods.fat.grasas_por_100g / 100;
        }
    }
    
    if (pureFoods.protein && Math.abs(deltaProtein) > MIN_ADJUSTMENT) {
        const grams = Math.max(0, Math.round(deltaProtein / (pureFoods.protein.proteinas_por_100g / 100)));
        if (grams >= MIN_ADJUSTMENT) {
            adjustments.push({ food: pureFoods.protein, grams, macro: 'protein' });
            deltaProtein -= grams * pureFoods.protein.proteinas_por_100g / 100;
        }
    }
    
    if (pureFoods.carbs && Math.abs(deltaCarbs) > MIN_ADJUSTMENT) {
        const grams = Math.max(0, Math.round(deltaCarbs / (pureFoods.carbs.carbohidratos_por_100g / 100)));
        if (grams >= MIN_ADJUSTMENT) {
            adjustments.push({ food: pureFoods.carbs, grams, macro: 'carbs' });
            deltaCarbs -= grams * pureFoods.carbs.carbohidratos_por_100g / 100;
        }
    }
    
    return { adjustments, remaining: { protein: deltaProtein, fat: deltaFat, carbs: deltaCarbs } };
};

const planDay = (mealsTargets, foods) => {
    const mealNames = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena', 'Colación 1', 'Colación 2', 'Colación 3'];
    const mealTypes = ['desayuno', 'almuerzo', 'merienda', 'cena', 'colacion', 'colacion', 'colacion'];
    
    const pureFoods = getPureFoods(foods);
    const meals = [];
    
    for (let i = 0; i < mealsTargets.length; i++) {
        const target = mealsTargets[i];
        const mealType = mealTypes[i] || 'almuerzo';
        
        const mealFoods = getFoodsByMealType(foods, mealType);
        
        if (mealFoods.length === 0) {
            meals.push({
                comida: mealNames[i] || `Comida ${i + 1}`,
                tipo: mealType,
                items: [],
                totales: { proteinas: 0, carbohidratos: 0, grasas: 0, calorias: 0 },
                macros: { protein: 0, fat: 0, carbs: 0 }
            });
            continue;
        }
        
        let bestResult = null;
        
        for (let attempt = 0; attempt < 5; attempt++) {
            const selectedFoods = selectFoods(mealFoods, mealType, 6);
            const result = findBestCombination(selectedFoods, target);
            
            if (result && (!bestResult || result.error.protein + result.error.fat + result.error.carbs < 
                bestResult.error.protein + bestResult.error.fat + bestResult.error.carbs)) {
                bestResult = result;
            }
            
            if (bestResult && bestResult.error.protein + bestResult.error.fat + bestResult.error.carbs < TOLERANCE) break;
        }
        
        if (!bestResult) {
            const selectedFoods = selectFoods(mealFoods, mealType, 5);
            const result = findBestCombination(selectedFoods, target);
            if (result) bestResult = result;
        }
        
        if (!bestResult) {
            meals.push({
                comida: mealNames[i] || `Comida ${i + 1}`,
                tipo: mealType,
                items: [],
                totales: { proteinas: 0, carbohidratos: 0, grasas: 0, calorias: 0 },
                macros: { protein: 0, fat: 0, carbs: 0 }
            });
            continue;
        }
        
        const tuned = fineTune(bestResult.items, target);
        
        const finalItems = tuned.map(item => ({
            nombre: item.food.nombre,
            cantidad: item.grams,
            unidad: 'g',
            proteinas: Math.round(item.grams * item.food.proteinas_por_100g / 100 * 10) / 10,
            carbohidratos: Math.round(item.grams * item.food.carbohidratos_por_100g / 100 * 10) / 10,
            grasas: Math.round(item.grams * item.food.grasas_por_100g / 100 * 10) / 10,
            calorias: Math.round(item.grams * item.food.calorias_por_100g / 100)
        }));
        
        const totalProtein = tuned.reduce((sum, item) => sum + item.grams * item.food.proteinas_por_100g / 100, 0);
        const totalFat = tuned.reduce((sum, item) => sum + item.grams * item.food.grasas_por_100g / 100, 0);
        const totalCarbs = tuned.reduce((sum, item) => sum + item.grams * item.food.carbohidratos_por_100g / 100, 0);
        
        meals.push({
            comida: mealNames[i] || `Comida ${i + 1}`,
            tipo: mealType,
            items: finalItems,
            totales: {
                proteinas: Math.round(totalProtein * 10) / 10,
                carbohidratos: Math.round(totalCarbs * 10) / 10,
                grasas: Math.round(totalFat * 10) / 10,
                calorias: Math.round(totalProtein * 4 + totalFat * 9 + totalCarbs * 4)
            },
            macros: { protein: totalProtein, fat: totalFat, carbs: totalCarbs }
        });
    }
    
    const dailyTargets = mealsTargets.reduce((acc, t) => ({
        protein: acc.protein + t.protein,
        fat: acc.fat + t.fat,
        carbs: acc.carbs + (t.carbs || 0)
    }), { protein: 0, fat: 0, carbs: 0 });
    
    const { adjustments, remaining } = applyExactAdjustment(meals, dailyTargets, pureFoods);
    
    if (adjustments.length > 0 && meals.length > 0) {
        adjustments.forEach(adj => {
            const macros = calculateFoodMacros(adj.food, adj.grams);
            meals[0].items.push({
                nombre: adj.food.nombre + ' (ajuste)',
                cantidad: adj.grams,
                unidad: 'g',
                proteinas: Math.round(macros.protein * 10) / 10,
                carbohidratos: Math.round(macros.carbs * 10) / 10,
                grasas: Math.round(macros.fat * 10) / 10,
                calorias: Math.round(macros.calories)
            });
            
            meals[0].totales.proteinas = Math.round((meals[0].totales.proteinas + macros.protein) * 10) / 10;
            meals[0].totales.carbohidratos = Math.round((meals[0].totales.carbohidratos + macros.carbs) * 10) / 10;
            meals[0].totales.grasas = Math.round((meals[0].totales.grasas + macros.fat) * 10) / 10;
            meals[0].totales.calorias += Math.round(macros.calories);
            meals[0].macros.protein += macros.protein;
            meals[0].macros.fat += macros.fat;
            meals[0].macros.carbs += macros.carbs;
        });
    }
    
    const grandTotals = meals.reduce((acc, meal) => ({
        proteinas: acc.proteinas + meal.macros.protein,
        carbohidratos: acc.carbohidratos + meal.macros.carbs,
        grasas: acc.grasas + meal.macros.fat,
        calorias: acc.calorias + meal.totales.calorias
    }), { proteinas: 0, carbohidratos: 0, grasas: 0, calorias: 0 });
    
    const proteinErr = Math.abs(grandTotals.proteinas - dailyTargets.protein);
    const fatErr = Math.abs(grandTotals.grasas - dailyTargets.fat);
    const carbsErr = Math.abs(grandTotals.carbohidratos - dailyTargets.carbs);
    const isExact = proteinErr < 0.5 && fatErr < 0.5 && carbsErr < 0.5;
    
    return {
        comidas: meals.map(m => ({
            comida: m.comida,
            tipo: m.tipo,
            items: m.items,
            totales: m.totales
        })),
        totalesDia: {
            proteinas: Math.round(grandTotals.proteinas * 10) / 10,
            carbohidratos: Math.round(grandTotals.carbohidratos * 10) / 10,
            grasas: Math.round(grandTotals.grasas * 10) / 10,
            calorias: grandTotals.calorias
        },
        dailyExact: isExact,
        error: { protein: proteinErr, fat: fatErr, carbs: carbsErr }
    };
};

module.exports = { planDay, getFoodsByMealType };
