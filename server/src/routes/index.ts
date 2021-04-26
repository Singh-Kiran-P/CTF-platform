import auth from './auth';
import team from './team';
import account from './account';
import express = require("express"); //comment
const router = express.Router(); //comment
import competition from './competition';
import docker from './docker';
import util from './util';


export default [
    competition,
    account,
    docker,
    auth,
    util,
    team,
];
