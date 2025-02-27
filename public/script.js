document.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById("opacity-slider");
    const container = document.querySelector(".container");

    slider.addEventListener("input", () => {
        slider.addEventListener("input", () => {
    container.style.backgroundColor = `rgba(255, 255, 255, ${slider.value})`;
});
    });
});
