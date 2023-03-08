let direction = "right";
const $messages = document.getElementById("messages");
const $otherAudio = document.getElementById("otherAudio");

const $url = document.getElementById("qr");
let socket;
let peer;

const init = async () => {
  initSocket();
};

const initSocket = () => {
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

  // Handle peer
  const handlePeerOffer = async (myPeerId, offer, peerId) => {
    peer = new SimplePeer({ initiator: false });
    peer.on("signal", (signal) => {
      socket.emit("signal", peerId, signal);
    });
    peer.on("stream", (stream) => {
      $otherAudio.srcObject = stream;
    });
  };

  // Signal
  socket.on("signal", async (myId, signal, peerId) => {
    console.log(`received signal from ${peerId} to ${myId}`);
    if (signal.type === "offer") {
      console.log("signal type is offer", signal);
      await handlePeerOffer(myId, peerId, signal);
    }
    peer.signal(signal);
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

const getFoodLocation = () => {
  const foodX = Math.floor(Math.random() * 30) * 20;
  const foodY = Math.floor(Math.random() * 30) * 20;
  const foodLocation = { x: foodX, y: foodY };
  return foodLocation;
};

let food = getFoodLocation();
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

const startGame = () => {
  initGame();
  drawSnake();
  drawFood();
  previousTime = Date.now();
  gameLoop();
};

const speed = 600; // The desired speed in milliseconds
let previousTime = performance.now();

const gameLoop = (currentTime) => {
  const deltaTime = currentTime - previousTime;
  previousTime = currentTime;

  // Use the deltaTime variable to adjust the speed of the animation
  const framesPerSecond = 30;
  if (deltaTime >= framesPerSecond) {
    // Update the game state and draw the game
    gameArea.innerHTML = "";
    moveSnake();
    drawSnake();
    drawFood();
    eatFood();
    checkCollision();
  }

  // Call requestAnimationFrame to loop the animation
  requestAnimationFrame(gameLoop);
};

// Call requestAnimationFrame to start the animation loop
requestAnimationFrame(gameLoop);

const resetGame = () => {
  direction = "right";
  startSnake = [
    { x: 300, y: 300 },
    { x: 280, y: 300 },
    { x: 260, y: 300 },
  ];

  snake = startSnake; // Copy the startSnake array
  food = getFoodLocation();
  previousTime = performance.now(); // Reset the time
  requestAnimationFrame(gameLoop); // Restart the loop};
};

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
