let direction = "right";
const $messages = document.getElementById("messages");

const $url = document.getElementById("qr");
let socket;

const init = () => {
  socket = io.connect("/");
  socket.on("connect", () => {
    console.log(`Connected: ${socket.id}`);

    const url = `${window.location}remote.html?id=${socket.id}`;

    $url.textContent = url;
    $url.setAttribute("href", url);
    const typeNumber = 4;
    const errorCorrectionLevel = "L";
    const qr = qrcode(typeNumber, errorCorrectionLevel);
    qr.addData(url);
    qr.make();
    document.getElementById("qr").innerHTML = qr.createImgTag(4);
  });

  // Update
  socket.on("update", (data) => {
    let $cursor = document.querySelector(`#cursor`);
    if (!$cursor) {
      $cursor = document.createElement(`div`);
      $cursor.classList.add(`cursor`);
      $cursor.setAttribute(`id`, `cursor`);
      document.body.appendChild($cursor);
    }
    $cursor.style.left = `${data.x * window.innerWidth}px`;
    $cursor.style.top = `${data.y * window.innerHeight}px`;
  });

  // Direction buttons
  socket.on("click", (dir) => {
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
  });

  // gyroscope directions buttons
  socket.on("gyroscope", (dir) => {
    console.log(dir);
    switch (dir) {
      case "left":
        if (direction !== "right") {
          direction = "left";
        }
        break;
      case "up":
        if (direction !== "down") {
          direction = "up";
        }
        break;

      case "right":
        if (direction !== "left") {
          direction = "right";
        }
        break;

      case "down":
        if (direction !== "up") {
          direction = "down";
        }
        break;
    }
  });

  // Start the game button
  socket.on("start-game", () => {
    console.log("start");
    startGame();
  });

  // Reset game
  socket.on("reset-game", () => {
    resetGame();
    console.log("reset");
  });
};

let startSnake = [
  { x: 300, y: 300 },
  { x: 280, y: 300 },
  { x: 260, y: 300 },
];

//  Snake Game
const gameArea = document.getElementById("game-area");
let snake;

const initGame = () => {
  snake = startSnake;
  drawSnake();
};

const getFoodLocation = () => {
  const foodX = Math.floor(Math.random() * 30) * 20;
  const foodY = Math.floor(Math.random() * 30) * 20;
  const foodLocation = { x: foodX, y: foodY };
  return foodLocation;
};

let food = getFoodLocation();
let game;

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

const drawFood = () => {
  const foodElement = document.createElement("div");
  foodElement.style.left = food.x + "px";
  foodElement.style.top = food.y + "px";
  foodElement.classList.add("food");
  foodElement.innerHTML = "🍔"; // add some content to the food element
  gameArea.appendChild(foodElement);
};

const eatFood = () => {
  if (snake[0].x === food.x && snake[0].y === food.y) {
    snake.push({
      x: snake[snake.length - 1].x,
      y: snake[snake.length - 1].y,
    });
    food = getFoodLocation();
  }
};

const checkCollision = () => {
  if (
    snake[0].x < 0 ||
    snake[0].x >= 600 ||
    snake[0].y < 0 ||
    snake[0].y >= 600
  ) {
    clearInterval(game);
    alert("Game Over!");
  }
  for (let i = 1; i < snake.length; i++) {
    if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
      clearInterval(game);
      alert("Game Over!");
    }
  }
};

const changeDirection = (event) => {
  switch (event.keyCode) {
    case 37:
      if (direction !== "right") {
        direction = "left";
      }
      break;
    case 38:
      if (direction !== "down") {
        direction = "up";
      }
      break;
    case 39:
      if (direction !== "left") {
        direction = "right";
      }
      break;
    case 40:
      if (direction !== "up") {
        direction = "down";
      }
      break;
  }
};

let previousTime = 0;
const startGame = () => {
  initGame();
  drawSnake();
  drawFood();
  previousTime = Date.now();
  gameLoop();
};

const gameLoop = () => {
  const currentTime = Date.now();
  const deltaTime = currentTime - previousTime;
  previousTime = currentTime;

  gameArea.innerHTML = "";
  moveSnake(deltaTime);
  drawSnake();
  drawFood();
  eatFood();
  checkCollision();

  requestAnimationFrame(gameLoop);
};

const resetGame = () => {
  direction = "right";
  startSnake = [
    { x: 300, y: 300 },
    { x: 280, y: 300 },
    { x: 260, y: 300 },
  ];

  snake = startSnake;
  food = getFoodLocation();
  clearInterval(game);
  previousTime = Date.now();
  requestAnimationFrame(gameLoop);
};

// let previousTime = 0;

// const startGame = () => {
//   initGame();
//   drawSnake();
//   drawFood();

//   game = setInterval(() => {
//     gameArea.innerHTML = "";
//     moveSnake();
//     drawSnake();
//     drawFood();
//     eatFood();
//     checkCollision();
//   }, 400);
// };

// const resetGame = () => {
//   direction = "right";
//   startSnake = [
//     { x: 300, y: 300 },
//     { x: 280, y: 300 },
//     { x: 260, y: 300 },
//   ];

//   snake = startSnake;
//   food = getFoodLocation();
//   clearInterval(game);
//   game = setInterval(() => {
//     moveSnake();
//     eatFood();
//     checkCollision();
//     gameArea.innerHTML = "";
//     drawSnake();
//     drawFood();
//   }, 400);
// };

document.addEventListener("keydown", changeDirection);
init();
