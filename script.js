const menuScreen = document.getElementById("menuScreen");
const helpScreen = document.getElementById("helpScreen");
const gameScreen = document.getElementById("gameScreen");
const completeScreen = document.getElementById("completeScreen");

const startBtn = document.getElementById("startBtn");
const helpBtn = document.getElementById("helpBtn");
const backBtn = document.getElementById("backBtn");
const restartBtn = document.getElementById("restartBtn");
const soundBtn = document.getElementById("soundBtn");
const hintBtn = document.getElementById("hintBtn");
const nextBtn = document.getElementById("nextBtn");
const menuBtn = document.getElementById("menuBtn");

const mazeElement = document.getElementById("maze");

const levelText = document.getElementById("levelText");
const scoreText = document.getElementById("scoreText");
const stepsText = document.getElementById("stepsText");
const timeText = document.getElementById("timeText");

const completeTitle = document.getElementById("completeTitle");
const completeMessage = document.getElementById("completeMessage");
const finalScore = document.getElementById("finalScore");
const finalSteps = document.getElementById("finalSteps");
const finalTime = document.getElementById("finalTime");

const levels = [
    [
        "111111111",
        "100000001",
        "101111101",
        "101000101",
        "101011101",
        "101000001",
        "101111101",
        "100000001",
        "111111111"
    ],

    [
        "111111111",
        "100010001",
        "101010101",
        "101000101",
        "101111101",
        "100000101",
        "111110101",
        "100000001",
        "111111111"
    ],

    [
        "111111111",
        "100000001",
        "101111101",
        "101000101",
        "101011101",
        "101010001",
        "101011111",
        "100000001",
        "111111111"
    ]
];

let currentLevel = 0;
let playerRow = 1;
let playerCol = 1;

let goalRow = 7;
let goalCol = 7;

let score = 100;
let steps = 0;
let seconds = 0;

let timer = null;
let soundEnabled = true;
let hintActive = false;

function showScreen(screen) {
    menuScreen.classList.add("hidden");
    helpScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");
    completeScreen.classList.add("hidden");

    screen.classList.remove("hidden");
}

function startGame() {
    currentLevel = 0;
    loadLevel();
    showScreen(gameScreen);
}

function loadLevel() {

    clearInterval(timer);

    playerRow = 1;
    playerCol = 1;

    score = 100;
    steps = 0;
    seconds = 0;
    hintActive = false;

    findGoal();

    updateStats();
    drawMaze();

    timer = setInterval(() => {
        seconds++;
        timeText.textContent = seconds;
    }, 1000);

    speak("Level " + (currentLevel + 1) + " started. Find the goal.");
}

function findGoal() {

    const maze = levels[currentLevel];

    for (let r = 0; r < maze.length; r++) {
        for (let c = 0; c < maze[r].length; c++) {

            if (
                maze[r][c] === "0" &&
                r > 5 &&
                c > 5
            ) {
                goalRow = r;
                goalCol = c;
            }
        }
    }
}

function drawMaze() {

    const maze = levels[currentLevel];

    mazeElement.innerHTML = "";

    mazeElement.style.gridTemplateRows =
        `repeat(${maze.length}, 1fr)`;

    mazeElement.style.gridTemplateColumns =
        `repeat(${maze[0].length}, 1fr)`;

    for (let r = 0; r < maze.length; r++) {

        for (let c = 0; c < maze[r].length; c++) {

            const cell = document.createElement("div");

            cell.classList.add("cell");

            if (maze[r][c] === "1") {
                cell.classList.add("wall");
            } else {
                cell.classList.add("path");
            }

            if (r === playerRow && c === playerCol) {
                cell.classList.add("player");
            }

            if (r === goalRow && c === goalCol) {
                cell.classList.add("goal");
            }

            if (
                hintActive &&
                r === playerRow &&
                c === playerCol + 1
            ) {
                cell.classList.add("hint");
            }

            mazeElement.appendChild(cell);
        }
    }
}

