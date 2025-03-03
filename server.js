import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { OpenAI } from "openai";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import helmet from "helmet";
import morgan from "morgan";
import { body, validationResult } from "express-validator";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { fileURLToPath } from "url"; // Importar fileURLToPath
import path from "path"; // Importar path

dotenv.config();

// Definir __dirname en módulos de ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://ismarina.onrender.com", // Cambia esto a tu dominio en producción
  },
});

const PORT = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, "public")));

// Ruta raíz para servir index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error al conectar:", err));

// Modelos de MongoDB
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});
const User = mongoose.model("User", UserSchema);

const DiarySchema = new mongoose.Schema({
  user: String,
  entry: String,
  date: { type: Date, default: Date.now },
});
const Diary = mongoose.model("Diary", DiarySchema);

const HeartSchema = new mongoose.Schema({
  user: String,
  count: { type: Number, default: 0 },
});
const Heart = mongoose.model("Heart", HeartSchema);

const PrivateMemorySchema = new mongoose.Schema({
  user: String,
  memory: String,
  date: { type: Date, default: Date.now },
});
const PrivateMemory = mongoose.model("PrivateMemory", PrivateMemorySchema);

const NotificationSchema = new mongoose.Schema({
  message: String,
  date: { type: Date, default: Date.now },
});
const Notification = mongoose.model("Notification", NotificationSchema);

// Middleware de autenticación JWT
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "❌ Acceso no autorizado" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "❌ Token inválido" });
    req.user = user;
    next();
  });
}

// 📌 Asistente Virtual con IA
app.post("/asistente", async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error("Error en OpenAI:", error);
    res.status(500).json({ error: "❌ Error con OpenAI" });
  }
});

// 📌 Autenticación
app.post(
  "/register",
  [
    body("username").notEmpty().withMessage("El usuario es obligatorio"),
    body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Validar que el usuario sea "Ismael" o "Marina"
    if (username !== "Ismael" && username !== "Marina") {
      return res.status(400).json({ error: "❌ Solo Ismael y Marina pueden registrarse" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });

    try {
      await user.save();
      res.status(201).json({ message: "✅ Usuario registrado con éxito" });
    } catch (err) {
      res.status(400).json({ error: "❌ El usuario ya existe" });
    }
  }
);

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: "❌ Credenciales incorrectas" });
  }

  // Generar token JWT
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  // Devolver el token y un mensaje de éxito
  res.json({ message: "✅ Inicio de sesión exitoso", token });
});

// 📌 Diario de Amor
app.get("/diary", async (req, res) => {
  try {
    res.json(await Diary.find());
  } catch (error) {
    res.status(500).json({ error: "❌ Error al obtener las entradas" });
  }
});

app.post("/diary", async (req, res) => {
  try {
    const { user, entry } = req.body;
    if (!user || !entry)
      return res
        .status(400)
        .json({ error: "❌ Usuario y entrada son obligatorios" });

    const newEntry = new Diary({ user, entry });
    await newEntry.save();
    res.json({ message: "✅ Entrada agregada al diario", newEntry });
  } catch (error) {
    res.status(500).json({ error: "❌ Error al guardar la entrada" });
  }
});

// 📌 Recuerdos Privados
app.get("/recuerdos", async (req, res) => {
  try {
    const { user } = req.query;
    if (!user)
      return res.status(400).json({ error: "❌ Usuario es obligatorio" });

    const recuerdos = await PrivateMemory.find({ user });
    res.json(recuerdos);
  } catch (error) {
    console.error("Error al obtener recuerdos:", error);
    res.status(500).json({ error: "❌ Error en el servidor" });
  }
});

app.post("/recuerdos", async (req, res) => {
  const { user, memory } = req.body;
  const newMemory = new PrivateMemory({ user, memory });
  await newMemory.save();
  res.json({ message: "💖 Recuerdo privado guardado", newMemory });
});

// 📌 Contador de Corazones
app.get("/hearts", async (req, res) => {
  try {
    const { user } = req.query;
    if (!user)
      return res.status(400).json({ error: "❌ Usuario es obligatorio" });

    const heartData = (await Heart.findOne({ user })) || { user, count: 0 };
    res.json(heartData);
  } catch (error) {
    res.status(500).json({ error: "❌ Error al obtener los corazones" });
  }
});

app.post("/hearts", async (req, res) => {
  try {
    const { user } = req.body;
    if (!user)
      return res.status(400).json({ error: "❌ Usuario es obligatorio" });

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
app.get("/notificaciones", async (req, res) => {
  res.json(await Notification.find());
});

app.post("/notificaciones", async (req, res) => {
  const { message } = req.body;
  const newNotification = new Notification({ message });
  await newNotification.save();
  res.json({ message: "🔔 Notificación guardada", newNotification });
});

// Socket.io para notificaciones en tiempo real
io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  socket.on("sendHeart", async (user) => {
    const heartData = await Heart.findOneAndUpdate(
      { user },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );
    io.emit("updateHearts", heartData);
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
  });
});

// 📌 Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});
