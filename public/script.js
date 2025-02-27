document.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById("opacity-slider");
    const container = document.querySelector(".container");

    slider.addEventListener("input", () => {
        container.style.backgroundColor = `rgba(255, 255, 255, ${slider.value})`;
    });

    // 🌸 Función para generar corazones flotantes
    function createHeart() {
        const heart = document.createElement("div");
        heart.classList.add("heart");
        heart.innerHTML = "💖";
        document.body.appendChild(heart);

        heart.style.left = Math.random() * 100 + "vw";
        heart.style.animationDuration = Math.random() * 2 + 3 + "s";

        setTimeout(() => {
            heart.remove();
        }, 5000);
    }

    setInterval(createHeart, 800);
});
