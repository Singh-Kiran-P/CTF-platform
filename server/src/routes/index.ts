import auth from './auth';
import template from './template';
import team from './team';
import account from './account';
import express = require("express"); //comment
const router = express.Router(); //comment
import competition from './competition';


export default [
    template,
    competition,
    auth,
    team,
    account
];
