import dotenv from 'dotenv';
import express from 'express';
dotenv.config();

// TODO: add more functionality to server? custom Server class?

const app = express();
app.listen(process.env.SERVER_PORT);
export default app;
