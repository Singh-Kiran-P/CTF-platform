var Docker = require('dockerode');
var docker = new Docker({ socketPath: '/var/run/docker.sock' });

// docker.listImages(function (err, containers) {
//     let d = [];
//     containers.forEach(function (containerInfo) {
//         d.push(JSON.parse(JSON.stringify(containerInfo)));

//     });

//     console.log(d);
// });

docker.getImage('3d0b42b03384').inspect().then ((d) =>{
    console.log(d);
})
