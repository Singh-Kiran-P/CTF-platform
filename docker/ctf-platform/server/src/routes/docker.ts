import express = require("express");
const router = express.Router();

/**
 * Return info of all containers
 */
router.get("/conatiners", (req, res) => {
    return res.json();
});

module.exports = router;
