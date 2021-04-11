import express = require("express");
import authRouter from './auth.routes';

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({'message' : "Welcome to Backend!"});
});

router.use('/auth', authRouter);

module.exports = router;

