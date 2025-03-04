import {
  getDiaryEntries,
  addDiaryEntry,
  getPrivateMemories,
  addPrivateMemory,
  getNotifications,
  addNotification,
  askAI,
  getHearts,
  addHeart,
} from './api.js';

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html"; // Redirigir al login si no hay token
  }

  const username = localStorage.getItem("username"); // Obtener el nombre de usuario
  if (!username) {
    window.location.href = "index.html"; // Redirigir al login si no hay usuario
  }

  // Elementos del DOM
  const diaryEntry = document.getElementById("diaryEntry");
  const saveDiary = document.getElementById("saveDiary");
  const privateMemory = document.getElementById("privateMemory");
  const saveMemory = document.getElementById("saveMemory");
  const notifications = document.getElementById("notifications");
  const chat = document.getElementById("chat");
  const chatInput = document.getElementById("chatInput");
  const sendChat = document.getElementById("sendChat");
  const logoutButton = document.getElementById("logoutButton");

  // Cargar datos iniciales
  loadInitialData();

  // Manejador de eventos para guardar una entrada en el diario
  saveDiary.addEventListener("click", async () => {
    const entry = diaryEntry.value.trim();
    if (entry) {
      showLoading("Guardando entrada...");
      try {
        await addDiaryEntry(username, entry);
        diaryEntry.value = "";
        loadDiaryEntries();
        showToast("Entrada guardada con éxito", "success");
      } catch (error) {
        console.error("Error al guardar la entrada:", error);
        showToast("❌ Error al guardar la entrada", "danger");
      } finally {
        hideLoading();
      }
    }
  });

  // Manejador de eventos para guardar un recuerdo privado
  saveMemory.addEventListener("click", async () => {
    const memory = privateMemory.value.trim();
    if (memory) {
      showLoading("Guardando recuerdo...");
      try {
        await addPrivateMemory(username, memory);
        privateMemory.value = "";
        loadPrivateMemories();
        showToast("Recuerdo guardado con éxito", "success");
      } catch (error) {
        console.error("Error al guardar el recuerdo:", error);
        showToast("❌ Error al guardar el recuerdo", "danger");
      } finally {
        hideLoading();
      }
    }
  });

  // Manejador de eventos para enviar un mensaje al asistente virtual
  sendChat.addEventListener("click", async () => {
    const message = chatInput.value.trim();
    if (message) {
      try {
        const response = await askAI(message);
        chat.innerHTML += `<p><strong>Tú:</strong> ${message}</p>`;
        chat.innerHTML += `<p><strong>Asistente:</strong> ${response.response}</p>`;
        chatInput.value = "";
        chat.scrollTop = chat.scrollHeight;
      } catch (error) {
        console.error("Error en el chat:", error);
        showToast("❌ Error en el chat", "danger");
      }
    }
  });

  // Manejador de eventos para cerrar sesión
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "index.html";
  });

  // Generar corazones flotantes
  setInterval(crearCorazon, 800);

  // Generar mensajes románticos cada 10 segundos
  setInterval(addRomanticMessage, 10000);

  // Generar el calendario
  generateCalendar();
});

// Función para cargar las entradas del diario del usuario actual
async function loadDiaryEntries() {
  try {
    const username = localStorage.getItem("username");
    if (!username) {
      throw new Error("Usuario no encontrado");
    }

    const entries = await getDiaryEntries(username);
    // Mostrar las entradas en el DOM
  } catch (error) {
    console.error("Error al cargar el diario:", error);
    showToast("❌ Error al cargar el diario", "danger");
  }
}

// Función para cargar los recuerdos privados
async function loadPrivateMemories() {
  try {
    const username = localStorage.getItem("username");
    if (!username) {
      throw new Error("Usuario no encontrado");
    }

    const memories = await getPrivateMemories(username);
    // Mostrar los recuerdos en el DOM
  } catch (error) {
    console.error("Error al cargar los recuerdos:", error);
    showToast("❌ Error al cargar los recuerdos", "danger");
  }
}

