const express = require("express");
const cors = require("cors");
const path=require('path');
const routes = require("./routes");
require("./constants");
const emitter = require("./emitter");
require("dotenv").config({ path: "./.env" });

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, { origins: '*:*'});
const port = process.env.PORT;
app.use(cors());
app.options("*", cors());
app.use(express.json());

require("./database");
require("./helpers/MatchOrder");
app.use(express.static(path.join(__dirname, "build")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.use("/api", routes);
io.on("connection", function (socket) {
  socket.on("initData", () => {
    emitter.emit("initData");
  });
  emitter.on("returnExchangeData", (stocksData) => {
    socket.emit("getStocks", stocksData);
  });
  socket.on("getExchangeData", function () {
    emitter.emit("getExchangeData");
  });
});
server.listen(port, () => console.log(`Server is running on port ${port}`));
