const API_BASE_URL = "https://api.render.com/deploy/srv-cuvmd8lsvqrc73c31cu0?key=Gu0XrG4a22E"; // Reemplaza con tu URL en Render

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

export { registerUser, loginUser, getDiaryEntries, addDiaryEntry, getHearts, addHeart };
