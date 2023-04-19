// Arduino info
const arduinoInfo = { usbProductId: 32823, usbVendorId: 9025 };
let connectedArduinoPorts = [];

// App state
const hasWebSerial = "serial" in navigator;
let isConnected = false;
let port;

const $notSupported = document.getElementById("not-supported");
const $supported = document.getElementById("supported");
const $notConnected = document.getElementById("not-connected");
const $connected = document.getElementById("connected");

const $connectButton = document.getElementById("connectButton");

const $xValue = document.getElementById("xValue");
const $yValue = document.getElementById("yValue");

let writer;

const init = async () => {
  displaySupportedState();
  if (!hasWebSerial) return;
  displayConnectionState();

  navigator.serial.addEventListener("connect", async (e) => {
    console.log("connect", e.target);
    const info = e.target.getInfo();
    if (
      info.usbProductId === arduinoInfo.usbProductId &&
      info.usbVendorId === arduinoInfo.usbVendorId
    ) {
      await connect(e.target);
    }
  });

  // Automatically connect to first available Arduino
  const ports = (await navigator.serial.getPorts()).filter((port) => {
    const info = port.getInfo();
    return (
      info.usbProductId === arduinoInfo.usbProductId &&
      info.usbVendorId === arduinoInfo.usbVendorId
    );
  });
  if (ports.length > 0) {
    await connect(ports[0]);
  }
  console.log(ports);
  $connectButton.addEventListener("click", handleClickConnect);

  // REQUEST PORT
  const port = await navigator.serial.requestPort();
  console.log(port);
};

// Request port when Connect button is clicked
const handleClickConnect = async () => {
  port = await navigator.serial.requestPort();
  console.log(port);
  const info = port.getInfo();
  console.log(info);
};

// Connect to Arduino and set up data streams
const connect = async (port) => {
  isConnected = true;
  displayConnectionState();
  await port.open({ baudRate: 9600 });

  // Sending data to the Arduino
  const textEncoder = new TextEncoderStream();
  const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
  writer = textEncoder.writable.getWriter();

  // Linebreak transformer
  const lineBreakTransformer = new TransformStream({
    transform(chunk, controller) {
      const text = chunk;
      const lines = text.split("\n");
      lines[0] = (this.remainder || "") + lines[0];
      this.remainder = lines.pop();
      lines.forEach((line) => controller.enqueue(line));
    },
    flush(controller) {
      if (this.remainder) {
        controller.enqueue(this.remainder);
      }
    },
  });

  // Read data from the port
  while (port.readable) {
    const decoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(decoder.writable);
    const inputStream = decoder.readable.pipeThrough(lineBreakTransformer);
    const reader = inputStream.getReader();

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          // |reader| has been canceled.
          break;
        }
        try {
          const parsed = JSON.parse(value);
          processJSON(parsed);
        } catch (e) {
          // console.log(e);
        }
      }
    } catch (error) {
      // Handle |error|...
    } finally {
      reader.releaseLock();
    }
  }

  // If that port is closed, stop sending data
  port.addEventListener("disconnect", () => {
    console.log(`Disconnected: ${port.serialNumber}`);
    lineBreakTransformer.readable.cancel();
    isConnected = false;
    displayConnectionState();
  });
};

const processJSON = (json) => {
  if (json.sensor === "joystick") {
    const joystickX = json.data[0];
    const joystickY = json.data[1];

    // Determine direction based on joystick input
    if (joystickX > 600) {
      direction = "right";
    } else if (joystickX < 400) {
      direction = "left";
    } else if (joystickY > 600) {
      direction = "down";
    } else if (joystickY < 400) {
      direction = "up";
    }

    // $xValue.innerText = "x: " + joystickX;
    // $yValue.innerText = "y: " + joystickY;
  }
};

const displaySupportedState = () => {
  if (hasWebSerial) {
    $notSupported.style.display = "none";
    $supported.style.display = "block";
  } else {
    $notSupported.style.display = "block";
    $supported.style.display = "none";
  }
};

const displayConnectionState = () => {
  if (isConnected) {
    $notConnected.style.display = "none";
    $connected.style.display = "block";
  } else {
    $notConnected.style.display = "block";
    $connected.style.display = "none";
  }
};

init();

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

const drawSnake = async () => {
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

const gameOver = async () => {
  if (!isConnected) {
    return;
  }
  await writer.write(
    JSON.stringify({
      red: "R",
    })
  );
  await writer.write("\n");

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
  game = setInterval(async () => {
    gameArea.innerHTML = "";
    moveSnake();
    drawSnake();
    drawFood(); // draw food on each frame
    if (snake[0].x === food.x && snake[0].y === food.y) {
      snake.push(snake[snake.length - 1]);
      food = getFoodLocation();
      score += 1;
      document.getElementById("score").innerHTML = "Score: " + score;
      if ((score += 1)) {
        if (!isConnected) {
          return;
        }
        await writer.write(
          JSON.stringify({
            red: "G",
          })
        );
        await writer.write("\n");
      }
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
