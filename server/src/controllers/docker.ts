import { Request, Response, NextFunction } from 'express';
import Docker = require('dockerode');
import pump from 'pump';
import { rejects } from 'node:assert';
import { resolve } from 'node:path';
var build = require('dockerode-build')
var docker = new Docker({ socketPath: '/var/run/docker.sock' });

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

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// TODO: check if user is choosing the right challengeImage (from DB)
function createChallengeContainer(jsonObj: any) {
    let configData = _createPortConfig(jsonObj.ports);
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

function _createPortConfig(ports: string[]) {
    let openPorts: Array<Number> = [];
    let portBindings: { [port: string]: { HostPort: string }[] } = {};
    ports.forEach(port => {
        portBindings[port] = [{ HostPort: _giveRandomPort(openPorts) }];
    });
    return { openPorts: openPorts, portBindings: portBindings };
}

// TODO: Check open ports (from DB)
function _giveRandomPort(openPorts: Number[]): string {
    while (true) {
        let port: Number = randomIntFromInterval(500, 5000)
        if(!openPorts.includes(port)){
            openPorts.push(port)
            return port.toString();
        }
    }
}

export default {
    getAllRunningContainers,
    createChallengeImage,
    createChallengeContainer
}


