import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
dotenv.config();

// TODO: add more functionality to server? custom Server class?

const app = express();

app.use(bodyParser.json());

app.listen(process.env.SERVER_PORT);
export default app;
