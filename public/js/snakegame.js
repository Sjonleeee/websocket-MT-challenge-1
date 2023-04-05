let direction = "right";
let startSnake = [
  { x: 300, y: 300 },
  { x: 280, y: 300 },
  { x: 260, y: 300 },
];

// Snake Game
const gameArea = document.getElementById("game-area");
let snake;
let food;
let game;

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
  snake.pop();
  snake.unshift(newHead);
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
  foodElement.innerHTML = "🍔"; // add some content to the food element
  gameArea.appendChild(foodElement);
};

const startButton = document.getElementById("start-button");

const startGame = () => {
  clearInterval(game);
  food = getFoodLocation();
  drawFood();
  game = setInterval(() => {
    gameArea.innerHTML = "";
    moveSnake();
    drawSnake();
    if (snake[0].x === food.x && snake[0].y === food.y) {
      snake.push(snake[snake.length - 1]);
      food = getFoodLocation();
      drawFood();
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

// Direction buttons
const buttons = document.querySelectorAll(".btn");
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    handleDirectionChange(button.id);
  });
});

initGame();