function movePlayer(direction) {

    const maze = levels[currentLevel];

    let newRow = playerRow;
    let newCol = playerCol;

    if (direction === "up") {
        newRow--;
    }

    if (direction === "down") {
        newRow++;
    }

    if (direction === "left") {
        newCol--;
    }

    if (direction === "right") {
        newCol++;
    }

    if (
        newRow < 0 ||
        newRow >= maze.length ||
        newCol < 0 ||
        newCol >= maze[0].length
    ) {
        wallSound();
        speak("You cannot move there.");
        return;
    }

    if (maze[newRow][newCol] === "1") {
        wallSound();
        speak("Wall.");
        return;
    }

    playerRow = newRow;
    playerCol = newCol;

    steps++;
    score = Math.max(0, score - 2);

    hintActive = false;

    updateStats();
    drawMaze();

    moveSound();

    if (
        playerRow === goalRow &&
        playerCol === goalCol
    ) {
        completeLevel();
    }
}

function updateStats() {
    levelText.textContent = currentLevel + 1;
    scoreText.textContent = score;
    stepsText.textContent = steps;
    timeText.textContent = seconds;
}

function completeLevel() {

    clearInterval(timer);

    finalScore.textContent = score;
    finalSteps.textContent = steps;
    finalTime.textContent = seconds;

    if (currentLevel === levels.length - 1) {

        completeTitle.textContent = "Game Complete!";
        completeMessage.textContent =
            "Great job! You completed all 3 levels.";

        nextBtn.classList.add("hidden");

    } else {

        completeTitle.textContent = "Level Complete!";
        completeMessage.textContent =
            "Great job! You reached the goal.";

        nextBtn.classList.remove("hidden");
    }

    showScreen(completeScreen);

    successSound();
    speak("Level complete.");
}

function nextLevel() {

    if (currentLevel < levels.length - 1) {
        currentLevel++;
        loadLevel();
        showScreen(gameScreen);
    }
}

function restartLevel() {
    loadLevel();
}

function showHint() {

    hintActive = true;

    drawMaze();

    score = Math.max(0, score - 5);

    updateStats();

    speak("Hint activated. Look for the highlighted path.");

    setTimeout(() => {
        hintActive = false;
        drawMaze();
    }, 2000);
}

function speak(message) {

    if (!soundEnabled) {
        return;
    }

    if ("speechSynthesis" in window) {

        speechSynthesis.cancel();

        const speech =
            new SpeechSynthesisUtterance(message);

        speech.rate = 1;
        speech.volume = 1;

        speechSynthesis.speak(speech);
    }
}

function playTone(frequency, duration) {

    if (!soundEnabled) {
        return;
    }

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {
            return;
        }

        const audioContext = new AudioContext();

        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        oscillator.frequency.value = frequency;

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start();

        gain.gain.setValueAtTime(
            0.1,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + duration
        );

        oscillator.stop(
            audioContext.currentTime + duration
        );

    } catch (error) {
        // Sound is optional, so the game continues normally.
    }
}

function moveSound() {
    playTone(600, 0.08);
}

function wallSound() {
    playTone(150, 0.15);
}

function successSound() {
    playTone(800, 0.15);

    setTimeout(() => {
        playTone(1000, 0.2);
    }, 150);
}

startBtn.addEventListener("click", startGame);

helpBtn.addEventListener("click", () => {
    showScreen(helpScreen);
});

backBtn.addEventListener("click", () => {
    showScreen(menuScreen);
});

restartBtn.addEventListener("click", restartLevel);

hintBtn.addEventListener("click", showHint);

nextBtn.addEventListener("click", nextLevel);

menuBtn.addEventListener("click", () => {
    clearInterval(timer);
    showScreen(menuScreen);
});

soundBtn.addEventListener("click", () => {

    soundEnabled = !soundEnabled;

    if (soundEnabled) {
        soundBtn.textContent = "🔊 SOUND: ON";
        speak("Sound on.");
    } else {
        soundBtn.textContent = "🔇 SOUND: OFF";

        if ("speechSynthesis" in window) {
            speechSynthesis.cancel();
        }
    }
});

document.querySelectorAll("[data-direction]")
    .forEach(button => {

        button.addEventListener("click", () => {

            const direction =
                button.dataset.direction;

            movePlayer(direction);
        });
    });

document.addEventListener("keydown", event => {

    if (gameScreen.classList.contains("hidden")) {
        return;
    }

    const keys = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right"
    };

    if (keys[event.key]) {

        event.preventDefault();

        movePlayer(keys[event.key]);
    }
});