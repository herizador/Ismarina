// home.js - Frontend corregido
let socket = null;
let romanticMessageInterval = null;
let currentUser = null;

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando aplicación de amor...');
    
    // Verificar autenticación
    if (!isAuthenticated()) {
        window.location.href = '/';
        return;
    }
    
    currentUser = getCurrentUser();
    console.log(`👤 Usuario actual: ${currentUser}`);
    
    // Personalizar saludo
    updateWelcomeMessage();
    
    // Inicializar Socket.io
    initializeSocket();
    
    // Cargar mensajes existentes
    loadMessages();
    
    // Configurar eventos
    setupEventListeners();
    
    // Iniciar mensajes románticos automáticos
    startRomanticMessages();
    
    console.log('✅ Aplicación inicializada');
});

// Actualizar mensaje de bienvenida
function updateWelcomeMessage() {
    const welcomeElement = document.querySelector('.welcome-message');
    if (welcomeElement) {
        if (currentUser === 'marina') {
            welcomeElement.innerHTML = '💖 Bienvenida, Marina mi amor 💖';
        } else if (currentUser === 'ismael') {
            welcomeElement.innerHTML = '💖 Bienvenido, Ismael mi amor 💖';
        }
    }
}

// Inicializar Socket.io con manejo de errores
function initializeSocket() {
    try {
        console.log('🔌 Conectando a Socket.io...');
        
        socket = io(window.location.origin, {
            transports: ['websocket', 'polling'],
            upgrade: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            timeout: 20000
        });

        socket.on('connect', () => {
            console.log('✅ Conectado a Socket.io');
            showNotification('Conectado al chat de amor ❤️', 'success');
            
            // Unirse al chat
            socket.emit('join', { username: currentUser });
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ Socket.io desconectado:', reason);
            showNotification('Conexión perdida, reintentando...', 'warning');
        });

        socket.on('connect_error', (error) => {
            console.log('❌ Error de conexión Socket.io:', error);
            // No mostrar error al usuario, seguir funcionando sin socket
        });

        socket.on('newMessage', (message) => {
            console.log('📨 Nuevo mensaje recibido:', message);
            displayMessage(message);
        });

        socket.on('userJoined', (userData) => {
            const partnerName = userData.username === 'marina' ? 'Marina' : 'Ismael';
            showNotification(`${partnerName} se conectó ❤️`, 'info');
        });

    } catch (error) {
        console.error('❌ Error inicializando Socket.io:', error);
        // Continuar sin socket si hay error
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Botón de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Formulario de mensaje
    const messageForm = document.getElementById('messageForm');
    if (messageForm) {
        messageForm.addEventListener('submit', handleMessageSubmit);
    }
    
    // Botones de funciones especiales
    const memoryBtn = document.getElementById('addMemoryBtn');
    if (memoryBtn) {
        memoryBtn.addEventListener('click', () => addSpecialMessage('memory'));
    }
    
    const romanticBtn = document.getElementById('romanticBtn');
    if (romanticBtn) {
        romanticBtn.addEventListener('click', () => addSpecialMessage('romantic'));
    }
    
    const adviceBtn = document.getElementById('adviceBtn');
    if (adviceBtn) {
        adviceBtn.addEventListener('click', () => addSpecialMessage('advice'));
    }
}

// Manejar envío de mensajes
async function handleMessageSubmit(e) {
    e.preventDefault();
    
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    try {
        // Enviar mensaje via API
        await sendMessage(message, 'user');
        
        // También enviar via socket si está disponible
        if (socket && socket.connected) {
            socket.emit('sendMessage', {
                sender: currentUser,
                content: message,
                type: 'user'
            });
        }
        
        messageInput.value = '';
        console.log('✅ Mensaje enviado');
        
    } catch (error) {
        console.error('❌ Error enviando mensaje:', error);
        showNotification('Error enviando mensaje', 'error');
    }
}

// Cargar mensajes existentes
async function loadMessages() {
    try {
        console.log('📥 Cargando mensajes...');
        const messages = await getMessages();
        
        const chatContainer = document.getElementById('chatMessages');
        if (chatContainer) {
            chatContainer.innerHTML = '';
            messages.reverse().forEach(message => displayMessage(message));
        }
        
        console.log(`✅ ${messages.length} mensajes cargados`);
    } catch (error) {
        console.error('❌ Error cargando mensajes:', error);
        showNotification('Error cargando mensajes', 'error');
    }
}

// Mostrar mensaje en el chat
function displayMessage(message) {
    const chatContainer = document.getElementById('chatMessages');
    if (!chatContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${getMessageClass(message)}`;
    
    const timestamp = new Date(message.timestamp).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    messageElement.innerHTML = `
        <div class="message-header">
            <span class="sender">${getDisplayName(message.sender)}</span>
            <span class="timestamp">${timestamp}</span>
        </div>
        <div class="message-content">${message.content}</div>
    `;
    
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Obtener clase CSS para el mensaje
function getMessageClass(message) {
    if (message.sender === currentUser) return 'message-own';
    if (message.sender === 'Asistente IA') return 'message-ai';
    return 'message-other';
}

// Obtener nombre para mostrar
function getDisplayName(sender) {
    if (sender === 'marina') return 'Marina 💕';
    if (sender === 'ismael') return 'Ismael ❤️';
    if (sender === 'Asistente IA') return 'Asistente de Amor 🤖';
    return sender;
}

// Añadir mensaje especial (recuerdo, romántico, consejo)
async function addSpecialMessage(type) {
    try {
        console.log(`💝 Generando mensaje ${type}...`);
        showNotification('Generando mensaje especial...', 'info');
        
        const message = await askAI('', type);
        
        // Mostrar inmediatamente
        const specialMessage = {
            sender: 'Asistente IA',
            content: message,
            type: type,
            timestamp: new Date()
        };
        
        displayMessage(specialMessage);
        
        // Guardar en la base de datos
        await sendMessage(message, type);
        
        showNotification('¡Mensaje especial añadido!
