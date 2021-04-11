import dotenv from "dotenv";
import express from "express";
import DB from "./database";
import { Team } from "./database/entities/accounts/Team";
dotenv.config();

const app = express();
app.use(express.urlencoded());
app.use(express.json());

// routes
const routes = require("./routes");
app.use(routes);

// template routes
const temproutes = require("./routes/template");
// route with prefix
app.use("/template", temproutes);

app.listen(process.env.SERVER_PORT);
console.log(`Server started at http://localhost:${process.env.SERVER_PORT}`);

/* // example database usage
DB.once('connect', () => {
    console.log('Database connected');
    DB.repo(Team).find({ relations: ['accounts', 'accounts.category'] }).then(entries => {
        console.log('Availale teams:');
        console.log(JSON.stringify(entries));
    });
});

 */
