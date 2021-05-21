var Dockerode = require('dockerode');
var DockerodeCompose = require('dockerode-compose');

var docker = new Dockerode({ socketPath: '/var/run/docker.sock' });
var compose = new DockerodeCompose(docker);

(async () => {
  var state = await compose.up('./wordpress.yml', 'wordpress');
  console.log(state);
})();
