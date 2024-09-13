const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('start-button');
const inputContainer = document.getElementById('input-container');
const userInput = document.getElementById('user-input');
const messageDiv = document.getElementById('message');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const FACE_COUNT = 5;
const SHOW_TIME = 30; // seconds
const positions = [];
const faces = [];
const inputs = {};
let currentFaceIndex = 0;
let showNames = true;
let timer;
let timeLeft = SHOW_TIME;

// Name generation
const SYLLABLES = ["ka", "la", "mi", "no", "se", "ri", "ta", "zu", "xi", "vo"];

function generateName() {
  return (
    SYLLABLES[Math.floor(Math.random() * SYLLABLES.length)].charAt(0).toUpperCase() +
    SYLLABLES[Math.floor(Math.random() * SYLLABLES.length)]
  );
}

class Face {
  constructor(imageSrc, name, x, y) {
    this.image = new Image();
    this.image.src = imageSrc;
    this.name = name;
    this.x = x;
    this.y = y;
  }

  draw(showName) {
    ctx.drawImage(this.image, this.x - 50, this.y - 50, 100, 100);
    if (showName) {
      ctx.font = '24px Courier';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText(this.name, this.x, this.y + 70);
    }
  }
}

function displayInstructions() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.font = '24px Courier';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  const instructions = [
    "Welcome to Face Quiz!",
    "",
    `You will be shown ${FACE_COUNT} faces with their names.`,
    `You have ${SHOW_TIME} seconds to memorize them.`,
    "Then, the names will be hidden, and",
    "you must type the correct name for each face.",
    "",
    "Press 'Start Game' to begin..."
  ];
  instructions.forEach((line, index) => {
    ctx.fillText(line, WIDTH / 2, 100 + index * 30);
  });
}

async function loadFaces() {
  for (let i = 0; i < FACE_COUNT; i++) {
    const response = await fetch('https://randomuser.me/api/');
    const data = await response.json();
    const imageSrc = data.results[0].picture.large;
    const name = generateName();
    const x = 150 + i * 130;
    const y = HEIGHT / 2;
    positions.push({ x, y });
    faces.push(new Face(imageSrc, name, x, y));
  }
}

function drawFaces() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = '#0A0A0A';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Draw "openai" on the screen
  ctx.font = '32px Courier';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.fillText('openai', 10, 40);

  // Draw timer
  ctx.font = '24px Courier';
  ctx.textAlign = 'right';
  ctx.fillText(`Time Left: ${timeLeft}`, WIDTH - 10, 40);

  faces.forEach(face => {
    face.draw(showNames);
  });
}

function startMemorization() {
  showNames = true;
  timeLeft = SHOW_TIME;
  timer = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(timer);
      startRecall();
    }
    drawFaces();
  }, 1000);
  drawFaces();
}

function startRecall() {
  showNames = false;
  currentFaceIndex = 0;
  inputs.names = [];
  inputContainer.style.display = 'block';
  startButton.style.display = 'none';
  messageDiv.textContent = '';
  drawRecallScreen();
}

function drawRecallScreen() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = '#0A0A0A';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Draw "openai" on the screen
  ctx.font = '32px Courier';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.fillText('openai', 10, 40);

  faces.forEach((face, index) => {
    face.draw(false);
    if (index === currentFaceIndex) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(face.x - 52, face.y - 52, 104, 104);
    }
  });
}

function checkAnswers() {
  let correct = 0;
  faces.forEach(face => {
    if (inputs[face.name] && inputs[face.name].toLowerCase() === face.name.toLowerCase()) {
      correct++;
    }
  });
  showResult(correct);
}

function showResult(correct) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.font = '32px Courier';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(`You got ${correct} out of ${FACE_COUNT} correct!`, WIDTH / 2, HEIGHT / 2 - 50);
  ctx.font = '24px Courier';
  ctx.fillText('The game will restart shortly...', WIDTH / 2, HEIGHT / 2 + 10);
  setTimeout(() => {
    location.reload();
  }, 5000);
}

startButton.addEventListener('click', async () => {
  startButton.style.display = 'none';
  await loadFaces();
  startMemorization();
});

userInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const face = faces[currentFaceIndex];
    inputs[face.name] = userInput.value.trim();
    userInput.value = '';
    currentFaceIndex++;
    if (currentFaceIndex >= FACE_COUNT) {
      inputContainer.style.display = 'none';
      checkAnswers();
    } else {
      drawRecallScreen();
    }
  }
});

displayInstructions();
