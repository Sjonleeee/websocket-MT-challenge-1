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
  if (socket.connected) {
    socket.emit("click", targetSocketId, e.target.id);
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

init();
