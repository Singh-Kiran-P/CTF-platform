import express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    return res.json({ 'message': "Welcome to Backend!" });
});

module.exports = router;
