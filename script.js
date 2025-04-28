const gameBoard = document.getElementById('game-board');
const timerElement = document.getElementById('timer');
const attemptsElement = document.getElementById('attempts');
const bestElement = document.getElementById('best');

const emojis = ['🍎', '🍌', '🍇', '🍒', '🍍', '🍉', '🥝', '🍑'];
let cards = [...emojis, ...emojis];
cards.sort(() => 0.5 - Math.random());

let flippedCards = [];
let matchedCards = 0;
let attempts = 0;

let timer;
let seconds = 0;
let timerStarted = false;

let bestTime = localStorage.getItem('bestTime') ? parseInt(localStorage.getItem('bestTime')) : null;
let bestAttempts = localStorage.getItem('bestAttempts') ? parseInt(localStorage.getItem('bestAttempts')) : null;

updateBestResultDisplay();

function startTimer() {
  timer = setInterval(() => {
    seconds++;
    timerElement.textContent = `⏱ Время: ${seconds} сек`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

if (Notification.permission !== 'granted') {
  Notification.requestPermission();
}

cards.forEach((emoji) => {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.emoji = emoji;
  card.innerHTML = '';
  card.addEventListener('click', flipCard);
  gameBoard.appendChild(card);
});


function flipCard() {
  if (!timerStarted) { 
    startTimer(); 
    timerStarted = true; 
  }

  if (flippedCards.length === 2 || this.classList.contains('flipped') || this.classList.contains('matched')) {
    return;
  }

  this.classList.add('flipped');
  this.innerHTML = this.dataset.emoji;
  flippedCards.push(this);

  if (flippedCards.length === 2) {
    attempts++;
    attemptsElement.textContent = `🎯 Попытки: ${attempts}`;
    setTimeout(checkMatch, 800);
  }
}

function checkMatch() {
  const [card1, card2] = flippedCards;

  if (card1.dataset.emoji === card2.dataset.emoji) {
    card1.classList.add('matched');
    card2.classList.add('matched');
    matchedCards += 2;
    sendNotification('Отлично!', `Вы нашли пару ${card1.dataset.emoji}! 🎉`);

    if (matchedCards === cards.length) {
      stopTimer();
      updateBestResult();
      setTimeout(() => {
        sendNotification('Победа!', `Вы прошли игру за ${seconds} секунд и ${attempts} попыток! 🔥`);
        setTimeout(() => window.location.reload(), 1500);
      }, 500);
    }
  } else {
    card1.classList.add('wrong');
    card2.classList.add('wrong');

    setTimeout(() => {
      card1.classList.remove('flipped', 'wrong');
      card2.classList.remove('flipped', 'wrong');
      card1.innerHTML = '';
      card2.innerHTML = '';
    }, 800);
  }

  flippedCards = [];
}

function updateBestResult() {
  let newRecord = false;

  if (bestTime === null || seconds < bestTime) {
    localStorage.setItem('bestTime', seconds);
    bestTime = seconds;
    newRecord = true;
  }
  if (bestAttempts === null || attempts < bestAttempts) {
    localStorage.setItem('bestAttempts', attempts);
    bestAttempts = attempts;
    newRecord = true;
  }

  if (newRecord) {
    sendNotification('Новый рекорд!', `Лучшее время: ${bestTime} сек | Лучшие попытки: ${bestAttempts}`);
  }

  updateBestResultDisplay();
}

function updateBestResultDisplay() {
  bestElement.innerHTML = `🏆 Лучшее время: ${bestTime !== null ? bestTime + ' сек' : '-'} | Лучшие попытки: ${bestAttempts !== null ? bestAttempts : '-'}`;
}

function sendNotification(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body: body, icon: 'https://cdn-icons-png.flaticon.com/512/992/992651.png' });
  }
}

let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

updateLeaderboardTable();


function updateBestResult() {
  let newRecord = false;

  if (bestTime === null || seconds < bestTime) {
    localStorage.setItem('bestTime', seconds);
    bestTime = seconds;
    newRecord = true;
  }
  if (bestAttempts === null || attempts < bestAttempts) {
    localStorage.setItem('bestAttempts', attempts);
    bestAttempts = attempts;
    newRecord = true;
  }

  if (newRecord) {
    sendNotification('Новый рекорд!', `Лучшее время: ${bestTime} сек | Лучшие попытки: ${bestAttempts}`);
  }

  updateBestResultDisplay();
  saveToLeaderboard();
}

function saveToLeaderboard() {
  let playerName = prompt('Введите ваше имя для таблицы лидеров:', 'Игрок');

  if (playerName) {
    leaderboard.push({ name: playerName, time: seconds, attempts: attempts });

    leaderboard.sort((a, b) => {
      if (a.time === b.time) {
        return a.attempts - b.attempts;
      }
      return a.time - b.time;
    });

    leaderboard = leaderboard.slice(0, 5);

    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    updateLeaderboardTable();
  }
}

function updateLeaderboardTable() {
  const tableBody = document.querySelector('#leaderboard-table tbody');
  tableBody.innerHTML = '';

  leaderboard.forEach(player => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${player.name}</td><td>${player.time}</td><td>${player.attempts}</td>`;
    tableBody.appendChild(row);
  });
}
