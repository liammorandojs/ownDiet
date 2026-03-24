/**
 * Meal Optimizer - Encuentra la combinación exacta de alimentos para cumplir macros objetivo
 */

const MAX_COMBINATIONS = 30000;
const TOLERANCE = 0.01;
const MAX_GRAMS = 800;
const MIN_GRAMS = 5;
const MAX_ATTEMPTS = 5;

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

const pseudoInverse = (A) => {
    const m = A.length;
    const n = A[0].length;
    
    const At = A[0].map((_, col) => A.map(row => row[col]));
    const AtA = [];
    for (let i = 0; i < n; i++) {
        AtA[i] = [];
        for (let j = 0; j < n; j++) {
            AtA[i][j] = At[i].reduce((sum, val, k) => sum + val * A[k][j], 0);
        }
    }
    
    const inv = Array(n).fill(null).map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) inv[i][i] = 1;
    
    for (let col = 0; col < n; col++) {
        let maxRow = col;
        for (let row = col + 1; row < n; row++) {
            if (Math.abs(AtA[row][col]) > Math.abs(AtA[maxRow][col])) maxRow = row;
        }
        [AtA[col], AtA[maxRow]] = [AtA[maxRow], AtA[col]];
        [inv[col], inv[maxRow]] = [inv[maxRow], inv[col]];
        
        if (Math.abs(AtA[col][col]) < 1e-12) continue;
        
        const div = AtA[col][col];
        for (let j = 0; j < n; j++) AtA[col][j] /= div;
        for (let j = 0; j < n; j++) inv[col][j] /= div;
        
        for (let row = 0; row < n; row++) {
            if (row !== col) {
                const factor = AtA[row][col];
                for (let j = 0; j < n; j++) {
                    AtA[row][j] -= factor * AtA[col][j];
                    inv[row][j] -= factor * inv[col][j];
                }
            }
        }
    }
    
    const Ainv = [];
    for (let i = 0; i < n; i++) {
        Ainv[i] = [];
        for (let j = 0; j < m; j++) {
            Ainv[i][j] = 0;
            for (let k = 0; k < n; k++) {
                Ainv[i][j] += inv[i][k] * At[k][j];
            }
        }
    }
    
    return Ainv;
};

