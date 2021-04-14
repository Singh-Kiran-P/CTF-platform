import  Docker = require('dockerode');
var docker = new Docker({ socketPath: '/var/run/docker.sock' });

function getAllRunningContainers() {
  let data = [];
  docker.listContainers(function (err, containers) {
    containers.forEach(function (containerInfo) {
      data.push([containerInfo]);
    });
  });
  return data;
}

module.exports= {
  getAllRunningContainers,
}
