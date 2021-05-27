/**
 * @author Kiran Singh
 */
import { Request, Response } from 'express';
import Docker = require('dockerode');
import pump from 'pump';
import DB, { Account, Challenge, DockerChallengeContainer, DockerManagementRepo, DockerOpenPort } from '../database';
import { Root } from '@/files';
let build = require('dockerode-build')
let docker = new Docker({ socketPath: '/var/run/docker.sock' });

/**
 * This class handles the logic/contection with docker
 */
export class DockerController {
    constructor() {
        this.containers_GET = this.containers_GET.bind(this);
        this.dockerConfigPorts_GET = this.dockerConfigPorts_GET.bind(this);
        this.dockerConfigPorts_POST = this.dockerConfigPorts_POST.bind(this);
        this.images_GET = this.images_GET.bind(this);
        this.test = this.test.bind(this);
        this._createPortConfig = this._createPortConfig.bind(this);
        this._giveRandomPort = this._giveRandomPort.bind(this);
        this._randomIntFromInterval = this._randomIntFromInterval.bind(this);
        this.createChallengeContainer = this.createChallengeContainer.bind(this);
        this.deleteImage = this.deleteImage.bind(this);
        this.makeImage = this.makeImage.bind(this);
        this.removeContainerById = this.removeContainerById.bind(this);
        this.resetContainer = this.resetContainer.bind(this);
        this.startContainer = this.startContainer.bind(this);
        this.startContainerById = this.startContainerById.bind(this);
        this.stopContainer = this.stopContainer.bind(this);
        this.stopContainerById = this.stopContainerById.bind(this);
    }

    /**
     * For testing functions
     * @param req route request object
     * @param res route response object
     * @category Routes
     */
    public test(req: Request, res: Response) {
        // this.createChallengeContainer("273", "374")
        //     .then(mess => res.json(mess))
        //     .catch(err => {
        //         res.json(err);
        //     })
        // this.startContainer("273", "374")
        //     .then(mess => res.json(mess))
        //     .catch(err => {
        //         console.log(err);
        //         res.json(err);
        //     })
        // this.stopContainer("273", "374")
        //     .then(mess => res.json(mess))
        //     .catch(err => {
        //         console.log(err);
        //         res.json(err);
        //     })
        // this.resetContainer("273", "374")
        //     .then(mess => res.json(mess))
        //     .catch(err => {
        //         console.log(err);
        //         res.json(err);
        //     })
    }

    /**
     * Get docker ports config
     * @param req route request object
     * @param res route response object
     * @category Routes
     */
    public async dockerConfigPorts_GET(req: Request, res: Response) {
        const dockerManagementRepo = DB.crepo(DockerManagementRepo)
        const data = (await dockerManagementRepo.instance());
        res.json(data);
    }

    /**
     * Update docker ports config
     * @param req { lowerBound: int, upperBound: int}
     * @param res route response object
     * @category Routes
     */
    public async dockerConfigPorts_POST(req: Request, res: Response) {
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

    /**
     * Get all docker containers information
     * @param req route request object
     * @param res route response object
     * @category Routes
    */
    public containers_GET(req: Request, res: Response) {
        docker.listContainers((err, containers) => {
            console.log(err);
            console.log(containers);
            res.json(containers);
        });
    }

    /**
     * Get all docker images information
     * @param req route request object
     * @param res route response object
     * @category Routes
     */
    public images_GET(req: Request, res: Response) {
        docker.listImages((err, images) => {
            res.json(images);
        });
    }

    /**
     * Make docker challenge image
     * @param dockerFileDes location of the docker file
     * @param dockerChallengeName challenge name = docker image name
     */
    public makeImage(dockerFileDes: string, dockerChallengeName: string) {
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
    public deleteImage(imageId: string) {
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
     * @returns {Promise<void | object>} A promise that contains object {message:string, statusCode:int}
     */
    public createChallengeContainer(challengeId: string, userId: string) {
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


                    let configData: { portBindings: object, openPorts: number[] } = await this._createPortConfig(ports);
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
     * Start docker container for the team
     * @param challengeId
     * @param userId
     * @returns {Promise<void | object>} A promise that contains object {message:string, statusCode:int}
     */
    public startContainer(challengeId: string, userId: string) {
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
     * This will stop the docker container and then remove it
     * @param challengeId
     * @param userId
     * @returns {Promise<void | object>} A promise that contains object {message:string, statusCode:int}
     */
    public stopContainer(challengeId: string, userId: string) {
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
     * To reset a docker container we have to do the following
     *          1) stop/remove the container
     *          2) create a new container
     * @param challengeId
     * @param userId
     * @returns {Promise<void | object>} A promise that contains object {message:string, statusCode:int}
     */
    public resetContainer(challengeId: string, userId: string) {
        return new Promise<void | object>((resolve, reject) => {
            this.stopContainer(challengeId, userId)
                .then((data) => {
                    this.createChallengeContainer(challengeId, userId)
                        .then(data => resolve(data))
                        .catch(err => reject(err))
                })
                .catch(err => reject(err))
        })
    }

    /**
     * Start a docker container by his id or name
     * @param containerId container id
     * @returns {Promise<void | object>} A promise that contains object {message:string, statusCode:int}
     */
    public startContainerById(containerId: string) {
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

    /**
  * Stop a docker container by his id or name
  * @param containerId container id
  * @returns {Promise<void | object>} A promise that contains object {message:string, statusCode:int}
  */
    public stopContainerById(containerId: string) {
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

    /**
  * Remove a docker container by his id or name
  * @param containerId container id
  * @returns {Promise<void | object>} A promise that contains object {message:string, statusCode:int}
  */
    public removeContainerById(containerId: string) {
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

    /**
     * Create the port config for a container
     * @param ports array of ports like ["80/tcp","8080/utp"]
     * @returns {Promise<any>} A promise that contains the ports information
     */
    private async _createPortConfig(ports: string[]) {

        let openPorts: Array<Number> = [];
        let portBindings: { [port: string]: { HostPort: string }[] } = {};
        for (let i = 0; i < ports.length; i++) {
            let p = await this._giveRandomPort();
            openPorts.push(p)
            portBindings[ports[i]] = [{ HostPort: p.toString() }];
        }
        return new Promise<any>((resolve) => {
            resolve({ openPorts: openPorts, portBindings: portBindings });
        })
    }

    /**
     * This give you a port that is available to use and in the port range
     * @returns {Promise<number>} A promise that contains the port that can be used
     */
    private _giveRandomPort() {
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
                    let port_: number = this._randomIntFromInterval(lowerBoundPort, upperBoundPort);
                    const portIsOpen = d.find((item) => { return item.openPorts == port_ });

                    if (portIsOpen == undefined) {
                        const dockerOpenPort = DB.repo(DockerOpenPort);
                        dockerOpenPort.save(new DockerOpenPort(port_));
                        resolve(port_)
                    }
                });
        });
    }

    private _randomIntFromInterval(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}
