/**
 * @author Kiran Singh
 */
import { Request, Response } from 'express';
import Docker = require('dockerode');
import pump from 'pump';
var build = require('dockerode-build')
var docker = new Docker({ socketPath: '/var/run/docker.sock' });
import DB, { Account, Challenge, DockerChallengeContainer, DockerManagementRepo, DockerOpenPort } from '../database';
import { Root } from '@/files';

async function dockerConfigPorts_GET(req: Request, res: Response) {
    const dockerManagementRepo = DB.crepo(DockerManagementRepo)
    const data = (await dockerManagementRepo.instance());
    res.json(data);
}
async function dockerConfigPorts_POST(req: Request, res: Response) {
    if (req.fields.upperBoundPort != undefined && req.fields.lowerBoundPort != undefined) {
        let upperBoundPort = Number.parseInt(req.fields.upperBoundPort.toString());
        let lowerBoundPort = Number.parseInt(req.fields.lowerBoundPort.toString());

        const dockerManagementRepo = DB.crepo(DockerManagementRepo)
        dockerManagementRepo.setLowerBoundPort(lowerBoundPort);
        dockerManagementRepo.setUpperBoundPort(upperBoundPort)

        res.json({ message: "Ports range updated to [ " + lowerBoundPort + " - " + upperBoundPort + " ]", statusCode: 200 });
    }
    else {
        res.json({ message: "Error parsing json!", statusCode: 404 });

    }
}

function containers_GET(req: Request, res: Response) {
    docker.listContainers((err, containers) => {
        console.log(err);
        console.log(containers);
        res.json(containers);
    });
}

function images_GET(req: Request, res: Response) {
    docker.listImages((err, images) => {
        res.json(images);
    });
}

/**
 * Make challenge image
 * @param dockerFileDes location of the docker file
 *
 */
function makeImage(dockerFileDes: string, dockerChallengeName: string) {
    return new Promise<string>((resolve, reject) => {
        pump(
            build(`${Root}${dockerFileDes}/Dockerfile`, { t: dockerChallengeName })
                .on("complete", (id: any) => {
                    // console.log("klaar:" + id);
                    resolve(id);
                }),
            process.stdout,
            (err) => {
                reject(err)
            }
        )
    })
}

/**
 * Remove image from docker
 * @param imageId: string
 */
