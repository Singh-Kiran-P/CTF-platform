import dotenv from "dotenv";
import express from "express";

// initialize configuration
dotenv.config();

// port is now available to the Node.js runtime
// as if it were an environment variable
const port = process.env.SERVER_PORT;

const app = express();

// define a route handler for the default home page
app.get("/", (req, res) => {
    // render the index template
    res.send("yo lsso");
});

app.get("/getId", (req, res) => {
    // render the index template
    res.json({ username: "Flavio" });
});

// start the express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
