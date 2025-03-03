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

  // Manejador de eventos para el enlace de registro
  registerLink.addEventListener("click", async (e) => {
    e.preventDefault();
    const username = prompt("Ingresa tu nombre de usuario:");
    const password = prompt("Ingresa tu contraseña:");

    if (username && password) {
      try {
        const response = await registerUser(username, password);
        alert(response.message || "✅ Usuario registrado con éxito");
      } catch (error) {
        console.error("Error en el registro:", error);
        alert("❌ Error en el servidor");
      }
    }
  });
});