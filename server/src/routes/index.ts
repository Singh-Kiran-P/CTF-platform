import auth from './auth.routes';
//import template from './template';
import express = require("express"); //comment
const router = express.Router(); //comment
import competition from './competition';

router.get("/", (req, res) => {
  return res.json({'message' : "Welcome to Backend!"});
});


export default [ auth ];


export default [
    template,
    competition
];
