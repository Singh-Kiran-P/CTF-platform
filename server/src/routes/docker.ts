import express from "express";
import Docker from "dockerode";
var docker = new Docker({ socketPath: "/var/run/docker.sock" });

import DockerController from "../controllers/docker";
import { isAdmin, isAuth } from "auth/authMiddleware";

const router = express.Router();

router.get("/containers", isAuth, isAdmin, (req, res) => {
  docker.listContainers((err, containers) => {
    res.json(containers);
  });
});

router.get("/images", (req, res) => {
  docker.listImages((err, images) => {
    res.json(images);
  });
});

router.get("/containers", (req, res) => {
  let id = (req.query as any).Id;
  var container = docker.getContainer(id);
  container.inspect(function (err, data) {
    if (err == null) res.json(data);
    else res.json(err);
  });
});

router.post("/createChallengeImage", (req, res, next) => {
  let jsonObj = req.body;
  DockerController.createChallengeImage(jsonObj)
    .then(() => {
      res.json({ msg: "Challenge image started" });
    })
    .catch((err) => {
      res.send(err);
    });
});

/* TODO: catch error createChallengeContainer  */

router.post("/createChallengeContainer", (req, res, next) => {
  let jsonObj = req.body;
  DockerController.createChallengeContainer(jsonObj)
    .then(() => {
      res.json({ msg: "Challenge container started" });
    })
    .catch((err) => {
      res.json(err);
    });
});

/**
 * id can be de container id OR name of the container
 */
router.post("/startContainer", (req, res) => {
  let id = req.body.id;
  let container = docker.getContainer(id);
  container.start((err, data) => {
    if (err == null)
      res.json({ statusCode: 200, msg: "Container started successfully" });
    else res.json(err);
  });
});

/**
 * id can be de container id OR name of the container
 */
router.post("/stopContainer", (req, res) => {
  let id = req.body.id;
  let container = docker.getContainer(id);
  container.stop((err, data) => {
    if (err == null)
      res.json({ statusCode: 200, msg: "Container stopt successfully" });
    else res.json(err);
  });
});

// TODO: Make resetContainer route
/**
 *
 * Stop container
 * Removbe container
 * Make new container with de base challenge image *
 */
router.post("/resetContainer", (req, res) => {
  let id = req.body.id;
  let container = docker.getContainer(id);
  container.stop((err, data) => {
    if (err == null)
      res.json({ statusCode: 200, msg: "Container reset successfully" });
    else res.json(err);
  });
});

export default { path: "/docker", router };
