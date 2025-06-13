// api.js - API del frontend corregida
const API_BASE_URL = window.location.origin;

// Configuración de headers con token
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Función para manejar errores de API
const handleApiError = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || `Error ${response.status}`);
  }
  return response.json();
};

// Función de login
async function login(username, password) {
  try {
    console.log('🔐 Intentando login...');
    
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await handleApiError(response);
    
    // Guardar token
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('username', data.username);
    
    console.log('✅ Login exitoso');
    return data;
  } catch (error) {
    console.error('❌ Error en login:', error);
    throw error;
  }
}

// Función de registro
async function register(username, password) {
  try {
    console.log('📝 Intentando registro...');
    
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await handleApiError(response);
    
    // Guardar token
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('username', data.username);
    
    console.log('✅ Registro exitoso');
    return data;
  } catch (error) {
    console.error('❌ Error en registro:', error);
    throw error;
  }
}

// Función para obtener mensajes
async function getMessages() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/messages`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    return await handleApiError(response);
  } catch (error) {
    console.error('❌ Error obteniendo mensajes:', error);
    throw error;
  }
}

// Función para enviar mensaje
async function sendMessage(content, type = 'user') {
  try {
    const response = await fetch(`${API_BASE_URL}/api/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content, type })
    });

    return await handleApiError(response);
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error);
    throw error;
  }
}

// Función para el asistente IA - CORREGIDA
async function askAI(prompt, type = 'romantic') {
  try {
    console.log('🤖 Consultando asistente IA...');
    
    const response = await fetch(`${API_BASE_URL}/asistente`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ prompt, type })
    });

    const data = await handleApiError(response);
    console.log('✅ Respuesta del asistente recibida');
    
    return data.message;
  } catch (error) {
    console.error('❌ Error en askAI:', error);
    
    // Respuestas de respaldo si la API falla
    const fallbackMessages = {
      romantic: [
        "Tu amor es el regalo más hermoso que la vida me ha dado ❤️",
        "Cada día contigo es una nueva aventura llena de amor 💕",
        "Eres la razón por la que sonrío cada mañana 🌅",
        "Nuestro amor es eterno e inquebrantable 💖",
        "Juntos podemos conquistar el mundo 🌍❤️"
      ],
      memory: [
        "Los recuerdos que creamos juntos son nuestro tesoro más preciado 💎",
        "Cada momento vivido contigo se convierte en un recuerdo hermoso 📸",
        "Nuestras memorias son la prueba de nuestro amor verdadero 💭",
        "Recordar nuestros momentos especiales me llena de felicidad 🥰"
      ],
      advice: [
        "El amor verdadero requiere paciencia, comprensión y comunicación 💬",
        "Celebren cada pequeño momento juntos 🎉",
        "La confianza es la base de toda relación sólida 🤝",
        "Nunca dejen de sorprenderse mutuamente 🎁"
      ]
    };
    
    const messages = fallbackMessages[type] || fallbackMessages.romantic;
    return messages[Math.floor(Math.random() * messages.length)];
  }
}

// Función para verificar autenticación
function isAuthenticated() {
  const token = localStorage.getItem('authToken');
  const username = localStorage.getItem('username');
  return !!(token && username);
}

// Función para obtener usuario actual
function getCurrentUser() {
  return localStorage.getItem('username');
}

// Función para logout
function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('username');
  window.location.href = '/';
}

// Verificar si el token expiró
async function checkTokenValidity() {
  try {
    await getMessages();
    return true;
  } catch (error) {
    if (error.message.includes('Token') || error.message.includes('401') || error.message.includes('403')) {
      logout();
      return false;
    }
    return true;
  }
}

// Inicializar verificación de token al cargar
document.addEventListener('DOMContentLoaded', () => {
  if (isAuthenticated()) {
    checkTokenValidity();
  }
});
