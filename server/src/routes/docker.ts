import express from 'express';
import Docker from 'dockerode';
var docker = new Docker({ socketPath: '/var/run/docker.sock' });

import DockerController from '../controllers/docker';

const router = express.Router();

router.get("/containers", (req, res) => {

    docker.listContainers((err, containers) => {
        res.json(containers);
    });

});

router.get("/create", (req, res, next) => {
    DockerController
        .createChallengeImage(req, res, next)
        .then(() => {
            res.send('oke');
        })
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
            res.json({ statusCode: 200, msg: "Container stopt successfully" })
        else
            res.json(err);
    });
});

router.post("/startContainer", (req, res) => {
    let Id = req.body.Id;
    let container = docker.getContainer(Id);
    container.start((err, data) => {
        if (err == null)
            res.json({ statusCode: 200, msg: "Container started successfully" })
        else
            res.json(err);
    });
});

export default { path: '/docker', router };
