const btn = document.getElementById('btn');

btn.addEventListener('click', function() {
  const width = screen.width;
  const height = screen.height;
  alert(`Размер экрана: ${width}x${height}`);
});