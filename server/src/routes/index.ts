import auth from './auth';
import template from './template';
import express = require("express"); //comment
const router = express.Router(); //comment
import competition from './competition';
import docker from './docker';

/*
router.get("/", (req, res) => {
  return res.json({'message' : "Welcome to Backend!"});
});*/


export default [
    template,
    competition,
    docker,
    auth
];
