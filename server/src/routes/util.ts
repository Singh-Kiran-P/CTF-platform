/**
 * @author Kiran Singh
 */
import express, { json } from "express";
const RequestIp = require('@supercharge/request-ip')

const router = express.Router();

router.get("/ip", (req, res) => {
    const ip = RequestIp.getClientIp(req)
    console.log(ip); // ip address of the user
    res.send(ip);
});

export default { path: "/util", router };
