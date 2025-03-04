const API_BASE_URL = "https://ismarina.onrender.com"; // Reemplaza con tu URL en Render

// Registrar un usuario
export async function registerUser(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error al registrar el usuario");
        }

        return response.json();
    } catch (error) {
        console.error("Error en registerUser:", error);
        throw error;
    }
}

// Iniciar sesión
export async function loginUser(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error al iniciar sesión");
        }

        return response.json();
    } catch (error) {
        console.error("Error en loginUser:", error);
        throw error;
    }
}

// Obtener todas las entradas del diario
export async function getDiaryEntries() {
    try {
        const response = await fetch(`${API_BASE_URL}/diary`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error al obtener las entradas del diario");
        }
        return response.json();
    } catch (error) {
        console.error("Error en getDiaryEntries:", error);
        throw error;
    }
}

// Agregar una nueva entrada al diario
export async function addDiaryEntry(user, entry) {
    try {
        const response = await fetch(`${API_BASE_URL}/diary`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user, entry })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error al agregar la entrada al diario");
        }

        return response.json();
    } catch (error) {
        console.error("Error en addDiaryEntry:", error);
        throw error;
    }
}

// Obtener la cantidad de corazones de un usuario
export async function getHearts(user) {
    try {
        const response = await fetch(`${API_BASE_URL}/hearts?user=${user}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error al obtener los corazones");
        }
        return response.json();
    } catch (error) {
        console.error("Error en getHearts:", error);
        throw error;
    }
}

// Incrementar el contador de corazones
export async function addHeart(user) {
    try {
        const response = await fetch(`${API_BASE_URL}/hearts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error al incrementar los corazones");
        }

        return response.json();
    } catch (error) {
        console.error("Error en addHeart:", error);
        throw error;
    }
}

// Obtener recuerdos privados
export async function getPrivateMemories(user) {
    try {
        const response = await fetch(`${API_BASE_URL}/recuerdos?user=${user}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error al obtener los recuerdos privados");
        }
        return response.json();
    } catch (error) {
        console.error("Error en getPrivateMemories:", error);
        throw error;
    }
}

// Agregar un recuerdo privado
export async function addPrivateMemory(user, memory) {
    try {
        const response = await fetch(`${API_BASE_URL}/recuerdos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user, memory })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error al agregar el recuerdo privado");
        }

        return response.json();
    } catch (error) {
        console.error("Error en addPrivateMemory:", error);
        throw error;
    }
}

// Asistente Virtual con IA
export async function askAI(message) {
    try {
        const response = await fetch(`${API_BASE_URL}/asistente`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error en la solicitud al asistente");
        }

        return response.json();
    } catch (error) {
        console.error("Error en askAI:", error);
        throw error;
    }
}

// Obtener notificaciones
export async function getNotifications() {
    try {
        const response = await fetch(`${API_BASE_URL}/notificaciones`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error al obtener las notificaciones");
        }
        return response.json();
    } catch (error) {
        console.error("Error en getNotifications:", error);
        throw error;
    }
}

// Agregar una nueva notificación
export async function addNotification(message) {
    try {
        const response = await fetch(`${API_BASE_URL}/notificaciones`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error al agregar la notificación");
        }

        return response.json();
    } catch (error) {
        console.error("Error en addNotification:", error);
        throw error;
    }
}
