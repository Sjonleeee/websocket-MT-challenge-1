const express = require("express");
const app = express();
const port = 3000;

// Serve static files from the "public" directory
app.use(express.static("public"));

// Route for the homepage
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
