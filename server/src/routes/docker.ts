/**
 * @auther Kiran Singh
 * All routes in this file are protected!
 * Only admins can access them
 */
import { isAdmin, isAuth } from "@/auth";
import express from "express";
import { DockerController } from "../controllers/docker";
let controller = new DockerController();

const router = express.Router();

router.get("/dockerConfigPorts", isAdmin, controller.dockerConfigPorts_GET)

router.post("/dockerConfigPorts", isAdmin, controller.dockerConfigPorts_POST)

router.get("/containers", isAdmin, controller.containers_GET);

router.get("/images", isAdmin, controller.images_GET);

router.get("/createChallengeContainer/:challengeId", isAuth, controller.createChallengeContainer_GET);

router.get("/challengeContainerRunning/:challengeId", isAuth, controller.challengeContainerRunning_GET);

router.get("/startChallengeContainer/:challengeId", isAuth, controller.startChallengeContainer_GET);

router.get("/stopChallengeContainer/:challengeId", isAuth, controller.stopChallengeContainer_GET);

router.get("/resetChallengeContainer/:challengeId", isAuth, controller.resetChallengeContainer_GET);

// router.post("/makeImage", isAdmin, controller.makeImage_POST);

// router.post("/createChallengeContainer", isAuth, controller.createChallengeContainer_POST);

// router.post("/startContainer", isAuth, controller.startContainer_POST);

// router.post("/stopContainer", isAuth, controller.stopContainer_POST);

// router.post("/resetContainer", isAuth, controller.resetContainer_POST);

export default { path: "/docker", router };

