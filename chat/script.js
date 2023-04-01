const socket = new WebSocket('wss://echo-ws-service.herokuapp.com');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const locationBtn = document.getElementById('location-btn');

// Переменная для хранения всех сообщений
let messages = [];

// Функция добавления нового сообщения и его отображения на холсте
function addMessage(text, author) {
    const message = {
      text: text,
      author: author
    };
    messages.push(message);
  
    let yOffset = 0;
  
    // очищаем холст
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // отображаем все сообщения
    messages.forEach((message, index) => {
      const y = 50 + yOffset;
      const lineHeight = 25;
      if (message.author === 'server') {
        ctx.font = 'italic 18px Arial';
      } else {
        ctx.font = '18px Arial';
      }
      ctx.fillStyle = 'black';
  
      // разбиваем сообщение на строки по словам и отображаем каждую строку отдельно
      const words = message.text.split(' ');
      let line = '';
      const lines = [];
  
      words.forEach(word => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > canvas.width - 20) {
          lines.push(line);
          line = word + ' ';
        } else {
          line = testLine;
        }
      });
  
      lines.push(line);
  
      lines.forEach((line, index) => {
        const x = 10;
        const y = 50 + yOffset + (lineHeight * index);
        ctx.fillText(line, x, y);
  
        // Если сообщение содержит ссылку на карту, выводим ее как кликабельную ссылку
        if (line.includes('https://www.openstreetmap.org/')) {
          const link = line.split(' ')[2];
          ctx.fillStyle = 'blue';
          ctx.fillText(link, x + ctx.measureText('Моя геопозиция: ').width, y);
          canvas.addEventListener('click', function(event) {
            if ((event.offsetX >= x + ctx.measureText('Моя геопозиция: ').width && event.offsetX <= x + ctx.measureText('Моя геопозиция: ').width + ctx.measureText(link).width) &&
              (event.offsetY >= y - 18 && event.offsetY <= y)) {
              window.open(link);
            }
          });
        }
      });
  
      yOffset += (lines.length * lineHeight) + lineHeight;
    });
  }

// Функция отправки сообщения на сервер
function sendMessage(message) {
  const data = {
    type: 'message',
    text: message
  };
  socket.send(JSON.stringify(data));
  
  // Добавление отправленного сообщения в массив и его отображение на холсте
  addMessage(message, 'user');
  
  messageInput.value = '';
}

// Функция отправки координат на сервер
function sendLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(function(pos) {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const link = `https://www.openstreetmap.org/#map=15/${lat.toFixed(5)}/${lon.toFixed(5)}`;
        const message = `Моя геопозиция: ${link}`;
        sendMessage(message);
      });
    } else {
      alert('Ваш браузер не поддерживает геолокацию');
    }
  }

// Обработчик нажатия на кнопку "Отправить"
sendBtn.addEventListener('click', function() {
  const message = messageInput.value.trim();
  if (message) {
    sendMessage(message);
  }
});

// Обработчик нажатия на кнопку "Геолокация"
locationBtn.addEventListener('click', function() {
  sendLocation();
});

// Обработчик события приема сообщения от сервера
socket.addEventListener('message', function(event) {
    const data = JSON.parse(event.data);
  
    if (data.type === 'message') {
      addMessage(data.text, 'server');
    }
  });