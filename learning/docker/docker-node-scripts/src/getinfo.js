var Docker = require('dockerode');
var docker = new Docker({ socketPath: '/var/run/docker.sock' });

// docker.listImages(function (err, containers) {
//     let d = [];
//     containers.forEach(function (containerInfo) {
//         d.push(JSON.parse(JSON.stringify(containerInfo)));
//     });
//     console.log(d);
// });

docker.getImage('df87d2ce2bc9e')
    .then(() => console.log((d)))
    .catch((err => console.log(err)))
