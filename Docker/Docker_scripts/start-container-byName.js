var Docker = require('dockerode');
var docker = new Docker({ socketPath: '/var/run/docker.sock' });

var container = docker.getContainer('team2-challedfsnge2');

// query API for container info
container.inspect(function (err, data) {
  console.log(data);
});

container.start(function (err, data) {
  console.log(data);
});

container.stop(function (err, data) {
  console.log(data);
});


container.remove(function (err, data) {
  console.log(data);
});
