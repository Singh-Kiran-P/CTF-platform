/**
 * @author Kiran Singh
 */
import { Request, Response, NextFunction } from 'express';
import Docker = require('dockerode');
import pump from 'pump';
var build = require('dockerode-build')
var docker = new Docker({ socketPath: '/var/run/docker.sock' });
import DB, { Account, Challenge, DockerChallengeContainer, DockerManagementRepo, DockerOpenPort } from '../database';
import { deserialize } from '@shared/objectFormdata';
import { uploaddir } from '@/routes/uploads';
import { unzip, upload, Root } from '@/files';
import { resolve } from 'path';

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

// function makeImage_POST(req: Request, res: Response) {
//     let data = deserialize(req);

//     console.log(data);
//     let ports: string[] = data.innerPorts.split(",");

//     new Promise<void>(async (resolve, reject) => {
//         let image = await _getImage(data.name);
//         if (image == undefined) {
//             // save image data to DB
//             /* const DockerChallengeImageRepo = DB.repo(DockerChallengeImage);
//             let image = new DockerChallengeImage(data.name, ports, 25);
//             await DockerChallengeImageRepo.save(image);
//             // upload / unzip
//             let dir = `${uploaddir}/challenges/compressed/`;
//             let destination = `${uploaddir}/challenges/${data.name}/`; */


//             /* upload(dir, data.file)
//                 .then(() => {
//                     unzip(`${dir}/${data.file.name}`)
//                         .then(() => {
//                             _createChallengeImage({ 'dir': destination, 'name': data.name }).catch((err) => { reject(err) });
//                             resolve();
//                         })
//                         .catch((err) => {
//                             console.log(err);

//                         })

//                 })
//                 .catch((err) => {
//                     console.log("hello:" + err);

//                 }); */
//             resolve();
//         }
//         else {
//             reject("Something went wrong!")
//             console.log("noke");

//         }

//     })
//         .then(() => {
//             res.json({ message: `Challenge image created successfully`, statusCode: 200 });
//         })
//         .catch((err) => {
//             res.json({ message: err, statusCode: 404 });
//         });
// }

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
                                resolve({ message: "Container stopped + removed successfully", statusCode: 200 });
                        });
                    }
                });
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
        let userTeam = (await DB.repo(Account).findOne(userId)).team;
        let containerInfo = (await DB.repo(DockerChallengeContainer).findOne({ where: { team: userTeam } }));
        console.log(containerInfo);

        if (containerInfo == undefined) {
            //container exists
            reject({ json: "Your are not authorized to start this container!" })
        }
        else {
            let container = docker.getContainer(containerInfo.name);
            container.start((err, data) => {
                if (err == null)
                    resolve({ message: "Container started successfully", statusCode: 200 });
                else
                    reject({ message: err.reason, statusCode: 404 });
            });
        }
    })
}

/**
 * Stop container + remove
 * @param challengeId
 * @param userId
 * @returns
 */
function stopContainer(challengeId: string, userId: string) {
    return new Promise<void | object>(async (resolve, reject) => {
        let userTeam = (await DB.repo(Account).findOne(userId)).team;
        let containerInfo = (await DB.repo(DockerChallengeContainer).findOne({ where: { team: userTeam } }));
        console.log(containerInfo);

        if (containerInfo == undefined) {
            //container exists
            reject({ message: "Your are not authorized to stop this container or this container does not exists!", statusCode: 404 });
        }
        else {
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
        }
    })
}

/**
 *
 * @param challengeId
 * @param userId
 */
// TODO: make reset function
function resetContainer(challengeId: string, userId: string) {

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
    stopContainer("273", "374")
        .then(mess => res.json(mess))
        .catch(err => {
            console.log(err);
            res.json(err);
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


























/**
 * Create isolated environment for a challenge and starts the container
 * - A team can access this to create a container for a challenge
 * @param req: [challengeImage]
 */
// function createChallengeContainer_POST(req: Request, res: Response) {


/*let name: string = req.fields.challengeImage.toString();
console.log(name);

let image = await _getImage(name)
console.log(image);

if (image != undefined) {

    // get ports from image entity
    let jsonObj = { challengeImage: name, ports: image.innerPorts, containerName: req.fields.containerName.toString() };
    let configData: { portBindings: object, openPorts: number[] } = await _createPortConfig(jsonObj.ports);
    console.log(configData);

    new Promise<Object>((resolve, reject) => {
        docker.createContainer(
            {
                Image: jsonObj.challengeImage,
                name: jsonObj.containerName,
                HostConfig: {
                    PortBindings: configData.portBindings
                }
            },
            async (err, container) => {
                if (err) {
                    reject(err);
                } else {
                    const challenge = DB.repo(DockerChallengeContainer);
                    let ports: string[];

                    let d = new DockerChallengeContainer(jsonObj.containerName, configData.openPorts, jsonObj.challengeImage);
                    await challenge.save(d);
                    container.start(async (err, data) => {
                        if (err)
                            reject(err);
                        else {
                            resolve(configData.openPorts);
                        }
                    });
                }
            });
    }).then((ports) => {
        res.json({ ports: ports, message: `Challenge container created/started http://localhost:${ports}`, statusCode: 200 });
    })
        .catch((err) => {
            console.log(err.json);
            res.json({ message: err.message, statusCode: 404 });
        });

}
else {
    res.json({ message: "Image not found!", statusCode: 404 });
} */

// }

/**
 * Started container [Only those where the team have access]
 * - Req: [id]
 */
// function startContainer_POST(req: Request, res: Response) {
//     let id = req.fields.id.toString();
//     let container = docker.getContainer(id);
//     container.start((err, data) => {
//         if (err == null)
//             res.json({ msg: "Container started successfully", statusCode: 200 });
//         else res.json({ message: err.json.message, statusCode: 404 });
//     });

// }
/**
 * id can be de container id OR name of the container
 */
// function stopContainer_POST(req: Request, res: Response) {
//     let id = req.fields.id.toString();
//     let container = docker.getContainer(id);
//     container.stop((err, data) => {
//         if (err == null)
//             res.json({ msg: "Container stopped successfully", statusCode: 200 });
//         else res.json({ message: err.json.message, statusCode: 404 });
//     });

// }

/**
 *
 * Stop container
 * Remove container
 * Make new container with de base challenge image *
 */
// function resetContainer_POST(req: Request, res: Response) {
//     res.send("TODO");
// }

// async function _getImage(name: string) {
//     /* const challenge = DB.repo(DockerChallengeImage);
//     let i = await challenge.findOne({ name: name });
//     return i; */
//     return 0; //
// }

export default {
    dockerConfigPorts_GET,
    dockerConfigPorts_POST,
    containers_GET,
    // makeImage_POST,
    images_GET,
    // createChallengeContainer_POST,
    // startContainer_POST,
    // stopContainer_POST,
    // resetContainer_POST,
    makeImage,
    deleteImage,
    test
}

