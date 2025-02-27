document.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById("opacity-slider");
    const container = document.querySelector(".container");

    slider.addEventListener("input", () => {
        container.style.backgroundColor = `rgba(255, 255, 255, ${slider.value})`;
    });

    // 🌸 Función para generar corazones flotantes
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

// Generar corazones cada cierto tiempo
setInterval(crearCorazon, 800);
});
