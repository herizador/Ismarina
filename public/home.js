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
        
        showNotification('¡Mensaje especial añadido! ❤️', 'success');
        
    } catch (error) {
        console.error(`❌ Error generando mensaje ${type}:`, error);
        showNotification('Error generando mensaje especial', 'error');
    }
}

// Iniciar mensajes románticos automáticos
function startRomanticMessages() {
    // Limpiar intervalo anterior si existe
    if (romanticMessageInterval) {
        clearInterval(romanticMessageInterval);
    }
    
    // Generar mensaje romántico cada 30 minutos
    romanticMessageInterval = setInterval(async () => {
        try {
            await addRomanticMessage();
        } catch (error) {
            console.error('❌ Error en mensaje romántico automático:', error);
        }
    }, 30 * 60 * 1000); // 30 minutos
    
    console.log('💕 Mensajes románticos automáticos iniciados');
}

// Añadir mensaje romántico automático
async function addRomanticMessage() {
    try {
        console.log('🌹 Generando mensaje romántico automático...');
        
        const romanticMessage = await generateRomanticMessage();
        
        // Mostrar mensaje
        const messageData = {
            sender: 'Asistente IA',
            content: romanticMessage,
            type: 'romantic',
            timestamp: new Date()
        };
        
        displayMessage(messageData);
        
        // Guardar en base de datos
        await sendMessage(romanticMessage, 'romantic');
        
        // Enviar por socket si está disponible
        if (socket && socket.connected) {
            socket.emit('sendMessage', messageData);
        }
        
        console.log('✅ Mensaje romántico automático enviado');
        
    } catch (error) {
        console.error('❌ Error al generar mensaje romántico:', error);
    }
}

// Generar mensaje romántico
async function generateRomanticMessage() {
    try {
        return await askAI('Genera un mensaje romántico', 'romantic');
    } catch (error) {
        console.error('❌ Error al generar la frase romántica:', error);
        
        // Mensajes de respaldo
        const fallbackMessages = [
            "El amor que compartís es la luz que ilumina cada día ✨",
            "Juntos sois invencibles, juntos sois eternos 💕",
            "Cada latido de mi corazón susurra tu nombre ❤️",
            "Nuestro amor es la melodía más hermosa del universo 🎵",
            "Contigo, cada día es San Valentín 💖",
            "Eres mi presente favorito de la vida 🎁",
            "Tu amor es mi refugio seguro 🏠❤️"
        ];
        
        return fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
    }
}

// Mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Añadir estilos si no existen
    if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 10px;
                animation: slideIn 0.3s ease;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            
            .notification-success { background: linear-gradient(135deg, #4CAF50, #45a049); }
            .notification-error { background: linear-gradient(135deg, #f44336, #da190b); }
            .notification-warning { background: linear-gradient(135deg, #ff9800, #f57c00); }
            .notification-info { background: linear-gradient(135deg, #2196F3, #1976D2); }
            
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Añadir al DOM
    document.body.appendChild(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Funciones de utilidad para fechas especiales
function checkSpecialDates() {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    
    // Verificar fechas especiales
    if (month === 2 && day === 14) { // San Valentín
        addSpecialDateMessage("¡Feliz San Valentín! 💕 Hoy celebramos nuestro amor eterno");
    } else if (month === 12 && day === 25) { // Navidad
        addSpecialDateMessage("¡Feliz Navidad mi amor! 🎄❤️ El mejor regalo eres tú");
    } else if (month === 1 && day === 1) { // Año Nuevo
        addSpecialDateMessage("¡Feliz Año Nuevo amor mío! 🎊 Un año más juntos, un año más de amor");
    }
}

// Añadir mensaje de fecha especial
async function addSpecialDateMessage(message) {
    try {
        const specialMessage = {
            sender: 'Asistente IA',
            content: message,
            type: 'special',
            timestamp: new Date()
        };
        
        displayMessage(specialMessage);
        await sendMessage(message, 'special');
        
        showNotification('¡Mensaje especial del día! 🎉', 'success');
    } catch (error) {
        console.error('❌ Error añadiendo mensaje especial:', error);
    }
}

// Función para limpiar recursos al salir
function cleanup() {
    if (romanticMessageInterval) {
        clearInterval(romanticMessageInterval);
    }
    
    if (socket) {
        socket.disconnect();
    }
}

// Manejar cierre de ventana
window.addEventListener('beforeunload', cleanup);

// Verificar fechas especiales al cargar
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(checkSpecialDates, 2000);
});

// Función para exportar conversación
function exportConversation() {
    try {
        const messages = Array.from(document.querySelectorAll('.message'));
        let exportText = `💕 Conversación de Amor - ${new Date().toLocaleDateString('es-ES')} 💕\n\n`;
        
        messages.forEach(msg => {
            const sender = msg.querySelector('.sender').textContent;
            const content = msg.querySelector('.message-content').textContent;
            const timestamp = msg.querySelector('.timestamp').textContent;
            
            exportText += `[${timestamp}] ${sender}: ${content}\n\n`;
        });
        
        // Crear archivo de descarga
        const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversacion-amor-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('¡Conversación exportada! 📄', 'success');
    } catch (error) {
        console.error('❌ Error exportando conversación:', error);
        showNotification('Error al exportar', 'error');
    }
}

// Añadir botón de exportar si no existe
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer && !document.getElementById('exportBtn')) {
            const exportBtn = document.createElement('button');
            exportBtn.id = 'exportBtn';
            exportBtn.className = 'btn btn-outline-secondary btn-sm';
            exportBtn.innerHTML = '📄 Exportar Chat';
            exportBtn.onclick = exportConversation;
            exportBtn.style.marginTop = '10px';
            
            chatContainer.appendChild(exportBtn);
        }
    }, 1000);
});
