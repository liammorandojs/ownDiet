# myOwnDiet - Calculadora de Macros

## Despliegue Gratuito

### 1. MongoDB Atlas (Base de datos)

1. Ve a [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Crea cuenta gratis → Cluster gratuito
3. En tu cluster, crea una base de datos `myowndiet`
4. En "Network Access" → agrega IP `0.0.0.0/0`
5. En "Database Access" → crea usuario
6. Copia la URI de conexión: `mongodb+srv://usuario:password@cluster.mongodb.net/myowndiet`

### 2. Railway (Backend)

1. Ve a [railway.app](https://railway.app)
2. Conecta tu repo de GitHub
3. Nuevo proyecto → Deploy from GitHub
4. Selecciona el repositorio `ownDiet/backend`
5. En Variables de entorno agrega:
   ```
   MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/myowndiet
   PORT=5000
   ```
6. Deploy → espera a que termine
7. Copia la URL del deployment (ej: `https://myowndiet-api.up.railway.app`)

### 3. Vercel (Frontend)

1. Ve a [vercel.com](https://vercel.com)
2. Importa el proyecto desde GitHub
3. Root Directory: `frontend`
4. En Variables de entorno:
   ```
   VITE_API_URL=https://tu-backend.railway.app
   ```
5. Deploy

### 4. Actualizar frontend

Después de deploy, edita `frontend/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://TU-BACKEND-URL.up.railway.app/api/$1" }
  ]
}
```

Redeploy el frontend.

---

## Comandos locales

```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm run dev
```

## Tech Stack
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas
- **Hosting**: Vercel + Railway
