let direction = "right";
let startSnake = [
  { x: 300, y: 300 },
  { x: 280, y: 300 },
  { x: 260, y: 300 },
];

const btnLeft = document.querySelector("#btnLeft");
const btnUp = document.querySelector("#btnUp");
const btnRight = document.querySelector("#btnRight");
const btnDown = document.querySelector("#btnDown");

btnLeft.addEventListener("click", () => handleDirectionChange("btnLeft"));
btnUp.addEventListener("click", () => handleDirectionChange("btnUp"));
btnRight.addEventListener("click", () => handleDirectionChange("btnRight"));
btnDown.addEventListener("click", () => handleDirectionChange("btnDown"));

// Snake Game
const gameArea = document.getElementById("game-area");
let snake;
let food;
let game;
let score = 0;

const initGame = () => {
  snake = startSnake;
  drawSnake();
  moveSnake();
};

const drawSnake = () => {
  snake.forEach((segment) => {
    const snakeBody = document.createElement("div");
    snakeBody.style.left = segment.x + "px";
    snakeBody.style.top = segment.y + "px";
    snakeBody.classList.add("snake");
    gameArea.appendChild(snakeBody);
  });
};

const moveSnake = () => {
  const newHead = { x: snake[0].x, y: snake[0].y };
  switch (direction) {
    case "up":
      newHead.y -= 20;
      break;
    case "down":
      newHead.y += 20;
      break;
    case "left":
      newHead.x -= 20;
      break;
    case "right":
      newHead.x += 20;
      break;
  }

  if (checkCollision(newHead)) {
    gameOver();
    return;
  }

  snake.pop();
  snake.unshift(newHead);
};

const checkCollision = (head) => {
  if (
    head.x < 0 ||
    head.x >= gameArea.offsetWidth ||
    head.y < 0 ||
    head.y >= gameArea.offsetHeight
  ) {
    return true;
  }

  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return true;
    }
  }

  return false;
};

const gameOver = () => {
  clearInterval(game);
  gameArea.innerHTML = "";
  const gameOver = document.createElement("h1");
  gameOver.innerHTML = "Game Over";
  gameOver.style.textAlign = "center";
  gameArea.appendChild(gameOver);
  resetButton.style.display = "block";
};

const getFoodLocation = () => {
  const foodX = Math.floor(Math.random() * 30) * 20;
  const foodY = Math.floor(Math.random() * 30) * 20;
  const foodLocation = { x: foodX, y: foodY };
  return foodLocation;
};

const drawFood = () => {
  const foodElement = document.createElement("div");
  foodElement.style.left = food.x + "px";
  foodElement.style.top = food.y + "px";
  foodElement.classList.add("food");
  foodElement.innerHTML = "🍔";
  gameArea.appendChild(foodElement);
};

const startButton = document.getElementById("start-button");

const startGame = () => {
  startButton.style.display = "none"; // hide start button
  clearInterval(game);
  gameArea.innerHTML = ""; // clear game area before drawing
  snake = startSnake;
  food = getFoodLocation();
  drawSnake();
  drawFood();
  game = setInterval(() => {
    gameArea.innerHTML = "";
    moveSnake();
    drawSnake();
    drawFood(); // draw food on each frame
    if (snake[0].x === food.x && snake[0].y === food.y) {
      snake.push(snake[snake.length - 1]);
      food = getFoodLocation();
      score += 1;
      document.getElementById("score").innerHTML = "Score: " + score;
    }
  }, 100);
};
startButton.addEventListener("click", startGame);

const resetButton = document.getElementById("reset-button");
const resetGame = () => {
  direction = "right";
  startSnake = [
    { x: 300, y: 300 },
    { x: 280, y: 300 },
    { x: 260, y: 300 },
  ];

  snake = startSnake;
  food = getFoodLocation();
  gameArea.innerHTML = "";
  drawSnake();
  drawFood();
  score = 0;
  document.getElementById("score").innerHTML = "Score: " + score;
  startButton.style.display = "block"; // show start button
  resetButton.style.display = "none"; // hide reset button
};
resetButton.addEventListener("click", resetGame);

const handleDirectionChange = (dir) => {
  switch (dir) {
    case "btnLeft":
      if (direction !== "right") {
        direction = "left";
      }
      break;
    case "btnUp":
      if (direction !== "down") {
        direction = "up";
      }
      break;
    case "btnRight":
      if (direction !== "left") {
        direction = "right";
      }
      break;
    case "btnDown":
      if (direction !== "up") {
        direction = "down";
      }
      break;
  }
};

document.addEventListener("keydown", (event) => {
  const key = event.key;
  switch (key) {
    case "ArrowLeft":
      handleDirectionChange("btnLeft");
      break;
    case "ArrowUp":
      handleDirectionChange("btnUp");
      break;
    case "ArrowRight":
      handleDirectionChange("btnRight");
      break;
    case "ArrowDown":
      handleDirectionChange("btnDown");
      break;
  }
});

// Direction buttons
const buttons = document.querySelectorAll(".btn");
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    handleDirectionChange(button.id);
  });
});

initGame();
