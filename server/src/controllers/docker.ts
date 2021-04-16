import { Request, Response, NextFunction } from 'express';
import Docker = require('dockerode');
import pump from 'pump';
var build = require('dockerode-build')
var docker = new Docker({ socketPath: '/var/run/docker.sock' });

function getAllRunningContainers() {
    let data:any = [];
    docker.listContainers(function (err, containers) {
        containers.forEach(function (containerInfo) {
            data.push([containerInfo]);
        });
    });
    return data;
}

/**
 * unzip and make docker image from Dockerfile
 * @param challengeFile Zip file
 */
async function createChallengeImage(req: Request, res: Response, next: NextFunction) {
    pump(
        build(`${__dirname}/../../public/uploads/Challenges/uncompressed/test-challenge/Dockerfile`, { t: req.query.name }),
        process.stdout,
        function (err) {
            if (err) {
                console.log('something went wrong:', err.message)
                process.exit(1)
            }
        }
    )
}

export default {
    getAllRunningContainers,
    createChallengeImage,
}
