let color = 180;
requestAnimationFrame(function cycleColor() {
    color = (color + 0.1) % 360;
    document.body.style.backgroundColor = `hsl(${color}, 25%, 75%)`; 
    requestAnimationFrame(cycleColor);
});
