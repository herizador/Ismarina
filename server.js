const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error al conectar:', err));

const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema({
    user: String,
    entry: String,
    date: { type: Date, default: Date.now }
});

const DiaryEntry = mongoose.model('DiaryEntry', diarySchema);

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

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('🚀 Servidor funcionando correctamente');
});

// 📌 Rutas de autenticación
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ error: "El usuario ya existe" });

    const newUser = new User({ username, password });
    await newUser.save();
    res.json({ message: "✅ Usuario registrado con éxito" });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) return res.status(400).json({ error: "Credenciales incorrectas" });

    res.json({ message: "✅ Inicio de sesión exitoso" });
});

// 📌 Rutas del diario de amor
app.get('/diary', async (req, res) => {
    const entries = await Diary.find();
    res.json(entries);
});

app.post('/diary', async (req, res) => {
    const { user, entry } = req.body;
    const newEntry = new Diary({ user, entry });
    await newEntry.save();
    res.json({ message: "✅ Entrada agregada al diario" });
});

// 📌 Rutas del contador de corazones
app.get('/hearts', async (req, res) => {
    const { user } = req.query;
    const heartData = await Heart.findOne({ user }) || { count: 0 };
    res.json(heartData);
});

app.post('/hearts', async (req, res) => {
    const { user } = req.body;
    let heartData = await Heart.findOne({ user });

    if (!heartData) {
        heartData = new Heart({ user, count: 1 });
    } else {
        heartData.count += 1;
    }

    await heartData.save();
    res.json({ message: "💖 Corazón agregado!", count: heartData.count });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🔥 Servidor corriendo en el puerto ${PORT}`);
});
