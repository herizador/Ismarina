import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Importar Gemini
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import helmet from "helmet";
import morgan from "morgan";
import { body, validationResult } from "express-validator";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

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

// Configurar Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Variable para almacenar el estado de la conversación
let isWaitingForResponse = false;

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

// 📌 Asistente Virtual con Gemini
app.post("/asistente", async (req, res) => {
  try {
    console.log("Solicitud recibida en /asistente"); // Log de depuración
    const { message } = req.body;

    if (isWaitingForResponse) {
      console.log("Procesando respuesta del usuario:", message); // Log de depuración
      const prompt = `El usuario respondió: "${message}". Responde de manera breve (un párrafo como máximo).`;
      const result = await model.generateContent(prompt);
      const response = await result.response.text();

      isWaitingForResponse = false;
      console.log("Respuesta generada:", response); // Log de depuración
      res.json({ response });
    } else {
      console.log("Haciendo pregunta inicial"); // Log de depuración
      const prompt = "¿Cómo ha ido tu día?";
      const result = await model.generateContent(prompt);
      const response = await result.response.text();

      isWaitingForResponse = true;
      console.log("Pregunta inicial generada:", response); // Log de depuración
      res.json({ response });
    }
  } catch (error) {
    console.error("Error en el asistente:", error); // Log de depuración
    res.status(500).json({ error: "❌ Error en el asistente" });
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
    // Validar los errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Validar que el usuario sea "Ismael" o "Marina"
    if (username !== "Ismael" && username !== "Marina") {
      return res.status(400).json({ error: "❌ Solo Ismael y Marina pueden registrarse" });
    }

    try {
      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: "❌ El usuario ya existe" });
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear y guardar el nuevo usuario
      const newUser = new User({ username, password: hashedPassword });
      await newUser.save();

      // Respuesta de éxito
      res.status(201).json({ message: "✅ Usuario registrado con éxito", user: newUser });
    } catch (error) {
      console.error("Error al registrar el usuario:", error);
      res.status(500).json({ error: "❌ Error en el servidor al registrar el usuario" });
    }
  }
);

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: "❌ Usuario no encontrado" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "❌ Contraseña incorrecta" });
    }

    // Generar token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Devolver el token y un mensaje de éxito
    res.json({ message: "✅ Inicio de sesión exitoso", token });
  } catch (error) {
    console.error("Error en el inicio de sesión:", error);
    res.status(500).json({ error: "❌ Error en el servidor al iniciar sesión" });
  }
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
