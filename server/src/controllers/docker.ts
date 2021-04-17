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

/**
 * unzip and make docker image from Dockerfile
 * uniek naam geven aan image
 * @param challengeFile Zip file *
 * @pre files have to be in de dir
 */
async function createChallengeImage(jsonObj: any) {
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
/* TODO: error terug geven line 39-42 */
async function createChallengeContainer(jsonObj: any) {
    let randomPort = randomIntFromInterval(500, 10000)
    return new Promise<void>((resolve, reject) => {
        docker.createContainer({ Image: jsonObj.image, name: jsonObj.containerName, HostConfig: { PortBindings: { '8080/tcp': [{ HostPort: randomPort.toString() }] } } }, (err, container) => {
            if (err) {
                reject(err);
            } else {
                container.start((err, data) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            }
        });
    });
}

export default {
    getAllRunningContainers,
    createChallengeImage,
    createChallengeContainer
}
