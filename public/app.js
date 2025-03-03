import { registerUser, loginUser } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerLink = document.getElementById("registerLink");

  // Manejador de eventos para el formulario de login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = loginForm.querySelector("input[type='text']").value;
    const password = loginForm.querySelector("input[type='password']").value;

    try {
      const response = await loginUser(username, password);
      if (response.token) {
        localStorage.setItem("token", response.token);
        window.location.href = "home.html"; // Redirigir a la página principal
      } else {
        alert(response.error || "❌ Error en el login");
      }
    } catch (error) {
      console.error("Error en el login:", error);
      alert("❌ Error en el servidor");
    }
  });

  async function registerUser(username, password) {
  try {
    const response = await fetch("https://ismarina.onrender.com/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al registrar el usuario");
    }

    alert(data.message || "✅ Usuario registrado con éxito");
    window.location.href = "login.html"; // Redirigir al login después del registro
  } catch (error) {
    alert(error.message);
  }
}

async function loginUser(username, password) {
  try {
    const response = await fetch("https://ismarina.onrender.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al iniciar sesión");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("username", username);
    window.location.href = "home.html"; // Redirigir a la página de inicio
  } catch (error) {
    alert(error.message);
  }
}
  
    // Manejar el formulario de inicio de sesión
    const loginForm = document.getElementById("loginForm");
  
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        await loginUser(username, password);
      });
    }
  });
});
