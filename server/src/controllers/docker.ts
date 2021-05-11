/**
 * @auther Kiran Singh
 */
import { Request, Response, NextFunction } from 'express';
import Docker = require('dockerode');
import pump from 'pump';
var build = require('dockerode-build')
var docker = new Docker({ socketPath: '/var/run/docker.sock' });
import DB, { DockerChallengeContainer, DockerChallengeImage, DockerManagementRepo, DockerOpenPort } from '../database';
import { deserialize } from '@shared/objectFormdata';
import { uploaddir } from '@/routes/uploads';
import { unzip_, upload } from '@/files';

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
function makeImage_POST(req: Request, res: Response) {
    let data = deserialize(req);

    console.log(data);
    let ports: string[] = data.innerPorts.split(",");

    new Promise<void>(async (resolve, reject) => {
        let image = await _getImage(data.name);
        if (image == undefined) {
            // save image data to DB
            const DockerChallengeImageRepo = DB.repo(DockerChallengeImage);
            let image = new DockerChallengeImage(data.name, ports, 25);
            await DockerChallengeImageRepo.save(image);
            // upload / unzip
            let dir = `${uploaddir}/challenges/compressed/`;
            let destination = `${uploaddir}/challenges/${data.name}/`;


            upload(dir, data.file)
                .then(() => {
                    unzip_(`${dir}/${data.file.name}`, destination)
                        .then(() => {
                            _createChallengeImage({ 'dir': destination, 'name': data.name }).catch((err) => { reject(err) });
                            resolve();
                        })
                        .catch((err) => {
                            console.log(err);

                        })

                })
                .catch((err) => {
                    console.log("hello:" + err);

                });
        }
        else {
            reject("Something went wrong!")
            console.log("noke");

        }

    })
        .then(() => {
            res.json({ message: `Challenge image created successfully`, statusCode: 200 });
        })
        .catch((err) => {
            res.json({ message: err, statusCode: 404 });
        });
}

/**
 * Create isolated environment for a challenge and starts the container
 * - A team can access this to create a container for a challenge
 * @param req: [challengeImage]
 */
async function createChallengeContainer_POST(req: Request, res: Response) {
    let name: string = req.fields.challengeImage.toString();
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
    }

}

/**
 * Started container [Only those where the team have access]
 * - Req: [id]
 */
function startContainer_POST(req: Request, res: Response) {
    let id = req.fields.id.toString();
    let container = docker.getContainer(id);
    container.start((err, data) => {
        if (err == null)
            res.json({ msg: "Container started successfully", statusCode: 200 });
        else res.json({ message: err.json.message, statusCode: 404 });
    });

}
/**
 * id can be de container id OR name of the container
 */
function stopContainer_POST(req: Request, res: Response) {
    let id = req.fields.id.toString();
    let container = docker.getContainer(id);
    container.stop((err, data) => {
        if (err == null)
            res.json({ msg: "Container stopped successfully", statusCode: 200 });
        else res.json({ message: err.json.message, statusCode: 404 });
    });

}
// TODO: Make resetContainer route
/**
 *
 * Stop container
 * Remove container
 * Make new container with de base challenge image *
 */
function resetContainer_POST(req: Request, res: Response) {
    res.send("TODO");
}

async function _getImage(name: string) {
    const challenge = DB.repo(DockerChallengeImage);
    let i = await challenge.findOne({ name: name });
    return i;
}

function _createChallengeImage(jsonObj: any) {
    return new Promise<void>((resolve, reject) => {
        pump(
            build(`${__dirname}/../../../../..${jsonObj.dir}Dockerfile`, { t: jsonObj.name }),
            process.stdout,
            (err) => {
                reject(err);
            }
        )

        resolve();
    });
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

export default {
    dockerConfigPorts_GET,
    dockerConfigPorts_POST,
    containers_GET,
    makeImage_POST,
    images_GET,
    createChallengeContainer_POST,
    startContainer_POST,
    stopContainer_POST,
    resetContainer_POST,
}

