import express from "express";
import Docker from "dockerode";
var docker = new Docker({ socketPath: "/var/run/docker.sock" });

import DockerController from "../controllers/docker";
import { isAdmin, isAuth } from "../middlewares/auth/authMiddleware";

const router = express.Router();

router.get("/containers", (req, res) => {
    docker.listContainers((err, containers) => {
        res.json(containers);
    });
});

/**
 * Id can be de container id OR name of the container
 */
router.get("/containers", isAuth, isAdmin, (req, res) => {
    let id = (req.query as any).Id;
    var container = docker.getContainer(id);
    container.inspect(function (err, data) {
        if (err == null) res.json(data);
        else res.json(err);
    });
});

router.get("/images", isAuth, isAdmin, (req, res) => {
    docker.listImages((err, images) => {
        res.json(images);
    });
});

router.post("/createChallengeImage", isAuth, isAdmin, (req, res, next) => {
    let jsonObj = req.fields;
    DockerController.createChallengeImage(jsonObj)
        .then(() => {
            res.json({ message: "Challenge image started", status: 200 });
        })
        .catch((err) => {
            res.send({ message: err.message, status: 500 });
        });
});

/**
 * [image, containerName]
 */
router.post("/createChallengeContainer", (req, res, next) => {
    let jsonObj = req.fields;

    DockerController.createChallengeContainer(jsonObj)
        .then(() => {
            res.json({ message: "Challenge container created/started", statusCode: 200 });
        })
        .catch((err) => {
            console.log(err.json);
            res.send({ message: err.message, status: 404 });
        });
});

/**
 * id can be de container id OR name of the container
 */
router.post("/startContainer", (req, res) => {
    let id = req.fields.id.toString();
    let container = docker.getContainer(id);
    container.start((err, data) => {
        if (err == null)
            res.json({ msg: "Container started successfully", statusCode: 200 });
        else res.json({ message: err.json.message, statusCode: 404 });
    });

});

/**
 * id can be de container id OR name of the container
 */
router.post("/stopContainer", (req, res) => {
    let id = req.fields.id.toString();
    let container = docker.getContainer(id);
    container.stop((err, data) => {
        if (err == null)
            res.json({ msg: "Container stoped successfully", statusCode: 200 });
        else res.json({ message: err.json.message, statusCode: 404 });
    });
});

// TODO: Make resetContainer route
/**
 *
 * Stop container
 * Removbe container
 * Make new container with de base challenge image *
 */
router.post("/resetContainer", isAuth, (req, res) => {
    let id = req.body.id;
    let container = docker.getContainer(id);
    container.stop((err, data) => {
        if (err == null)
            res.json({ statusCode: 200, msg: "Container reset successfully" });
        else res.json(err);
    });
});

export default { path: "/docker", router };
