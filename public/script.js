document.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById("opacity-slider");

    slider.addEventListener("input", () => {
        document.documentElement.style.setProperty("--background-opacity", slider.value);
    });
});

