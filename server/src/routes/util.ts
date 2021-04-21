import express, { json } from "express";

const router = express.Router();


router.get("/ip", (req, res) => {
    const RequestIp = require('@supercharge/request-ip')

    const ip = RequestIp.getClientIp(req)
    console.log(ip);

    res.send(ip);
});

export default { path: "/util", router };
