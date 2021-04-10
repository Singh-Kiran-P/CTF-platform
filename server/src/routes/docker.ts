import express = require("express");
const router = express.Router();

router.get("/conatiners", (req, res) => {
  return res.json();
});

module.exports = router;
