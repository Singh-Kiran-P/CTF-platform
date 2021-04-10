import express = require("express");
/*
  The Router is an object on the base express module.
  This router object will have similar methods (.get, .post, .patch, .delete) to the
  app object we have previously been using.
*/
const router = express.Router();

const users = []; // this would ideally be a database, but we'll start with something simple
var id = 1; // this will help us identify unique users

router.get("/users", (req, res) => {
  return res.json(users);
});

router.get("/users/:id", (req, res) => {
  const user = users.find(val => val.id === Number(req.params.id));
  return res.json(user);
});

// instead of app.post...
router.post("/users", (req, res) => {
  users.push({
    name: req.body.name,
    id: ++id
  });
  return res.json({ message: "Created" });
});

// instead of app.patch...
router.patch("/users/:id", (req, res) => {
  const user = users.find(val => val.id === Number(req.params.id));
  user.name = req.body.name;
  return res.json({ message: "Updated" });
});

// instead of app.delete...
router.delete("/users/:id", (req, res) => {
  const userIndex = users.findIndex(val => val.id === Number(req.params.id));
  users.splice(userIndex, 1);
  return res.json({ message: "Deleted" });
});

// Now that we have built up all these routes - let's export this module for use in our app.js!
module.exports = router;
