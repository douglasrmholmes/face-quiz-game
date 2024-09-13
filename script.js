const startButton = document.getElementById('start-button');
const facesContainer = document.getElementById('faces-container');
const messageDiv = document.getElementById('message');
const timerDiv = document.getElementById('timer');

const FACE_COUNT = 5;
const SHOW_TIME = 30; // seconds
const faces = [];
let timeLeft = SHOW_TIME;
let timer;
let showNames = true;

class Face {
  constructor(imageSrc, name) {
    this.imageSrc = imageSrc;
    this.name = name;
    this.userInput = '';
    this.element = null;
    this.inputElement = null;
  }

  createElement() {
    // Create container
    const faceItem = document.createElement('div');
    faceItem.className = 'face-item';

    // Create image
    const img = document.createElement('img');
    img.src = this.imageSrc;
    faceItem.appendChild(img);

    // Create name or input field
    if (showNames) {
      const nameDiv = document.createElement('div');
      nameDiv.textContent = this.name;
      nameDiv.style.marginTop = '10px';
      faceItem.appendChild(nameDiv);
    } else {
      this.inputElement = document.createElement('input');
      this.inputElement.type = 'text';
      this.inputElement.className = 'face-input';
      this.inputElement.placeholder = 'Enter name';
      faceItem.appendChild(this.inputElement);
    }

    this.element = faceItem;
    facesContainer.appendChild(faceItem);
  }
}

function displayInstructions() {
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
  messageDiv.innerHTML = instructions.join('<br>');
}

async function loadFaces() {
  for (let i = 0; i < FACE_COUNT; i++) {
    const response = await fetch('https://randomuser.me/api/');
    const data = await response.json();
    const user = data.results[0];
    const imageSrc = user.picture.large;
    const name = `${user.name.first} ${user.name.last}`;
    faces.push(new Face(imageSrc, name));
  }
}

function displayFaces() {
  facesContainer.innerHTML = '';
  faces.forEach(face => {
    face.createElement();
  });
}

function startMemorization() {
  showNames = true;
  timeLeft = SHOW_TIME;
  messageDiv.textContent = '';
  startButton.style.display = 'none';
  facesContainer.style.display = 'flex';
  displayFaces();
  timerDiv.textContent = `Time Left: ${timeLeft}`;

  timer = setInterval(() => {
    timeLeft--;
    timerDiv.textContent = `Time Left: ${timeLeft}`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      startRecall();
    }
  }, 1000);
}

function startRecall() {
  showNames = false;
  facesContainer.innerHTML = '';
  displayFaces();
  timerDiv.textContent = '';
  messageDiv.textContent = '';

  // Add a submit button
  const submitButton = document.createElement('button');
  submitButton.id = 'submit-button';
  submitButton.textContent = 'Submit Answers';
  submitButton.style.marginTop = '20px';
  submitButton.style.padding = '10px 20px';
  submitButton.style.fontSize = '16px';
  submitButton.addEventListener('click', checkAnswers);
  messageDiv.appendChild(submitButton);
}

function checkAnswers() {
  let correct = 0;
  faces.forEach(face => {
    const userAnswer = face.inputElement.value.trim();
    if (userAnswer.toLowerCase() === face.name.toLowerCase()) {
      correct++;
    }
  });
  showResult(correct);
}

function showResult(correct) {
  facesContainer.style.display = 'none';
  messageDiv.innerHTML = `You got ${correct} out of ${FACE_COUNT} correct!<br>The game will restart shortly...`;
  setTimeout(() => {
    location.reload();
  }, 5000);
}

startButton.addEventListener('click', async () => {
  await loadFaces();
  startMemorization();
});

displayInstructions();
