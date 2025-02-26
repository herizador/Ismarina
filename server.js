const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// 📌 Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error al conectar:', err));

// 📌 Modelos de MongoDB

// Modelo de usuario
const UserSchema = new mongoose.Schema({
    username: String,
    password: String
});
const User = mongoose.model("User", UserSchema);

// Modelo de diario
const DiarySchema = new mongoose.Schema({
    user: String,
    entry: String,
    date: { type: Date, default: Date.now }
});
const Diary = mongoose.model("Diary", DiarySchema);

// Modelo de corazones
const HeartSchema = new mongoose.Schema({
    user: String,
    count: { type: Number, default: 0 }
});
const Heart = mongoose.model("Heart", HeartSchema);

// Modelo de recuerdos privados
const PrivateMemorySchema = new mongoose.Schema({
    user: String,
    memory: String,
    date: { type: Date, default: Date.now }
});
const PrivateMemory = mongoose.model("PrivateMemory", PrivateMemorySchema);

// Modelo de notificaciones
const NotificationSchema = new mongoose.Schema({
    message: String,
    date: { type: Date, default: Date.now }
});
const Notification = mongoose.model("Notification", NotificationSchema);

// 📌 Ruta de prueba
app.get('/', (req, res) => {
    res.send('🚀 Servidor funcionando correctamente');
});

// 📌 Rutas de autenticación
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "❌ Usuario y contraseña son obligatorios" });
        }

        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ error: "❌ El usuario ya existe" });
        }

        const newUser = new User({ username, password });
        await newUser.save();
        res.json({ message: "✅ Usuario registrado con éxito" });

    } catch (error) {
        res.status(500).json({ error: "❌ Error en el servidor" });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "❌ Usuario y contraseña son obligatorios" });
        }

        const user = await User.findOne({ username, password });
        if (!user) {
            return res.status(400).json({ error: "❌ Credenciales incorrectas" });
        }

        res.json({ message: "✅ Inicio de sesión exitoso" });

    } catch (error) {
        res.status(500).json({ error: "❌ Error en el servidor" });
    }
});

// 📌 Rutas del diario de amor
app.get('/diary', async (req, res) => {
    try {
        const entries = await Diary.find();
        res.json(entries);
    } catch (error) {
        res.status(500).json({ error: "❌ Error al obtener las entradas" });
    }
});

app.post('/diary', async (req, res) => {
    try {
        const { user, entry } = req.body;
        if (!user || !entry) {
            return res.status(400).json({ error: "❌ Usuario y entrada son obligatorios" });
        }

        const newEntry = new Diary({ user, entry });
        await newEntry.save();
        res.json({ message: "✅ Entrada agregada al diario", newEntry });

    } catch (error) {
        res.status(500).json({ error: "❌ Error al guardar la entrada" });
    }
});

// 📌 Rutas de recuerdos privados
app.get('/recuerdos', async (req, res) => {
    const { user } = req.query;
    const memories = await PrivateMemory.find({ user });
    res.json(memories);
});

app.post('/recuerdos', async (req, res) => {
    const { user, memory } = req.body;
    const newMemory = new PrivateMemory({ user, memory });
    await newMemory.save();
    res.json({ message: "💖 Recuerdo privado guardado", newMemory });
});

// 📌 Rutas del contador de corazones
app.get('/hearts', async (req, res) => {
    try {
        const { user } = req.query;
        if (!user) {
            return res.status(400).json({ error: "❌ Usuario es obligatorio" });
        }

        const heartData = await Heart.findOne({ user }) || { user, count: 0 };
        res.json(heartData);

    } catch (error) {
        res.status(500).json({ error: "❌ Error al obtener los corazones" });
    }
});

app.post('/hearts', async (req, res) => {
    try {
        const { user } = req.body;
        if (!user) {
            return res.status(400).json({ error: "❌ Usuario es obligatorio" });
        }

        let heartData = await Heart.findOne({ user });

        if (!heartData) {
            heartData = new Heart({ user, count: 1 });
        } else {
            heartData.count += 1;
        }

        await heartData.save();
        res.json({ message: "💖 Corazón agregado!", count: heartData.count });

    } catch (error) {
        res.status(500).json({ error: "❌ Error al actualizar los corazones" });
    }
});

// 📌 Rutas de notificaciones personalizadas
app.get('/notificaciones', async (req, res) => {
    const notifications = await Notification.find();
    res.json(notifications);
});

app.post('/notificaciones', async (req, res) => {
    const { message } = req.body;
    const newNotification = new Notification({ message });
    await newNotification.save();
    res.json({ message: "🔔 Notificación guardada", newNotification });
});

// 📌 Iniciar servidor
app.listen(PORT, () => {
    console.log(`🔥 Servidor corriendo en el puerto ${PORT}`);
});
