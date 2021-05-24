'use strict'

var build = require('dockerode-build')
var path = require('path')
var pump = require('pump')
var Docker = require('dockerode');
var docker = new Docker({ socketPath: '/var/run/docker.sock' });

// pump(
//     build(path.join('/docker-projects/node_project', 'Dockerfile'), { t: 'sss' }),
//     process.stdout,
//     function (err) {
//         if (err) {
//             console.log('something went wrong:', err.message)
//             process.exit(1)
//         }
//     }
// )
let stream = await docker.buildImage();
await new Promise((resolve, reject) => {
    docker.modem.followProgress(stream, (err, res) => err ? reject(err) : resolve(res));
});
