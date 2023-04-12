 // Arduino info
      const arduinoInfo = { usbProductId: 32823, usbVendorId: 9025 };

      // App state
      const hasWebSerial = "serial" in navigator;
      let isConnected = false;

      const $notSupported = document.getElementById("not-supported");
      const $supported = document.getElementById("supported");
      const $notConnected = document.getElementById("not-connected");
      const $connected = document.getElementById("connected");

      const $connectButton = document.getElementById("connectButton");

      const init = async () => {
        displaySupportedState();
        if (!hasWebSerial) return;
        displayConnectionState();

        navigator.serial.addEventListener("connect", async (e) => {
          console.log("connect", e.target);
          const info = e.target.getInfo();
          if (info.usbProductId === arduinoInfo.usbProductId && info.usbVendorId === arduinoInfo.usbVendorId) {
            await connect(e.target);
          }
        });

        // PORTS
        const ports = (await navigator.serial.getPorts()).filter(port => {
          const info = port.getInfo();
          return info.usbProductId === arduinoInfo.usbProductId && info.usbVendorId === arduinoInfo.usbVendorId;
        })
        if (ports.length > 0) {
          await connect(ports[0]);
        }
        console.log(ports);
        // $connectButton.addEventListener("click", handleClickConnect);

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

      // Update the connected state
      const connect = async (port) => {
        isConnected = true;
        displayConnectionState();
        await port.open({ baudRate: 9600 });

        // TextEncoderStream sending data string to Arduino
        const textEncoder = new TextEncoderStream();
        const writer = textEncoder.writable.getWriter();

        // const intervalId = setInterval(async () => {
        //   const data = {
        //     r: Math.floor(Math.random() * 255),
        //     g: Math.floor(Math.random() * 255),
        //     b: Math.floor(Math.random() * 255),
        //   };
        //   console.log(data)
        //   await writer.write(JSON.stringify(data) = "\n");
        // }, 1000);

        // If that port is closed, stop sending data
        port.addEventListener("disconnect", () => {
          clearInterval(intervalId);
          isConnected = false;
          displayConnectionState();
        });
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