function deleteImage(imageId: string) {
    return new Promise<void>((resolve, reject) => {
        if (!imageId) return resolve();
        docker.getImage(imageId)
            .remove({ force: { true: 'true' } }, (err, res) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
    })
}

/**
 * Get challenge info for DB and get the challenge image Id
 * Get the team of the user
 * Image name -> challengeName-teamName
 * @param challengeId
 * @param userId
 */
function createChallengeContainer(challengeId: string, userId: string) {
    return new Promise<void | object>(async (resolve, reject) => {
        let challenge = await DB.repo(Challenge).findOne(challengeId);
        let ports = challenge.innerPorts.split(",");
        let team = (await DB.repo(Account).findOne(userId)).team;
        if (team != undefined) {
            let containerName = challenge.id + "-" + team.id;

            let containerExists = (await DB.repo(DockerChallengeContainer).findOne({ where: { name: containerName } }));
            if (containerExists != undefined) {
                //container exists
                reject({ message: "Your team already created a container for this challenge!", statusCode: 404 });

            }
            else {


                let configData: { portBindings: object, openPorts: number[] } = await _createPortConfig(ports);
                console.log(configData.portBindings);
                docker.createContainer(
                    {
                        Image: challenge.dockerImageId,
                        name: containerName,
                        HostConfig: {
                            PortBindings: configData.portBindings
                        }
                    },
                    async (err, container) => {
                        if (err) {
                            reject(err);
                        } else {
                            const dockerChallengeContainerRepo = DB.repo(DockerChallengeContainer);
                            let containerData = new DockerChallengeContainer(containerName, configData.openPorts, team, challenge);
                            await dockerChallengeContainerRepo.save(containerData);
                            container.start(async (err, data) => {
                                if (err)
                                    reject({ message: err.json, statusCode: 404 });
                                else
                                    resolve({ message: "Container started successfully", statusCode: 200 });
                            });
                        }
                    });
            }
        }

    })

}

/**
 * Start container for the team
 * @param challengeId
 * @param userId
 * @returns
 */
function startContainer(challengeId: string, userId: string) {
    return new Promise<void | object>(async (resolve, reject) => {
        let userTeam;
        let containerInfo: DockerChallengeContainer;
        DB.repo(Account).findOne(userId)
            .then(async (data) => {
                userTeam = data.team;
                DB.repo(DockerChallengeContainer).findOne({ where: { team: userTeam } })
                    .then((containerInfo) => {
                        let container = docker.getContainer(containerInfo.name);
                        container.start((err, data) => {
                            if (err == null) {
                                container.remove(async (err, data) => {
                                    if (err == null) {
                                        await DB.repo(DockerChallengeContainer).remove(containerInfo);
                                        resolve({ message: "Container started successfully", statusCode: 200 });
                                    }
                                    else
                                        reject({ message: err.json, statusCode: 404 });
                                });
                            }
                            else
                                reject({ message: err.json, statusCode: 404 });
                        });
                    })
                    .catch(err => reject({ message: "Your are not authorized to stop this container or this container does not exists!", statusCode: 404 }));
                console.log(containerInfo);
            })
            .catch(err => reject({ message: "No team found!", statusCode: 404 }));
    });

}

/**
 * Stop container + remove
 * @param challengeId
 * @param userId
 * @returns
 */
function stopContainer(challengeId: string, userId: string) {
    return new Promise<void | object>(async (resolve, reject) => {
        let userTeam;
        let containerInfo: DockerChallengeContainer;
        DB.repo(Account).findOne(userId)
            .then(async (data) => {
                userTeam = data.team;
                DB.repo(DockerChallengeContainer).findOne({ where: { team: userTeam } })
                    .then((containerInfo) => {
                        let container = docker.getContainer(containerInfo.name);
                        container.stop((err, data) => {
                            if (err == null) {
                                container.remove(async (err, data) => {
                                    if (err == null) {
                                        await DB.repo(DockerChallengeContainer).remove(containerInfo);
                                        resolve({ message: "Container stopped + removed successfully", statusCode: 200 });
                                    }
                                    else
                                        reject({ message: err.json, statusCode: 404 });
                                });
                            }
                            else
                                reject({ message: err.json, statusCode: 404 });
                        });
                    })
                    .catch(err => reject({ message: "Your are not authorized to stop this container or this container does not exists!", statusCode: 404 }));
                console.log(containerInfo);
            })
            .catch(err => reject({ message: "No team found!", statusCode: 404 }));
    })
}

/**
 * 1) stop/remove the container
 * 2) create a new container
 * @param challengeId
 * @param userId
 */
function resetContainer(challengeId: string, userId: string) {
    return new Promise<void | object>((resolve, reject) => {
        stopContainer(challengeId, userId)
            .then((data) => {
                createChallengeContainer(challengeId, userId)
                    .then(data => resolve(data))
                    .catch(err => reject(err))
            })
            .catch(err => reject(err))
    })
}

function startContainerById(containerId: string) {
    return new Promise<void | object>((resolve, reject) => {
        let container = docker.getContainer(containerId);
        container.start((err, data) => {
            if (err == null) {
                resolve({ message: "Container started successfully", statusCode: 200 });
            }
            else
                reject({ message: err.json, statusCode: 404 });
        });
    })
}

function stopContainerById(containerId: string) {
    return new Promise<void | object>((resolve, reject) => {
        let container = docker.getContainer(containerId);
        container.stop((err, data) => {
            if (err == null) {
                resolve({ message: "Container stopped successfully", statusCode: 200 });
            }
            else
                reject({ message: err.json, statusCode: 404 });
        });
    })
}
function removeContainerById(containerId: string) {
    return new Promise<void | object>((resolve, reject) => {
        let container = docker.getContainer(containerId);
        container.remove((err, data) => {
            if (err == null) {
                resolve({ message: "Container removed successfully", statusCode: 200 });
            }
            else
                reject({ message: err.json, statusCode: 404 });
        });
    })
}

async function _createPortConfig(ports: string[]) {

    let openPorts: Array<Number> = [];
    let portBindings: { [port: string]: { HostPort: string }[] } = {};
    for (let i = 0; i < ports.length; i++) {
        let p = await _giveRandomPort();
        openPorts.push(p)
        portBindings[ports[i]] = [{ HostPort: p.toString() }];
    }
    return new Promise<any>((resolve) => {
        resolve({ openPorts: openPorts, portBindings: portBindings });
    })
}

function _giveRandomPort() {
    return new Promise<number>((resolve) => {

        const dockerManagementRepo = DB.crepo(DockerManagementRepo);
        let lowerBoundPort: number;
        let upperBoundPort: number;

        dockerManagementRepo
            .instance()
            .then(data => {
                lowerBoundPort = data.lowerBoundPort;
                upperBoundPort = data.upperBoundPort;
            })
            .then(() => {
                let flag: boolean = true
                let port: number;

                const dockerOpenPort = DB.repo(DockerOpenPort);
                return dockerOpenPort.find();

            })
            .then((d) => {
                let port_: number = _randomIntFromInterval(lowerBoundPort, upperBoundPort);
                const portIsOpen = d.find((item) => { return item.openPorts == port_ });

                if (portIsOpen == undefined) {
                    const dockerOpenPort = DB.repo(DockerOpenPort);
                    dockerOpenPort.save(new DockerOpenPort(port_));
                    resolve(port_)
                }
            });
    });
}

function _randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function test(req: Request, res: Response) {
    // createChallengeContainer("273", "374")
    //     .then(mess => res.json(mess))
    //     .catch(err => {
    //         res.json(err);
    //     })
    // startContainer("273", "374")
    //     .then(mess => res.json(mess))
    //     .catch(err => {
    //         console.log(err);
    //         res.json(err);
    //     })
    // stopContainer("273", "374")
    //     .then(mess => res.json(mess))
    //     .catch(err => {
    //         console.log(err);
    //         res.json(err);
    //     })
    // resetContainer("273", "374")
    //     .then(mess => res.json(mess))
    //     .catch(err => {
    //         console.log(err);
    //         res.json(err);
    //     })
}


export default {
    dockerConfigPorts_GET,
    dockerConfigPorts_POST,
    containers_GET,
    images_GET,
    makeImage,
    deleteImage,
    startContainer,
    startContainerById,
    stopContainer,
    stopContainerById,
    resetContainer,
    removeContainerById,
    test
}

