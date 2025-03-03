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
      // Si la respuesta no es exitosa, mostrar el error
      throw new Error(data.error || "Error al registrar el usuario");
    }

    // Si el registro es exitoso, mostrar un mensaje de éxito
    alert(data.message || "✅ Usuario registrado con éxito");
  } catch (error) {
    // Mostrar el error en caso de fallo
    alert(error.message);
  }
}
  
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
