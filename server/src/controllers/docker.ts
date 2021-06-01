/**
 * @author Kiran Singh
 */
import { Request, Response } from 'express';
import Docker = require('dockerode');
import pump from 'pump';
import DB, { Challenge, DockerChallengeContainer, DockerManagementRepo, DockerOpenPort, Team } from '../database';
import { Root } from '@/files';
import fs from 'fs';
import { getAccount } from '@/auth';

let build = require('dockerode-build')
let docker = new Docker({ socketPath: '/var/run/docker.sock' });

/**
 * This class handles the logic/contection with docker
 */
export class DockerController {
    adminTeamId = "admin";

    constructor() {
        this.containers_GET = this.containers_GET.bind(this);
        this.dockerConfigPorts_GET = this.dockerConfigPorts_GET.bind(this);
        this.dockerConfigPorts_POST = this.dockerConfigPorts_POST.bind(this);
        this.images_GET = this.images_GET.bind(this);

        this.createChallengeContainer_GET = this.createChallengeContainer_GET.bind(this);
        this.challengeContainerRunning_GET = this.challengeContainerRunning_GET.bind(this);
        this.startChallengeContainer_GET = this.startChallengeContainer_GET.bind(this);
        this.stopChallengeContainer_GET = this.stopChallengeContainer_GET.bind(this);
        this.resetChallengeContainer_GET = this.resetChallengeContainer_GET.bind(this);
        this.deleteImage_POST = this.deleteImage_POST.bind(this)
        this.deleteContainer_POST = this.deleteContainer_POST.bind(this)

        this._createPortConfig = this._createPortConfig.bind(this);
        this._giveRandomPort = this._giveRandomPort.bind(this);
        this._randomIntFromInterval = this._randomIntFromInterval.bind(this);
        this.createChallengeContainer = this.createChallengeContainer.bind(this);
        this.deleteImage = this.deleteImage.bind(this);
        this.makeImage = this.makeImage.bind(this);
        this.resetContainer = this.resetContainer.bind(this);
        this.startContainer = this.startContainer.bind(this);
        this.stopContainer = this.stopContainer.bind(this);

        this.startContainerById = this.startContainerById.bind(this);
        this.stopContainerById = this.stopContainerById.bind(this);
        this.removeContainerById = this.removeContainerById.bind(this);
    }
    //---------------------------------------------------------- Routes ----------------------------------------------------------

    /**
     * Delete image
     * @param req route request object
     * @param res route response object
     * @category Routes
     */
    public deleteImage_POST(req: Request, res: Response) {
        let name = req.fields.name.toString()
        this.deleteImage(name)
            .then(() => res.json({ message: "Image successfully deleted", statusCode: 200 }))
            .catch((err) => res.json(err));
    }

