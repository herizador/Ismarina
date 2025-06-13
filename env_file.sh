# Variables de entorno para la aplicación de amor Ismael & Marina
# Copia este archivo y renómbralo a .env

# Puerto del servidor (Render lo asigna automáticamente)
PORT=3000

# MongoDB Connection String
# Reemplaza con tu URL real de MongoDB Atlas
MONGODB_URI=mongodb+srv://tu_usuario:tu_password@cluster0.xxxxx.mongodb.net/ismarina_db?retryWrites=true&w=majority

# JWT Secret para autenticación (genera uno seguro)
JWT_SECRET=tu_jwt_secret_super_seguro_aqui_cambialo_por_favor

# Entorno de producción
NODE_ENV=production

# ========================================
# INSTRUCCIONES PARA CONFIGURAR:
# ========================================

# 1. MongoDB Atlas:
#    - Ve a https://cloud.mongodb.com/
#    - Crea una cuenta gratuita
#    - Crea un nuevo cluster
#    - Ve a "Database Access" y crea un usuario
#    - Ve a "Network Access" y permite acceso desde cualquier IP (0.0.0.0/0)
#    - Ve a "Connect" > "Connect your application"
#    - Copia la URL de conexión y reemplaza MONGODB_URI arriba

# 2. JWT Secret:
#    - Genera una clave secreta segura (puedes usar: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
#    - Reemplaza JWT_SECRET con esa clave

# 3. En Render:
#    - Ve a tu dashboard de Render
#    - Selecciona tu servicio web
#    - Ve a "Environment"
#    - Añade estas variables una por una (sin el prefijo #)

# ========================================
# EJEMPLO DE VALORES REALES:
# ========================================
# MONGODB_URI=mongodb+srv://ismael:mipassword123@cluster0.abc123.mongodb.net/ismarina_love?retryWrites=true&w=majority
# JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
# NODE_ENV=production