const generateCombinations = (arr, size) => {
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

const findExactSolution = (foods, targets, maxFoods = 8) => {
    const n = foods.length;
    if (n < 3) return null;
    
    const proteinArr = foods.map(f => f.proteinas_por_100g / 100);
    const fatArr = foods.map(f => f.grasas_por_100g / 100);
    const carbsArr = foods.map(f => f.carbohidratos_por_100g / 100);
    
    let count = 0;
    
    for (let size = 3; size <= Math.min(maxFoods, n); size++) {
        const combinations = generateCombinations([...Array(n).keys()], size);
        
        for (const combo of combinations) {
            if (count++ > MAX_COMBINATIONS) return null;
            
            const A = [
                combo.map(i => proteinArr[i]),
                combo.map(i => fatArr[i]),
                combo.map(i => carbsArr[i])
            ];
            
            let x;
            if (size === 3) {
                x = gaussianElimination([...A], [targets.protein, targets.fat, targets.carbs]);
            } else {
                const Ainv = pseudoInverse(A);
                x = Ainv.map((row, i) => row.reduce((sum, val, j) => sum + val * [targets.protein, targets.fat, targets.carbs][j], 0));
            }
            
            if (!x) continue;
            
            const allValid = x.every(v => v >= -0.001);
            if (!allValid) continue;
            
            const rounded = x.map(v => Math.max(0, Math.round(v * 10) / 10));
            
            const actualProtein = combo.reduce((sum, idx) => sum + rounded[combo.indexOf(idx)] * proteinArr[idx], 0);
            const actualFat = combo.reduce((sum, idx) => sum + rounded[combo.indexOf(idx)] * fatArr[idx], 0);
            const actualCarbs = combo.reduce((sum, idx) => sum + rounded[combo.indexOf(idx)] * carbsArr[idx], 0);
            
            const proteinErr = Math.abs(actualProtein - targets.protein);
            const fatErr = Math.abs(actualFat - targets.fat);
            const carbsErr = Math.abs(actualCarbs - targets.carbs);
            const totalErr = proteinErr + fatErr + carbsErr;
            
            if (totalErr < TOLERANCE) {
                return {
                    items: combo.map((foodIdx, i) => ({ food: foods[foodIdx], grams: rounded[i] })),
                    exact: proteinErr < 0.1 && fatErr < 0.1 && carbsErr < 0.1
                };
            }
        }
    }
    
    return null;
};

const nnls = (A, b, maxIter = 500) => {
    const m = A.length;
    const n = A[0].length;
    let x = new Array(n).fill(0);
    let residual = b.map((_, i) => b[i] - A[i].reduce((sum, aij, j) => sum + aij * x[j], 0));
    
    for (let iter = 0; iter < maxIter; iter++) {
        const oldX = [...x];
        
        for (let j = 0; j < n; j++) {
            if (x[j] > 0) {
                let denom = 0;
                for (let i = 0; i < m; i++) denom += A[i][j] * A[i][j];
                if (denom > 0) {
                    let grad = 0;
                    for (let i = 0; i < m; i++) grad += A[i][j] * residual[i];
                    x[j] = Math.max(0, x[j] + grad / denom);
                }
            } else {
                let grad = 0;
                for (let i = 0; i < m; i++) grad += A[i][j] * residual[i];
                if (grad > 0) {
                    let denom = 0;
                    for (let i = 0; i < m; i++) denom += A[i][j] * A[i][j];
                    x[j] = Math.max(0, grad / denom);
                }
            }
        }
        
        for (let i = 0; i < m; i++) {
            residual[i] = b[i] - A[i].reduce((sum, aij, j) => sum + aij * x[j], 0);
        }
        
        const maxChange = Math.max(...x.map((xi, i) => Math.abs(xi - oldX[i])));
        if (maxChange < 1e-8) break;
    }
    
    return x;
};

const fineTune = (items, targets) => {
    let currentItems = items.map(i => ({ ...i }));
    
    for (let iter = 0; iter < 300; iter++) {
        const currentProtein = currentItems.reduce((sum, i) => sum + i.grams * i.food.proteinas_por_100g / 100, 0);
        const currentFat = currentItems.reduce((sum, i) => sum + i.grams * i.food.grasas_por_100g / 100, 0);
        const currentCarbs = currentItems.reduce((sum, i) => sum + i.grams * i.food.carbohidratos_por_100g / 100, 0);
        
        const proteinErr = currentProtein - targets.protein;
        const fatErr = currentFat - targets.fat;
        const carbsErr = currentCarbs - targets.carbs;
        
        if (Math.abs(proteinErr) < 0.05 && Math.abs(fatErr) < 0.05 && Math.abs(carbsErr) < 0.05) break;
        
        let improved = false;
        
        for (let i = 0; i < currentItems.length; i++) {
            const step = 0.1;
            const pPerGram = currentItems[i].food.proteinas_por_100g / 100;
            const fPerGram = currentItems[i].food.grasas_por_100g / 100;
            const cPerGram = currentItems[i].food.carbohidratos_por_100g / 100;
            
            for (const delta of [-step, step]) {
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
                
                if (newErr < oldErr) {
                    currentItems[i] = { ...currentItems[i], grams: newGrams };
                    improved = true;
                }
            }
        }
        
        if (!improved) break;
    }
    
    return currentItems;
};

const selectRandomFoods = (mealFoods, mealType) => {
    const categories = mealType === 'desayuno' || mealType === 'merienda' || mealType === 'colacion'
        ? ['proteina', 'carbohidratos', 'grasa', 'lacteo', 'fruta', 'suplemento']
        : ['proteina', 'carbohidratos', 'grasa', 'verdura', 'legumbre'];
    
    const selectedFoods = [];
    for (const cat of categories) {
        const catFoods = mealFoods.filter(f => f.categoria === cat);
        if (catFoods.length > 0) {
            const shuffled = [...catFoods].sort(() => Math.random() - 0.5);
            selectedFoods.push(shuffled[0]);
        }
    }
    
    if (selectedFoods.length < 3) {
        const shuffled = [...mealFoods].sort(() => Math.random() - 0.5);
        selectedFoods.push(...shuffled.slice(0, 3 - selectedFoods.length));
    }
    
    return selectedFoods;
};

const optimizeMeal = (targetProtein, targetFat, targetCarbs, foods, mealType) => {
    const targets = {
        protein: targetProtein || 0,
        fat: targetFat || 0,
        carbs: targetCarbs || 0
    };
    
    if (targets.protein === 0 && targets.fat === 0 && targets.carbs === 0) {
        return { items: [], exact: true, warning: null };
    }
    
    const mealFoods = getFoodsByMealType(foods, mealType);
    
    if (mealFoods.length === 0) {
        return { items: [], exact: false, warning: 'No hay alimentos disponibles' };
    }
    
    let result = null;
    
    for (let attempt = 0; attempt < MAX_ATTEMPTS && !result; attempt++) {
        const selectedFoods = selectRandomFoods(mealFoods, mealType);
        
        if (selectedFoods.length < 3) continue;
        
        result = findExactSolution(selectedFoods, targets);
        
        if (!result) {
            const A = selectedFoods.map(f => [
                f.proteinas_por_100g / 100,
                f.grasas_por_100g / 100,
                f.carbohidratos_por_100g / 100
            ]);
            const b = [targets.protein, targets.fat, targets.carbs];
            
            const nnlsGrams = nnls(A, b);
            
            const validItems = nnlsGrams
                .map((g, i) => ({ grams: g, idx: i }))
                .filter(item => item.grams >= MIN_GRAMS)
                .sort((a, b) => b.grams - a.grams)
                .slice(0, 8);
            
            if (validItems.length >= 3) {
                let items = validItems.map(item => ({ 
                    food: selectedFoods[item.idx], 
                    grams: Math.round(item.grams * 10) / 10 
                }));
                
                items = fineTune(items, targets);
                
                const actualProtein = items.reduce((sum, i) => sum + i.grams * i.food.proteinas_por_100g / 100, 0);
                const actualFat = items.reduce((sum, i) => sum + i.grams * i.food.grasas_por_100g / 100, 0);
                const actualCarbs = items.reduce((sum, i) => sum + i.grams * i.food.carbohidratos_por_100g / 100, 0);
                
                const proteinErr = Math.abs(actualProtein - targets.protein);
                const fatErr = Math.abs(actualFat - targets.fat);
                const carbsErr = Math.abs(actualCarbs - targets.carbs);
                
                result = {
                    items,
                    exact: proteinErr < 0.1 && fatErr < 0.1 && carbsErr < 0.1
                };
            }
        }
    }
    
    if (!result || result.items.length === 0) {
        return { items: [], exact: false, warning: 'No se pudo encontrar combinación' };
    }
    
    const finalItems = result.items.map(item => {
        const macros = calculateFoodMacros(item.food, item.grams);
        return {
            food: item.food,
            grams: item.grams,
            protein: macros.protein,
            fat: macros.fat,
            carbs: macros.carbs,
            calories: macros.calories
        };
    });
    
    const totalProtein = finalItems.reduce((sum, item) => sum + item.protein, 0);
    const totalFat = finalItems.reduce((sum, item) => sum + item.fat, 0);
    const totalCarbs = finalItems.reduce((sum, item) => sum + item.carbs, 0);
    const totalCalories = finalItems.reduce((sum, item) => sum + item.calories, 0);
    
    return {
        items: finalItems,
        exact: result.exact,
        error: {
            protein: Math.abs(totalProtein - targets.protein),
            fat: Math.abs(totalFat - targets.fat),
            carbs: Math.abs(totalCarbs - targets.carbs)
        },
        warning: result.exact ? null : 'Aproximación'
    };
};

module.exports = { optimizeMeal, getFoodsByMealType };