    /**
     * Delete container
     * @param req route request object
     * @param res route response object
     * @category Routes
     */
    public deleteContainer_POST(req: Request, res: Response) {
        let name = req.fields.name.toString()
        console.log(name);
        this.stopContainerById(name)
            .then(() => {
                this.removeContainerById(name)
                    .then((d) => res.json(d))
                    .catch((err) => res.json(err));
            })
            .catch((err) => res.json(err));

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
     * Save used port into db
     * @param req { ports: string} like "8080,900,468,5965,..."
     * @param res route response object
     * @category Routes
     */
    public saveUsedPorts_POST(req: Request, res: Response) {
        let ports = req.fields.ports.toString().split(",").map(p => Number.parseInt(p.trim())).filter(p => p && !isNaN(p));
        console.log(ports);

        const dockerOpenPortRepo = DB.repo(DockerOpenPort);
        Promise.all(ports.map(p => dockerOpenPortRepo.save(new DockerOpenPort(p))))
            .then(() => res.json({ message: "Ports successfully saved!", statusCode: 200 }))
            .catch((err) => res.json({ message: "Error saving ports!", statusCode: 404 }));
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
     * Route for creating challenge container
     * @param req route request object with {challengeId: number, teamId:number}
     * @param res route response object
     * @category Routes
     */
    public createChallengeContainer_GET(req: Request, res: Response) {
        let challengeId = req.params.challengeId;
        let isAdmin = getAccount(req).admin;
        let teamId = isAdmin ? '' : getAccount(req).team.id;

        this.createChallengeContainer(challengeId, teamId, isAdmin)
            .then(mess => res.json(mess))
            .catch(err => {
                res.json(err);
            })
    }

    /**
     * Route for getting the state of a challenge container of a team
     * @param req route request object with {challengeId: number, teamId:number}
     * @param res route response object
     * @category Routes
     */
    public challengeContainerRunning_GET(req: Request, res: Response) {
        let challengeId = req.params.challengeId;
        let isAdmin = getAccount(req).admin;
        let teamId = isAdmin ? '' : getAccount(req).team.id;

        this.challengeContainerRunning(challengeId, teamId, isAdmin)
            .then(mess => res.json(mess))
            .catch(err => {
                res.json(err);
            })
    }

    /**
     * Route for starting challenge container
     * @param req route request object with {challengeId: number, teamId:number}
     * @param res route response object
     * @category Routes
     */
    public startChallengeContainer_GET(req: Request, res: Response) {
        let challengeId = req.params.challengeId;
        let isAdmin = getAccount(req).admin;
        let teamId = isAdmin ? '' : getAccount(req).team.id;

        this.startContainer(challengeId, teamId, isAdmin)
            .then(mess => res.json(mess))
            .catch(err => {
                res.json(err);
            })
    }

    /**
     * Route for stopping challenge container
     * @param req route request object with {challengeId: number, teamId:number}
     * @param res route response object
     * @category Routes
     */
    public stopChallengeContainer_GET(req: Request, res: Response) {
        let challengeId = req.params.challengeId;
        let isAdmin = getAccount(req).admin;
        let teamId = isAdmin ? '' : getAccount(req).team.id;

        this.stopContainer(challengeId, teamId, isAdmin)
            .then(mess => res.json(mess))
            .catch(err => {
                res.json(err);
            })
    }

    /**
     * Route for resetting challenge container
     * @param req route request object with {challengeId: number, teamId:number}
     * @param res route response object
     * @category Routes
     */
    public resetChallengeContainer_GET(req: Request, res: Response) {
        let challengeId = req.params.challengeId;
        let isAdmin = getAccount(req).admin;
        let teamId = isAdmin ? '' : getAccount(req).team.id;

        this.resetContainer(challengeId, teamId, isAdmin)
            .then(mess => res.json(mess))
            .catch(err => {
                res.json(err);
            })
    }


    //---------------------------------------------------------- Functions ----------------------------------------------------------

    /**
     * Get challenge info for DB and get the challenge image Id
     * Get the team of the user
     * Image name -> challengeName-teamName
     * @param challengeId
     * @param userId
     * @param isAdmin To check if a admin is calling this function
     * @returns {Promise<object>} A promise that contains object {message:string, ports: [], statusCode:int}
     */
    private createChallengeContainer(challengeId: string, teamId: string, isAdmin: boolean) {
        return new Promise<object>(async (resolve, reject) => {

            let challenge = await DB.repo(Challenge).findOne(challengeId);
            if (!challenge) return reject({ message: 'Could not load challenge', statusCode: 404 });
            let ports = challenge.innerPorts.split(",").map(p => p.trim());

            const create = (team: Team) => {
                let containerName = challenge.id + "-" + (team ? team.id : this.adminTeamId);
                DB.repo(DockerChallengeContainer).findOne({ where: { name: containerName, team: team } })
                    .then(async (data) => {
                        if (data) return reject({ message: "Your team already created a container for this challenge!", statusCode: 404 });
                        let configData: { portBindings: object, openPorts: number[] } = await this._createPortConfig(ports);
                        docker.createContainer({
                            Image: challenge.dockerImageId,
                            name: containerName,
                            HostConfig: {
                                PortBindings: configData.portBindings
                            }
                        }, async (err, container) => {
                            if (err) return reject(err);
                            const dockerChallengeContainerRepo = DB.repo(DockerChallengeContainer);
                            let containerData = new DockerChallengeContainer(containerName, configData.openPorts, team, challenge);
                            await dockerChallengeContainerRepo.save(containerData);
                            container.start((err, data) => {
                                if (err) return reject({ message: err.json, statusCode: 404 });

                                docker.getContainer(container.id)
                                    .inspect()
                                    .then((containerInfo) => {
                                        if (containerInfo.State.Running) {
                                            resolve(
                                                {
                                                    message: "Container started successfully",
                                                    ports: containerInfo.NetworkSettings.Ports,
                                                    statusCode: 200
                                                }
                                            )
                                        }
                                        else {
                                            return reject({ message: "Container is not running!", statusCode: 404 })
                                        }
                                    })
                                    .catch(() => {
                                        reject({ message: "Error finding container", statusCode: 404 })
                                    })
                            });
                        });
                    });
            }

            if (isAdmin) create(null);
            else {
                DB.repo(Team).findOne(teamId)
                    .then(team => {
                        if (!team) return reject({ message: 'Team does not exist', statusCode: 404 });
                        create(team);
                    })
                    .catch((err) => reject({ message: err.message, statusCode: 404 }))
            }
        });
    }

    /**
     * Checks if a challenge container is running
     * @param challengeId Check if a container is running
     * @param teamId team id
     * @param isAdmin To check if a admin is calling this function
     * @returns {Promise<object>} A promise that contains object { state: false, error: "not running", message: "not running", statusCode: 404 }
     */
    private challengeContainerRunning(challengeId: string, teamId: string, isAdmin: boolean) {
        return new Promise<object>(async (resolve, reject) => {
            let challenge = await DB.repo(Challenge).findOne(challengeId);
            if (!challenge) return reject({ message: 'Could not load challenge', statusCode: 404 });
            let running = (team: Team) => {

                let containerName = challenge.id + "-" + (team ? team.id : this.adminTeamId);

                DB.repo(DockerChallengeContainer).findOne({ where: { name: containerName, team: team } })
                    .then((data) => {
                        if (data != undefined) {
                            //check if container is running
                            docker.getContainer(data.name)
                                .inspect()
                                .then(containerInfo => {
                                    if (containerInfo.State.Running)
                                        resolve({
                                            state: true,
                                            message: "running",
                                            ports: containerInfo.NetworkSettings.Ports,
                                            statusCode: 200
                                        })
                                    else
                                        reject({ state: false, error: "not running", message: "not running", statusCode: 200 });

                                })
                                .catch((err) => reject({ message: err, statusCode: 404 }));
                        }
                        else
                            reject({ state: false, error: "not running", message: "not running", statusCode: 200 })
                    })
            }

            if (isAdmin) running(null);
            else {
                DB.repo(Team).findOne(teamId)
                    .then((team) => {
                        if (!team) return reject({ state: false, error: "not running", message: "not running", statusCode: 200 });
                        else running(team);
                    })
                    .catch((err) => reject({ message: err.message, statusCode: 404 }))
            }
        })
    }

    /**
     * Start docker container for the team
     * @param challengeId
     * @param userId
     * @param isAdmin To check if a admin is calling this function
     * @returns {Promise<object>} A promise that contains object {message:string, statusCode:int}
     */
    private startContainer(challengeId: string, teamId: string, isAdmin: boolean) {
        return new Promise<object>(async (resolve, reject) => {
            const start = (team: Team) => {
                DB.repo(DockerChallengeContainer).findOne({ where: { challenge: challengeId, team: team } })
                    .then((containerInfo) => {
                        if (containerInfo == undefined)
                            return reject({ message: "Your are not authorized to stop this container or this container does not exists!", statusCode: 404 })

                        let container = docker.getContainer(containerInfo.name);

                        this.challengeContainerRunning(challengeId, teamId, isAdmin)
                            .then((data) => resolve({ message: "Container is already running", statusCode: 404 }))
                            .catch(() => {
                                container.start((err, data) => {
                                    if (err == null) {
                                        resolve({ message: "Container started successfully", statusCode: 200 });
                                    }
                                    else
                                        reject({ message: err.json, statusCode: 404 });
                                });
                            });
                    })
            }

            if (isAdmin) start(null);
            else {
                DB.repo(Team).findOne(teamId)
                    .then((team) => {
                        if (!team) return reject({ message: "No team found!", statusCode: 404 })
                        else start(team);
                    })
                    .catch(err => reject({ message: "No team found!", statusCode: 404 }));
            }
        });
    }

    /**
     * This will stop the docker container and then remove it
     * @param challengeId
     * @param userId
     * @param isAdmin To check if a admin is calling this function
     * @returns {Promise<void | object>} A promise that contains object {message:string, statusCode:int}
     */
    public stopContainer(challengeId: string, teamId: string, isAdmin: boolean) {
        return new Promise<object>(async (resolve, reject) => {
            let stop = (team: Team) => {
                DB.repo(DockerChallengeContainer).findOne({ where: { challenge: challengeId, team: team } })
                    .then((containerInfo) => {
                        if (containerInfo == undefined)
                            return reject({ message: "Your are not authorized to stop this container or this container does not exists!", statusCode: 404 })

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
            }

            if (isAdmin) stop(null);
            else {
                DB.repo(Team).findOne(teamId)
                    .then((team) => {
                        if (!team) return reject({ message: "No team found!", statusCode: 404 });
                        else stop(team);
                    })
                    .catch(err => reject({ message: "No team found!", statusCode: 404 }));
            }
        });
    }
    /**
     * To reset a docker container we have to do the following
     *          1) stop/remove the container
     *          2) create a new container
     * This will generate new ports config
     * @param challengeId
     * @param userId
     * @param isAdmin To check if a admin is calling this function
     * @returns {Promise< object>} A promise that contains object {message:string, statusCode:int}
     */
    private resetContainer(challengeId: string, teamId: string, isAdmin: boolean) {
        return new Promise<object>((resolve, reject) => {
            this.stopContainer(challengeId, teamId, isAdmin)
                .then((data) => {
                    this.createChallengeContainer(challengeId, teamId, isAdmin)
                        .then(data => resolve(data))
                        .catch(err => reject(err))
                })
                .catch(err => reject(err))
        })
    }

    /**
     * Make docker challenge image
     * @param dockerFileDes location of the docker file
     * @param dockerChallengeName challenge name = docker image name
     * @returns {Promise<string>} A promise that contains object the id of the image
     */
    public makeImage(dockerFileDes: string, dockerChallengeName: string) {
        return new Promise<string>((resolve, reject) => {
            let path = `${Root}${dockerFileDes}/Dockerfile`;
            // check if file exists
            if (fs.existsSync(path) == false) {
                return reject({ error: "Dockerfile not found in your .zip!", message: "Dockerfile not found in your .zip!", statusCode: 404 });
            } else {
                pump(
                    build(path, { t: dockerChallengeName })
                        .on("complete", (id: any) => {
                            // console.log(id);
                            return resolve(id);
                        }),
                    process.stdout,
                    err => reject({ error: err, message: err, statusCode: 404 })
                )
            }
        });
    }

    /**
     * Remove image from docker
     * @param imageId: string
     * @returns {Promise<string>} A promise that contains object the id of the image
     */
    public deleteImage(imageId: string) {
        return new Promise<void>((resolve, reject) => {
            if (!imageId) return resolve();
            docker.getImage(imageId)
                .get().catch(err => reject(err))

            docker.getImage(imageId)
                .remove({ force: { true: 'true' } }, (err, res) => {
                    if (err) {
                        console.log({ error: err, message: err, statusCode: 404 });

                        return reject({ error: "Can not delete image", message: err.json.message, statusCode: 404 });
                    }
                    console.log(res);

                    resolve();
                })
        })
    }


    /**
     * Start a docker container by his id or name
     * @param containerId container id
     * @returns {Promise<void | object>} A promise that contains object {message:string, statusCode:int}
     */
    private startContainerById(containerId: string) {
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
    private stopContainerById(containerId: string) {
        return new Promise<void | object>((resolve, reject) => {
            let container = docker.getContainer(containerId);
            container.stop((err, data) => {
                if (err == null) {
                    resolve({ message: "Container stopped successfully", statusCode: 200 });
                }
                else
                    reject({ error: err.json.message,message: err.json.message, statusCode: 404 });
            });
        })
    }

    /**
  * Remove a docker container by his id or name
  * @param containerId container id
  * @returns {Promise<void | object>} A promise that contains object {message:string, statusCode:int}
  */
    private removeContainerById(containerId: string) {
        return new Promise<void | object>((resolve, reject) => {
            let container = docker.getContainer(containerId);
            container.remove((err, data) => {
                if (err == null) {
                    resolve({ message: "Container removed successfully", statusCode: 200 });
                }
                else
                    reject({ error: err.json.message, message: err.json.message, statusCode: 404 });
            });
        })
    }

    /**
     * Create the port config for a container
     * @param ports array of ports like ["80/tcp","8080/utp"]
     * @returns {Promise<any>} A promise that contains the ports information
     */
    private async _createPortConfig(ports: string[]) {
        return new Promise<any>(async (resolve, reject) => {
            let openPorts: Array<Number> = [];
            let portBindings: { [port: string]: { HostPort: string }[] } = {};
            for (let i = 0; i < ports.length; i++) {
                let p = await this._giveRandomPort();
                if (!p || p < 0) return reject();
                openPorts.push(p);
                portBindings[ports[i]] = [{ HostPort: p.toString() }];
            }
            resolve({ openPorts: openPorts, portBindings: portBindings });
        });
    }

    /**
     * This give you a port that is available to use and in the port range that the admin predefined
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
                    const dockerOpenPort = DB.repo(DockerOpenPort);
                    return dockerOpenPort.find();
                })
                .then((d) => {
                    let attempts = upperBoundPort - lowerBoundPort;
                    while (--attempts > 0) {
                        let port_: number = this._randomIntFromInterval(lowerBoundPort, upperBoundPort);
                        const portExists = d.find((item) => item.openPorts == port_);
                        if (!portExists) {
                            const dockerOpenPort = DB.repo(DockerOpenPort);
                            dockerOpenPort.save(new DockerOpenPort(port_)).then(() => resolve(port_)).catch(() => resolve(-1));
                            attempts = -1;
                            break;
                        }
                    }
                    if (attempts == 0)
                        resolve(-1);
                });
        });
    }

    private _randomIntFromInterval(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}
