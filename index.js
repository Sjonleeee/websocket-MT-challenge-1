const express = require("express");
const app = express();
const https = require("https");
const port = process.env.PORT || 443;
const fs = require("fs");

// Const options - key en crt
const options = {
  key: fs.readFileSync("localhost.key"),
  cert: fs.readFileSync("localhost.crt"),
};

// Security for Https
const server = https.Server(options, app);

// Serve static files from the "public" directory
app.use(express.static("public"));

// Route for the homepage
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
