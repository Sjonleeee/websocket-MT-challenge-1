const express = require("express");
const app = express();
const https = require("https");
const { Server } = require("socket.io");
const fs = require("fs");

// Const options - key en crt
const options = {
  key: fs.readFileSync("localhost.key"),
  cert: fs.readFileSync("localhost.crt"),
};

// Security for Https
const server = https.createServer(options, app);
const io = new Server(server);
const port = process.env.PORT || 443;

const clients = {};
io.on("connection", (socket) => {

  clients[socket.id] = { id: socket.id };
  console.log("Socket connected", socket.id);

  clients[socket.id].x = 0;
  clients[socket.id].y = 0;

  socket.on("update", (targetSocketId, data) => {
    if (!clients[targetSocketId]) {
      return;
    }
    clients[socket.id].x = data.x;
    clients[socket.id].y = data.y;
    io.to(targetSocketId).emit("update", data);
  });

  socket.on("click", (targetSocketId, data) => {
    if (!clients[targetSocketId]) {
      return;
    }
    io.to(targetSocketId).emit("click", data);
  });

  socket.on("disconnect", () => {
    delete clients[socket.id];
  });
});

app.use(express.static("public"));

server.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});
