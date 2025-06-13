const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ["https://ismarina.onrender.com"] 
      : ["http://localhost:3000", "http://127.0.0.1:5500"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ["https://ismarina.onrender.com"] 
    : ["http://localhost:3000", "http://127.0.0.1:5500"],
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Esquemas de MongoDB
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['memory', 'romantic', 'user'], default: 'user' },
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'tu_jwt_secret_aqui';

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Rutas de autenticación
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Solo permitir registros de Ismael y Marina
    if (username.toLowerCase() !== 'ismael' && username.toLowerCase() !== 'marina') {
      return res.status(400).json({ error: 'Solo Ismael y Marina pueden registrarse ❤️' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear usuario
    const user = new User({
      username: username.toLowerCase(),
      password: hashedPassword
    });
    
    await user.save();
    
    // Crear token
    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET);
    
    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      token,
      username: user.username
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Buscar usuario
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }
    
    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }
    
    // Crear token
    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET);
    
    res.json({ 
      message: 'Login exitoso',
      token,
      username: user.username
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// API de mensajes
app.get('/api/messages', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 }).limit(50);
    res.json(messages);
  } catch (error) {
    console.error('Error obteniendo mensajes:', error);
    res.status(500).json({ error: 'Error obteniendo mensajes' });
  }
});

app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { content, type = 'user' } = req.body;
    
    const message = new Message({
      sender: req.user.username,
      content,
      type
    });
    
    await message.save();
    
    // Emitir mensaje por Socket.io
    io.emit('newMessage', message);
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Error guardando mensaje:', error);
    res.status(500).json({ error: 'Error guardando mensaje' });
  }
});

// API del asistente IA (simulada)
app.post('/asistente', authenticateToken, async (req, res) => {
  try {
    const { prompt, type } = req.body;
    
    let response;
    
    if (type === 'romantic') {
      const romanticMessages = [
        "El amor verdadero como el vuestro es un tesoro que crece cada día ❤️",
        "Cada momento juntos es una nueva página en vuestra hermosa historia de amor 💕",
        "Tu sonrisa ilumina mi mundo de la misma manera que vuestro amor ilumina cada día 🌟",
        "El amor que compartís es la prueba de que los cuentos de hadas existen 💖",
        "Juntos sois más fuertes, más felices y más completos 💑",
        "Vuestro amor es como una melodía perfecta que nunca deja de sonar 🎵",
        "Cada día de vuestra relación es una nueva oportunidad para amar más profundamente 💝",
        "El amor verdadero como el vuestro es eterno e inquebrantable 🌹"
      ];
      response = romanticMessages[Math.floor(Math.random() * romanticMessages.length)];
    } else if (type === 'memory') {
      const memoryPrompts = [
        "Recordad siempre el primer día que os conocisteis, ese momento mágico que cambió vuestras vidas 💫",
        "Cada recuerdo que habéis creado juntos es un tesoro que nadie puede quitaros 📸",
        "Los pequeños momentos cotidianos son los que construyen los recuerdos más preciosos 🏠",
        "Vuestra primera cita, vuestra primera declaración de amor... cada 'primera vez' es especial 💭",
        "Los recuerdos compartidos son la base sólida de vuestra relación 🏰",
        "Cada aventura vivida juntos se convierte en una historia que contar 🗺️"
      ];
      response = memoryPrompts[Math.floor(Math.random() * memoryPrompts.length)];
    } else {
      const generalAdvice = [
        "La comunicación honesta es la clave de toda relación exitosa 💬",
        "Recordad siempre celebrar los pequeños logros del otro 🎉",
        "El respeto mutuo es fundamental en el amor verdadero 🤝",
        "Nunca dejéis de sorprenderos el uno al otro 🎁",
        "Escuchad con el corazón, no solo con los oídos 👂❤️",
        "El perdón y la comprensión fortalecen vuestro vínculo 🕊️"
      ];
      response = generalAdvice[Math.floor(Math.random() * generalAdvice.length)];
    }
    
    // Guardar el mensaje generado
    const aiMessage = new Message({
      sender: 'Asistente IA',
      content: response,
      type: type || 'romantic'
    });
    
    await aiMessage.save();
    
    // Emitir por Socket.io
    io.emit('newMessage', aiMessage);
    
    res.json({ message: response });
  } catch (error) {
    console.error('Error en asistente:', error);
    res.status(500).json({ error: 'Error en el asistente' });
  }
});

// Socket.io eventos
io.on('connection', (socket) => {
  console.log('👤 Usuario conectado:', socket.id);
  
  socket.on('join', (userData) => {
    console.log(`💕 ${userData.username} se unió al chat de amor`);
    socket.broadcast.emit('userJoined', userData);
  });
  
  socket.on('sendMessage', async (messageData) => {
    try {
      const message = new Message({
        sender: messageData.sender,
        content: messageData.content,
        type: messageData.type || 'user'
      });
      
      await message.save();
      io.emit('newMessage', message);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('👋 Usuario desconectado:', socket.id);
  });
});

// Servir archivos estáticos
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`💖 Página de amor disponible en: http://localhost:${PORT}`);
});
