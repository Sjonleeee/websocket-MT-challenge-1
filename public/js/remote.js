let socket = io("https://192.168.1.165/443");
let is_running = false;
const $btnGyroscope = document.querySelector("#btnGyroscope");

const init = () => {
  targetSocketId = getUrlParameter("id");
  if (!targetSocketId) {
    alert(`Missing target ID in querystring`);
    return;
  }
  socket = io.connect("/");
  socket.on("connect", () => {
    console.log(`Connected: ${socket.id}`);
  });

  // Listen for start-game event from client
  socket.on("start-game", (targetSocketId) => {
    // Find the socket with the specified ID
    const targetSocket = io.sockets.sockets.get(targetSocketId);

    if (!targetSocket) {
      console.log(`Socket with ID ${targetSocketId} not found`);
      return;
    }
    // Send start-game event to target socket
    targetSocket.emit("start-game");
  });

  socket.on("reset-game", (targetSocketId) => {
    // Find the socket with the specified ID
    const targetSocket = io.sockets.sockets.get(targetSocketId);

    if (!targetSocket) {
      console.log(`Socket with ID ${targetSocketId} not found`);
      return;
    }
    // Send start-game event to target socket
    targetSocket.emit("reset-game");
  });

  // Remote controller
  const $btnLeft = document.querySelector(`#btnLeft`);
  const $btnUp = document.querySelector(`#btnUp`);
  const $btnDown = document.querySelector(`#btnDown`);
  const $btnRight = document.querySelector(`#btnRight`);
  const $btnGyroscope = document.querySelector("#btnGyroscope");

  // Start button
  const $startButton = document.querySelector("#start-button");
  // Reset button
  const $resetButton = document.querySelector("#reset-button");

  $btnLeft.addEventListener(`click`, (e) => handleClick(e));
  $btnUp.addEventListener(`click`, (e) => handleClick(e));
  $btnDown.addEventListener(`click`, (e) => handleClick(e));
  $btnRight.addEventListener(`click`, (e) => handleClick(e));
  $startButton.addEventListener("click", (e) => handleStartButton(e));
  $resetButton.addEventListener("click", (e) => handleResetButton(e));
  $btnGyroscope.addEventListener("click", (e) => handleGyroscopeClick(e));
};

const getUrlParameter = (name) => {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  const regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  const results = regex.exec(location.search);
  return results === null
    ? false
    : decodeURIComponent(results[1].replace(/\+/g, " "));
};

const handleClick = (e) => {
  if (socket.connected) {
    socket.emit("click", targetSocketId, e.target.id);
  }
};

const handleStartButton = (e) => {
  if (socket.connected) {
    socket.emit("start-game", targetSocketId);
    console.log("Start game");
  }
};

const handleResetButton = (e) => {
  if (socket.connected) {
    socket.emit("reset-game", targetSocketId);
    console.log("Reset game");
  }
};

const handleMotion = (event) => {
  if (socket.connected) {
    const gyroscopeCoordinates = {
      x: event.rotationRate.alpha,
      z: event.rotationRate.gamma,
    };
    // motions for moving the snake
    if (gyroscopeCoordinates.z < -100) {
      socket.emit("gyroscope", targetSocketId, "right");
    }
    if (gyroscopeCoordinates.z > 100) {
      socket.emit("gyroscope", targetSocketId, "left");
    }
    if (gyroscopeCoordinates.x > 100) {
      socket.emit("gyroscope", targetSocketId, "down");
    }
    if (gyroscopeCoordinates.x < -100) {
      socket.emit("gyroscope", targetSocketId, "up");
    }
  }
};

const gyroscopeClick = (e) => {
  e.preventDefault();

  if (typeof DeviceOrientationEvent.requestPermission === "function") {
    DeviceOrientationEvent.requestPermission()
      .then((response) => {
        if (response == "granted") {
          gyroscopeClick();
        }
      })
      .catch(console.error);
  } else {
    gyroscopeClick();
  }

  if (is_running) {
    window.removeEventListener("devicemotion", handleMotion);
    $btnGyroscope.innerHTML = "Start the gyroscope";
    is_running = false;
  } else {
    window.addEventListener("devicemotion", handleMotion);
    $btnGyroscope.innerHTML = "Stop the gyroscope";
    is_running = true;
  }
};

$btnGyroscope.addEventListener("click", gyroscopeClick);

init();
