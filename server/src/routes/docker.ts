/**
 * All routes in this file are protected!
 * Only admins can access them
 */

import express, { json } from "express";
import Docker from "dockerode";
import DockerController from "../controllers/docker";
import { isAdmin, isAuth } from "../auth/passport";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });
const router = express.Router();


router.get("/containers", isAuth, isAdmin, (req, res) => {
    docker.listContainers((err, containers) => {
        res.json(containers);
    });
});

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
            res.json({ message: "Challenge image started", statusCode: 200 });
        })
        .catch((err) => {
            res.send({ message: err.message, statusCode: 500 });
        });
});

/**
 * Create isolated environment for a challenge and starts the container
 * - A team can access this to create a container for a challenge
 * @param req: [challengeImage]
 */
router.post("/createChallengeContainer", (req, res, next) => {
    // let jsonObj = {challengeImage: req.fields.challengeImage, ports: ["8080/tcp"], containerName: 'challenge_TEAM4' };
    // console.log(req.fields);

    let jsonObj = {challengeImage: req.fields.challengeImage, ports: ["8080/tcp"], containerName: req.fields.containerName };
    DockerController.createChallengeContainer(jsonObj)
        .then((ports) => {
            res.json({ ports: ports, message: `Challenge container created/started http://localhost:${ports}`, statusCode: 200 });
        })
        .catch((err) => {
            console.log(err.json);
            res.send({ message: err.message, statusCode: 404 });
        });
});

/**
 * Started container [Only those where the team have access]
 * - Req: [id]
 */
router.post("/startContainer",isAuth, (req, res) => {
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
router.post("/stopContainer",isAuth, (req, res) => {
    let id = req.fields.id.toString();
    let container = docker.getContainer(id);
    container.stop((err, data) => {
        if (err == null)
            res.json({ msg: "Container stopped successfully", statusCode: 200 });
        else res.json({ message: err.json.message, statusCode: 404 });
    });
});

// TODO: Make resetContainer route
/**
 *
 * Stop container
 * Remove container
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
