import { Request, Response, NextFunction } from 'express';
import Docker = require('dockerode');
import pump from 'pump';
import { rejects } from 'node:assert';
import { resolve } from 'node:path';
var build = require('dockerode-build')
var docker = new Docker({ socketPath: '/var/run/docker.sock' });
import DB, { DockerChallengeImage, DockerManagementRepo, DockerOpenPort } from '../database';

function getAllRunningContainers() {
    let data: any = [];
    docker.listContainers(function (err, containers) {
        containers.forEach(function (containerInfo) {
            data.push([containerInfo]);
        });
    });
    return data;
}

// TODO: Get challenge files dynamically
function createChallengeImage(jsonObj: any) {
    return new Promise((resolve, reject) => {
        pump(
            build(`${__dirname}/../../public/uploads/Challenges/uncompressed/test-challenge/Dockerfile`, { t: jsonObj.name }),
            process.stdout,
            (err) => {
                reject(err);
            }
        )
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
            (err, container) => {
                if (err) {
                    reject(err);
                } else {
                    container.start((err, data) => {
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
    createChallengeContainer
}