// Función para cargar las notificaciones
async function loadNotifications() {
  try {
    const username = localStorage.getItem("username");
    if (!username) {
      throw new Error("Usuario no encontrado");
    }

    const notificationsData = await getNotifications(username);
    // Mostrar las notificaciones en el DOM
  } catch (error) {
    console.error("Error al cargar las notificaciones:", error);
    showToast("❌ Error al cargar las notificaciones", "danger");
  }
}

// Función para generar corazones flotantes
function crearCorazon() {
  const corazon = document.createElement("div");
  corazon.classList.add("heart");
  corazon.innerHTML = "💖";

  corazon.style.left = Math.random() * window.innerWidth + "px";
  corazon.style.top = Math.random() * window.innerHeight + "px";

  document.body.appendChild(corazon);

  setTimeout(() => {
    corazon.remove();
  }, 5000);
}

// Función para generar frases románticas con IA
async function generateRomanticMessage() {
  try {
    const username = localStorage.getItem("username");
    if (!username) {
      throw new Error("Usuario no encontrado");
    }

    const diaryEntries = await getDiaryEntries(username);
    const privateMemories = await getPrivateMemories(username);

    const context = [
      ...diaryEntries.map((entry) => entry.entry),
      ...privateMemories.map((memory) => memory.memory),
    ].join(" ");

    const response = await askAI(`Genera una frase romántica basada en este contexto: ${context}`);
    return response.response;
  } catch (error) {
    console.error("Error al generar la frase romántica:", error);
    return "Eres lo mejor que me ha pasado 💖"; // Mensaje predeterminado en caso de error
  }
}

// Función para agregar un mensaje romántico al chat
async function addRomanticMessage() {
  const romanticMessage = await generateRomanticMessage();
  chat.innerHTML += `<p><strong>Asistente:</strong> ${romanticMessage}</p>`;
  chat.scrollTop = chat.scrollHeight;
}

// Función para mostrar un mensaje de carga
function showLoading(message) {
  const loadingElement = document.createElement("div");
  loadingElement.className = "loading-message";
  loadingElement.textContent = message;
  document.body.appendChild(loadingElement);
}

// Función para ocultar el mensaje de carga
function hideLoading() {
  const loadingElement = document.querySelector(".loading-message");
  if (loadingElement) {
    loadingElement.remove();
  }
}

// Función para generar el calendario
function generateCalendar() {
  const calendarEl = document.getElementById("calendar");
  if (calendarEl) {
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      events: [
        { title: "Nuestro aniversario 💖", date: "2023-10-15" },
        { title: "Navidad juntos 🎄", date: "2023-12-25" },
        { title: "Día de San Valentín 🌹", date: "2024-02-14" },
      ],
    });
    calendar.render();
  }
}

// Función para cargar datos iniciales de manera asíncrona
async function loadInitialData() {
  showLoading("Cargando datos...");
  try {
    await loadDiaryEntries();
    await loadPrivateMemories();
    await loadNotifications();
  } catch (error) {
    console.error("Error al cargar los datos:", error);
  } finally {
    hideLoading();
  }
}

// Función para mostrar un mensaje de notificación
function showToast(message, type = "success") {
  const toastContainer = document.createElement("div");
  toastContainer.className = `toast align-items-center text-white bg-${type} border-0`;
  toastContainer.setAttribute("role", "alert");
  toastContainer.setAttribute("aria-live", "assertive");
  toastContainer.setAttribute("aria-atomic", "true");

  const toastBody = document.createElement("div");
  toastBody.className = "d-flex";
  toastBody.innerHTML = `
    <div class="toast-body">${message}</div>
    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
  `;

  toastContainer.appendChild(toastBody);
  document.body.appendChild(toastContainer);

  const toast = new bootstrap.Toast(toastContainer);
  toast.show();

  setTimeout(() => {
    toastContainer.remove();
  }, 3000);
}

const loveMessage = document.getElementById("loveMessage");
const sendLoveMessage = document.getElementById("sendLoveMessage");

sendLoveMessage.addEventListener("click", async () => {
  const message = loveMessage.value.trim();
  if (message) {
    try {
      await addNotification(message);
      loveMessage.value = "";
      showToast("Mensaje de amor enviado 💖", "success");
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      showToast("❌ Error al enviar el mensaje", "danger");
    }
  }
});
