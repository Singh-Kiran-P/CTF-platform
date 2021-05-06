import { Request, Response, NextFunction } from 'express';
import Docker = require('dockerode');
import pump from 'pump';
import { rejects } from 'node:assert';
import { resolve } from 'node:path';
var build = require('dockerode-build')
var docker = new Docker({ socketPath: '/var/run/docker.sock' });
import DB, { DockerChallengeContainer, DockerChallengeImage, DockerManagementRepo, DockerOpenPort } from '../database';
import { deserialize } from '@shared/objectFormdata';
import { uploaddir } from '@/routes/uploads';
import { unzip_, upload } from '@/files';

function getAllRunningContainers() {
    let data: any = [];
    docker.listContainers(function (err, containers) {
        containers.forEach(function (containerInfo) {
            data.push([containerInfo]);
        });
    });
    return data;
}


async function getImage(name: string) {
    const challenge = DB.repo(DockerChallengeImage);
    let i = await challenge.findOne({ name: name });
    return i;
}

function makeImage(data: any) {
    console.log(data);
    let ports: string[] = data.innerPorts.split(",");


    return new Promise<void>(async (resolve, reject) => {
        let image = await getImage(data.name);
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
                            createChallengeImage({ 'dir': destination, 'name': data.name }).catch((err) => { reject(err) });
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

    });
}
// TODO: Get challenge files dynamically
function createChallengeImage(jsonObj: any) {
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

// TODO: check if user is choosing the right challengeImage (from DB)
async function createChallengeContainer(jsonObj: any) {
    let configData: { portBindings: object, openPorts: number[] } = await _createPortConfig(jsonObj.ports);
    console.log(configData);

    return new Promise<Object>((resolve, reject) => {
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
                let port_: number = randomIntFromInterval(lowerBoundPort, upperBoundPort);
                const portIsOpen = d.find((item) => { return item.openPorts == port_ });

                if (portIsOpen == undefined) {
                    const dockerOpenPort = DB.repo(DockerOpenPort);
                    dockerOpenPort.save(new DockerOpenPort(port_));
                    resolve(port_)
                }
            });
    });
}

function randomIntFromInterval(min: number, max: number) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export default {
    getAllRunningContainers,
    createChallengeImage,
    createChallengeContainer,
    getImage, makeImage
}


