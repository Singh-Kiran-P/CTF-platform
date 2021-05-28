/**
 * @auther Kiran Singh
 * All routes in this file are protected!
 * Only admins can access them
 */
import { isAdmin, isAuth } from "@/auth";
import express from "express";
import {DockerController} from "../controllers/docker";
let controller = new DockerController();

const router = express.Router();

router.get("/dockerConfigPorts", isAdmin, controller.dockerConfigPorts_GET)

router.post("/dockerConfigPorts", isAdmin, controller.dockerConfigPorts_POST)

router.get("/containers", isAdmin, controller.containers_GET);

router.get("/images", isAdmin, controller.images_GET);

// router.post("/makeImage", isAdmin, controller.makeImage_POST);

// router.post("/createChallengeContainer", isAuth, controller.createChallengeContainer_POST);

// router.post("/startContainer", isAuth, controller.startContainer_POST);

// router.post("/stopContainer", isAuth, controller.stopContainer_POST);

// router.post("/resetContainer", isAuth, controller.resetContainer_POST);

router.get("/test", controller.test)

export default { path: "/docker", router };


// /********************** TESTING ROUTES ********************/

// // Gives the DockerManagement Entity
// router.get("/dockerConfig", async (req, res) => {
//     const dockerManagementRepo = DB.crepo(DockerManagementRepo)
//     const a = (await dockerManagementRepo.instance());

//     const dockerOpenPort = DB.repo(DockerOpenPort);
//     (await dockerOpenPort.find().then(d => {
//         res.send(a);
//     }));
// });

// // Gives the DockerManagement Entity
// router.get("/dockerConfig_", async (req, res) => {
//     const dockerManagementRepo = DB.crepo(DockerManagementRepo)
//     await dockerManagementRepo.setUpperBoundPort(5);
//     const a = (await dockerManagementRepo.instance());
// });

// router.get("/dockerConfig_i", (req, res) => {
//     const challenge = DB.repo(DockerChallengeContainer);
//     challenge.createQueryBuilder("DockerChallengeContainer")
//         .leftJoinAndSelect("DockerChallengeContainer.image", "x")
//         .getMany().then(d => {
//             res.send(d);
//         })
// });

// router.get("/dockerConfig_createChallengeContainer", async (req, res) => {
//     const challenge = DB.repo(DockerChallengeImage);
//     let d = new DockerChallengeImage("hello", ["80/tcp"], 25);
//     await challenge.save(d);

//     let image = await dockerController.getImage("hello")

//     if (image != undefined) {
//         res.json({ statusCode: 200, data: d });

//     }
//     else {
//         res.json({ statusCode: 404, msg: "Image not found" });
//     }
// });
