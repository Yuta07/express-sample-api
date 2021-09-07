import express from "express";

const app: express.Express = express();

app.use(express.json());

var port = process.env.PORT || 3000;

const user = require("./routes/v1/user");
app.use("/api/v1/", user);

app.listen(port);
console.log("listen on port " + port);
