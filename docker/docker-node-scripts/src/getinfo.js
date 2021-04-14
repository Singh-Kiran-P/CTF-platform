var Docker = require('dockerode');
var docker = new Docker({ socketPath: '/var/run/docker.sock' });

docker.listContainers(function (err, containers) {
  let d = [];
    containers.forEach(function (containerInfo) {
    d.push(JSON.parse(JSON.stringify(containerInfo)));

  });

  console.log(d[0]);
});


