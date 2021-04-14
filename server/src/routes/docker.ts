import express from 'express';
import Docker = require('dockerode');
var docker = new Docker({ socketPath: '/var/run/docker.sock' });

const router = express.Router();

// Require controller modules.
var dockerControllers = require('../controllers/docker');

router.get("/containers", (req, res) => {

  docker.listContainers((err, containers) => {
    res.json(containers);
  });

});

router.get("/containers", (req, res) => {
  let id = req.query.Id;
  var container = docker.getContainer(id);
  container.inspect(function (err, data) {
    if (err == null)
      res.json(data)
    else
      res.json(err);
  });
});

router.post("/stopContainer", (req, res) => {
  let Id = req.body.Id;
  let container = docker.getContainer(Id);
  container.stop((err, data) => {
    if (err == null)
      res.json({statusCode : 200, msg : "Container stopt successfully"})
    else
      res.json(err);
  });
});

router.post("/startContainer", (req, res) => {
  let Id = req.body.Id;
  let container = docker.getContainer(Id);
  container.start((err, data) => {
    if (err == null)
      res.json({statusCode : 200, msg : "Container started successfully"})
    else
      res.json(err);
  });
});

export default { path: '/docker', router };
