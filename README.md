# myOwnDiet

Calculadora de macronutrientes personalizada que calcula tus necesidades calóricas diarias y distribución de macros según tu peso, objetivo y frecuencia de comidas.

## Características

- Cálculo de calorías diarias basadas en peso y objetivo
- Distribución de macronutrientes (proteínas, grasas, carbohidratos)
- Distribución por comida según frecuencia seleccionada
- Interfaz moderna y responsive
- API REST para integración

## Stack Tecnológico

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express

## Instalación Local

### Requisitos Previos

- Node.js (v18 o superior)
- npm

### Backend

```bash
cd backend
npm install
npm start
```

El backend se ejecutará en `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend se ejecutará en `http://localhost:5173`

## Variables de Entorno

### Frontend

Crea un archivo `.env` en la carpeta `frontend`:

```env
VITE_API_URL=http://localhost:5000
```

## API REST

### Endpoint

```
POST /api/calculate
```

### Body

```json
{
  "weightKg": 70,
  "goal": "mantenimiento",
  "mealFrequency": 4
}
```

### Parámetros

| Campo | Tipo | Valores | Descripción |
|-------|------|---------|-------------|
| weightKg | número | > 0 | Peso en kilogramos |
| goal | string | "mantenimiento", "definicion", "volumen" | Objetivo nutricional |
| mealFrequency | número | 1-10 | Número de comidas diarias |

### Respuesta Exitosa

```json
{
  "success": true,
  "data": {
    "input": { "weightKg": 70, "goal": "mantenimiento", "mealFrequency": 4 },
    "daily": {
      "calories": 2310,
      "protein": { "grams": 140, "calories": 560 },
      "fat": { "grams": 35, "calories": 315 },
      "carbs": { "grams": 358.75, "calories": 1435 }
    },
    "perMeal": {
      "calories": 577,
      "protein": { "grams": 35 },
      "fat": { "grams": 8.75 },
      "carbs": { "grams": 89.7 }
    }
  }
}
```

### Respuesta de Error

```json
{
  "success": false,
  "error": "El peso debe ser un número mayor a 0"
}
```

## Despliegue

### Backend en Railway

1. Sube tu código a GitHub
2. Ve a [Railway](https://railway.app)
3. Crea un nuevo proyecto desde GitHub
4. Selecciona el repositorio `backend`
5. Railway detectará automáticamente Node.js
6. Configura la variable de entorno `PORT` si es necesario
7. Obtén la URL pública (ej: `https://myowndiet-api.up.railway.app`)

### Frontend en Vercel

1. Sube tu código a GitHub
2. Ve a [Vercel](https://vercel.com)
3. Importa el repositorio `frontend`
4. Configura:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Añade la variable de entorno:
   - Name: `VITE_API_URL`
   - Value: URL del backend desplegado (ej: `https://myowndiet-api.up.railway.app`)
6. Deploy

### Frontend en Netlify

1. Sube tu código a GitHub
2. Ve a [Netlify](https://netlify.com)
3. "Add new site" > "Import an existing project"
4. Conecta tu repositorio GitHub
5. Configura:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. En "Environment variables":
   - Key: `VITE_API_URL`
   - Value: URL del backend desplegado
7. Deploy

## Licencia

MIT
