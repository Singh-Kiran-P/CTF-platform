/**
 * All routes in this file are protected!
 * Only admins can access them
 * //TODO: stop/start challenge protected for teams
 */

import express, { json } from "express";
import Docker from "dockerode";
import DockerController from "../controllers/docker";
import { isAdmin, isAuth } from "../auth";
import { deserialize } from '@shared/objectFormdata';
import { parentDir, fileName, upload, move, remove, unzip, chain, unzip_ } from '../files';

import DB, { DockerChallengeContainer, DockerChallengeImage, DockerManagement, DockerManagementRepo, DockerOpenPort } from '../database';
import { uploaddir } from "./uploads";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });
const router = express.Router();

router.get("/dockerConfigPorts", isAdmin, isAuth, async (req, res) => {
    const dockerManagementRepo = DB.crepo(DockerManagementRepo)
    const data = (await dockerManagementRepo.instance());
    res.json(data);
})
router.post("/dockerConfigPorts", isAdmin, isAuth, async (req, res) => {
    let upperBoundPort = Number.parseInt(req.fields.upperBoundPort.toString());
    let lowerBoundPort = Number.parseInt(req.fields.lowerBoundPort.toString());

    const dockerManagementRepo = DB.crepo(DockerManagementRepo)
    dockerManagementRepo.setLowerBoundPort(lowerBoundPort);
    dockerManagementRepo.setUpperBoundPort(upperBoundPort)

    res.json({ message: "Ports range updated to [ " + lowerBoundPort + " - " + upperBoundPort + " ]", statusCode: 200 });
})


router.get("/containers",  (req, res) => {
    docker.listContainers((err, containers) => {
        console.log(err);
        console.log(containers);
        res.json(containers);
    });
});

// router.get("/containers", isAuth, isAdmin, (req, res) => {
//     let id = (req.query as any).Id;
//     var container = docker.getContainer(id);
//     container.inspect(function (err, data) {
//         if (err == null) res.json(data);
//         else res.json(err);
//     });
// });

router.get("/images", (req, res) => {
    docker.listImages((err, images) => {
        res.json(images);
    });
});

//upload zip , unzip , get path to unzipped folder
router.post("/createChallengeImage", isAuth, isAdmin, (req, res, next) => {
    let jsonObj = req.fields;
    DockerController.createChallengeImage(jsonObj)
        .then(() => {
            console.log("created");

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
router.post("/createChallengeContainer", async (req, res, next) => {
    let name: string = req.fields.challengeImage.toString();
    console.log(name);

    let image = await DockerController.getImage(name)
    console.log(image);

    if (image != undefined) {

        // get ports from image entity
        let jsonObj = { challengeImage: name, ports: image.innerPorts, containerName: req.fields.containerName };
        DockerController.createChallengeContainer(jsonObj)
            .then((ports) => {
                res.json({ ports: ports, message: `Challenge container created/started http://localhost:${ports}`, statusCode: 200 });
            })
            .catch((err) => {
                console.log(err.json);
                res.json({ message: err.message, statusCode: 404 });
            });

    }
    else {
        res.json({ message: "Image not found!", statusCode: 404 });
    }

});

/**
 * Started container [Only those where the team have access]
 * - Req: [id]
 */
router.post("/startContainer", isAuth, (req, res) => {
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
router.post("/stopContainer", isAuth, (req, res) => {
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
router.post("/resetContainer", isAdmin, (req, res) => {
    let id = req.body.id;
    let container = docker.getContainer(id);
    container.stop((err, data) => {
        if (err == null)
            res.json({ statusCode: 200, msg: "Container reset successfully" });
        else res.json(err);
    });
});

router.post("/makeImage", isAdmin, (req, res) => {
    let data = deserialize(req);

    DockerController.makeImage(data)
        .then(() => {
            res.json({ message: `Challenge image created successfully`, statusCode: 200 });
        })
        .catch((err) => {
            res.json({ message: err, statusCode: 404 });
        });

});



/********************** TESTING ROUTES ********************/

// Gives the DockerManagement Entity
router.get("/dockerConfig", async (req, res) => {
    const dockerManagementRepo = DB.crepo(DockerManagementRepo)
    const a = (await dockerManagementRepo.instance());

    const dockerOpenPort = DB.repo(DockerOpenPort);
    (await dockerOpenPort.find().then(d => {
        res.send(a);
    }));
});

// Gives the DockerManagement Entity
router.get("/dockerConfig_", async (req, res) => {
    const dockerManagementRepo = DB.crepo(DockerManagementRepo)
    await dockerManagementRepo.setUpperBoundPort(5);
    const a = (await dockerManagementRepo.instance());
});

router.get("/dockerConfig_i", (req, res) => {
    const challenge = DB.repo(DockerChallengeContainer);
    challenge.createQueryBuilder("DockerChallengeContainer")
        .leftJoinAndSelect("DockerChallengeContainer.image", "x")
        .getMany().then(d => {
            res.send(d);
        })
});

router.get("/dockerConfig_createChallengeContainer", async (req, res) => {
    const challenge = DB.repo(DockerChallengeImage);
    let d = new DockerChallengeImage("hello", ["80/tcp"], 25);
    await challenge.save(d);

    let image = await DockerController.getImage("hello")

    if (image != undefined) {
        res.json({ statusCode: 200, data: d });

    }
    else {
        res.json({ statusCode: 404, msg: "Image not found" });
    }
});

export default { path: "/docker", router };
