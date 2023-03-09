let is_running = false;
let stream;

let peer;

const $btnGyroscope = document.querySelector("#btnGyroscope");
const $myAudio = document.querySelector("#myAudio");

const init = async () => {
  targetSocketId = getUrlParameter("id");
  if (!targetSocketId) {
    alert(`Missing target ID in querystring`);
    return;
  }
  // Audio
  await getMediaAudio(targetSocketId);
  initSocket();
};

// $btnGyroscope.addEventListener("click", () => {
//   if (peer) {
//     const data = {
//       type: "playGyrscope",
//     };
//     peer.send(JSON.stringify(data));
//   }
// });

const initSocket = () => {
  socket = io.connect("/");
  socket.on("connect", () => {
    console.log(`Connected: ${socket.id}`);
    callPeer(targetSocketId);
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
  $btnGyroscope.addEventListener("click", (e) => handleGyroscopeClick(e));
  $resetButton.addEventListener("click", (e) => handleResetButton(e));

  // peer: receive signal to myId from peerId
  socket.on("signal", (myId, signal, peerId) => {
    peer.signal(signal);
  });
};

// --------------------------------

// Audio
const getMediaAudio = async (peerId) => {
  const constrains = { audio: true, video: false };
  stream = await navigator.mediaDevices.getUserMedia(constrains);
  $myAudio.srcObject = stream;
};

// Calling peer
const callPeer = (peerId) => {
  peer = new SimplePeer({ initiator: true, stream: stream, objectMode: true });
  peer.on("signal", (signal) => {
    socket.emit("signal", peerId, signal);
  });
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
  if (peer) {
    const data = {
      type: "handleClick",
    };
    peer.send(JSON.stringify(data));
  }
};

const handleStartButton = (e) => {
  if (peer) {
    const data = { type: "startGame" };
    peer.send(JSON.stringify(data));
  }
};

const handleResetButton = (e) => {
  const data = { type: "resetGame" };
  peer.send(JSON.stringify(data));
};

// const handleGyroscopeClick = (e) => {
//   const data = { type: "gyroscopeGame" };
//   handleMotion(e);
//   gyroscopeCoordinates();
//   console.log("gyroscope clicked");
//   peer.send(JSON.stringify(data));
// };

// const handleMotion = (e) => {
//   if (peer) {
//     const gyroscopeCoordinates = {
//       x: e.rotationRate.alpha,
//       z: e.rotationRate.gamma,
//     };
//     // motions for moving the snake
//     if (gyroscopeCoordinates.z < -100) {
//       const data = { type: "gyroscopeGame", direction: "right" };
//       peer.send(JSON.stringify(data));
//     }
//     if (gyroscopeCoordinates.z > 100) {
//       const data = { type: "gyroscopeGame", direction: "left" };
//       peer.send(JSON.stringify(data));
//     }
//     if (gyroscopeCoordinates.x > 100) {
//       const data = { type: "gyroscopeGame", direction: "down" };
//       peer.send(JSON.stringify(data));
//     }
//     if (gyroscopeCoordinates.x < -100) {
//       const data = { type: "gyroscopeGame", direction: "up" };
//       peer.send(JSON.stringify(data));
//     }
//   }
// };

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
