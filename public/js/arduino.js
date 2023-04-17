// Arduino info
const arduinoInfo = { usbProductId: 32823, usbVendorId: 9025 };
let connectedArduinoPorts = [];

// App state
const hasWebSerial = "serial" in navigator;
const isRedLedOn = true;
let isConnected = false;

const $notSupported = document.getElementById("not-supported");
const $supported = document.getElementById("supported");
const $notConnected = document.getElementById("not-connected");
const $connected = document.getElementById("connected");

const $connectButton = document.getElementById("connectButton");
const $redButton = document.getElementById("redButton");

const $xValue = document.getElementById("xValue");
const $yValue = document.getElementById("yValue");

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

  // PORTS
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
  $redButton.addEventListener("click", handleRedButtonClick);

  // REQUEST PORT
  const port = await navigator.serial.requestPort();
  console.log(port);
};

const handleClickConnect = async () => {
  const port = await navigator.serial.requestPort();
  console.log(port);
  const info = port.getInfo();
  console.log(info);
};

const handleRedButtonClick = async () => {
  const textEncoder = new TextEncoder();
  const data = { led: "R", state: isRedLedOn ? "on" : "off" };
  const message = JSON.stringify(data) + "\n";
  await port.write(textEncoder.encode(message));
  isRedLedOn = !isRedLedOn;
};

// Update the connected state
const connect = async (port) => {
  isConnected = true;
  displayConnectionState();
  await port.open({ baudRate: 9600 });

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

    $xValue.innerText = "x: " + joystickX;
    $yValue.innerText = "y: " + joystickY;
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
