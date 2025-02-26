import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config(); // Cargar variables de entorno

const app = express();
const PORT = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // Definida en Render

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // 📂 Carpeta con HTML, CSS, JS

// 📌 Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch(err => console.error('❌ Error al conectar:', err));

// 📌 Modelos de MongoDB
const UserSchema = new mongoose.Schema({
    username: String,
    password: String
});
const User = mongoose.model("User", UserSchema);

const DiarySchema = new mongoose.Schema({
    user: String,
    entry: String,
    date: { type: Date, default: Date.now }
});
const Diary = mongoose.model("Diary", DiarySchema);

const HeartSchema = new mongoose.Schema({
    user: String,
    count: { type: Number, default: 0 }
});
const Heart = mongoose.model("Heart", HeartSchema);

const PrivateMemorySchema = new mongoose.Schema({
    user: String,
    memory: String,
    date: { type: Date, default: Date.now }
});
const PrivateMemory = mongoose.model("PrivateMemory", PrivateMemorySchema);

const NotificationSchema = new mongoose.Schema({
    message: String,
    date: { type: Date, default: Date.now }
});
const Notification = mongoose.model("Notification", NotificationSchema);

// 📌 Asistente Virtual con IA
app.post('/asistente', async (req, res) => {
    try {
        const { message } = req.body;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }]
        });

        res.json({ response: completion.choices[0].message.content });

    } catch (error) {
        console.error("Error en OpenAI:", error);
        res.status(500).json({ error: "❌ Error con OpenAI" });
    }
});

// 📌 Autenticación
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: "❌ Usuario y contraseña son obligatorios" });

        if (await User.findOne({ username })) return res.status(400).json({ error: "❌ El usuario ya existe" });

        const hashedPassword = await bcrypt.hash(password, 10); // 🔒 Cifrar contraseña
        await new User({ username, password: hashedPassword }).save();

        res.json({ message: "✅ Usuario registrado con éxito" });
    } catch (error) {
        res.status(500).json({ error: "❌ Error en el servidor" });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: "❌ Usuario y contraseña son obligatorios" });

        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: "❌ Credenciales incorrectas" });
        }

        res.json({ message: "✅ Inicio de sesión exitoso" });
    } catch (error) {
        res.status(500).json({ error: "❌ Error en el servidor" });
    }
});

// 📌 Diario de Amor
app.get('/diary', async (req, res) => {
    try {
        res.json(await Diary.find());
    } catch (error) {
        res.status(500).json({ error: "❌ Error al obtener las entradas" });
    }
});

app.post('/diary', async (req, res) => {
    try {
        const { user, entry } = req.body;
        if (!user || !entry) return res.status(400).json({ error: "❌ Usuario y entrada son obligatorios" });

        const newEntry = new Diary({ user, entry });
        await newEntry.save();
        res.json({ message: "✅ Entrada agregada al diario", newEntry });
    } catch (error) {
        res.status(500).json({ error: "❌ Error al guardar la entrada" });
    }
});

// 📌 Recuerdos Privados
app.get('/recuerdos', async (req, res) => {
    try {
        const { user } = req.query;
        if (!user) return res.status(400).json({ error: "❌ Usuario es obligatorio" });

        const recuerdos = await PrivateMemory.find({ user });
        res.json(recuerdos);
    } catch (error) {
        console.error("Error al obtener recuerdos:", error);
        res.status(500).json({ error: "❌ Error en el servidor" });
    }
});

app.post('/recuerdos', async (req, res) => {
    const { user, memory } = req.body;
    const newMemory = new PrivateMemory({ user, memory });
    await newMemory.save();
    res.json({ message: "💖 Recuerdo privado guardado", newMemory });
});

// 📌 Contador de Corazones
app.get('/hearts', async (req, res) => {
    try {
        const { user } = req.query;
        if (!user) return res.status(400).json({ error: "❌ Usuario es obligatorio" });

        const heartData = await Heart.findOne({ user }) || { user, count: 0 };
        res.json(heartData);
    } catch (error) {
        res.status(500).json({ error: "❌ Error al obtener los corazones" });
    }
});

app.post('/hearts', async (req, res) => {
    try {
        const { user } = req.body;
        if (!user) return res.status(400).json({ error: "❌ Usuario es obligatorio" });

        let heartData = await Heart.findOne({ user });
        if (!heartData) heartData = new Heart({ user, count: 1 });
        else heartData.count += 1;

        await heartData.save();
        res.json({ message: "💖 Corazón agregado!", count: heartData.count });
    } catch (error) {
        res.status(500).json({ error: "❌ Error al actualizar los corazones" });
    }
});

// 📌 Notificaciones
app.get('/notificaciones', async (req, res) => {
    res.json(await Notification.find());
});

app.post('/notificaciones', async (req, res) => {
    const { message } = req.body;
    const newNotification = new Notification({ message });
    await newNotification.save();
    res.json({ message: "🔔 Notificación guardada", newNotification });
});

// 📌 Iniciar servidor
app.listen(3000, () => {
    console.log('🚀 Servidor en http://localhost:3000');
});
