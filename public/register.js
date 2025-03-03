import { registerUser } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");

  // Manejador de eventos para el formulario de registro
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = registerForm.querySelector("input[type='text']").value;
    const password = registerForm.querySelector("input[type='password']").value;

    // Validar que el usuario sea "Ismael" o "Marina"
    if (username !== "Ismael" && username !== "Marina") {
      alert("Solo Ismael y Marina pueden registrarse.");
      return;
    }

    try {
      const response = await registerUser(username, password);
      if (response.message) {
        alert(response.message);
        window.location.href = "index.html"; // Redirigir al login
      } else {
        alert(response.error || "❌ Error en el registro");
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      alert("❌ Error en el servidor");
    }
  });
});