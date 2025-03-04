document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  // Manejador de eventos para el formulario de login
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = loginForm.querySelector("input[type='text']").value;
      const password = loginForm.querySelector("input[type='password']").value;

      try {
        const response = await loginUser(username, password);
        if (response.token) {
          localStorage.setItem("token", response.token);
          localStorage.setItem("username", username);
          window.location.href = "home.html"; // Redirigir a la página principal
        } else {
          alert(response.error || "❌ Error en el login");
        }
      } catch (error) {
        console.error("Error en el login:", error);
        alert("❌ Error en el servidor");
      }
    });
  }

  // Manejador de eventos para el formulario de registro
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = registerForm.querySelector("input[type='text']").value;
      const password = registerForm.querySelector("input[type='password']").value;

      try {
        const response = await registerUser(username, password);
        alert(response.message || "✅ Usuario registrado con éxito");
        window.location.href = "login.html"; // Redirigir al login después del registro
      } catch (error) {
        console.error("Error en el registro:", error);
        alert(error.message || "❌ Error en el servidor");
      }
    });
  }
});

// Función para registrar un usuario
async function registerUser(username, password) {
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

  return data;
}

// Función para iniciar sesión
async function loginUser(username, password) {
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

  return data;
}
