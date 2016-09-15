document.addEventListener('DOMContentLoaded', () => {
    let color = Math.random()*360;
    document.getElementById('nav').style.backgroundColor = `hsl(${color}, 50%, 75%)`;    
});
