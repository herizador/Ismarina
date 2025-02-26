const API_BASE_URL = "https://ismarina.onrender.com"; // Reemplaza con tu URL en Render

// Registrar un usuario
async function registerUser(username, password) {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    return response.json();
}

// Iniciar sesión
async function loginUser(username, password) {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    return response.json();
}

// Obtener todas las entradas del diario
async function getDiaryEntries() {
    const response = await fetch(`${API_BASE_URL}/diary`);
    return response.json();
}

// Agregar una nueva entrada al diario
async function addDiaryEntry(user, entry) {
    const response = await fetch(`${API_BASE_URL}/diary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, entry })
    });
    return response.json();
}

// Obtener la cantidad de corazones de un usuario
async function getHearts(user) {
    const response = await fetch(`${API_BASE_URL}/hearts?user=${user}`);
    return response.json();
}

// Incrementar el contador de corazones
async function addHeart(user) {
    const response = await fetch(`${API_BASE_URL}/hearts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user })
    });
    return response.json();
}

// Obtener recuerdos privados
async function getPrivateMemories(user) {
    const response = await fetch(`${API_BASE_URL}/recuerdos?user=${user}`);
    return response.json();
}

// Agregar un recuerdo privado
async function addPrivateMemory(user, memory) {
    const response = await fetch(`${API_BASE_URL}/recuerdos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, memory })
    });
    return response.json();
}

// Asistente Virtual con IA
async function askAI(message) {
    const response = await fetch(`${API_BASE_URL}/asistente`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
    });
    return response.json();
}

// Obtener notificaciones
async function getNotifications() {
    const response = await fetch(`${API_BASE_URL}/notificaciones`);
    return response.json();
}

// Agregar una nueva notificación
async function addNotification(message) {
    const response = await fetch(`${API_BASE_URL}/notificaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
    });
    return response.json();
}

export { 
    registerUser, loginUser, getDiaryEntries, addDiaryEntry, getHearts, addHeart, 
    getPrivateMemories, addPrivateMemory, askAI, getNotifications, addNotification 
};
