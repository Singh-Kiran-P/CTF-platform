var Docker = require('dockerode');
var docker = new Docker({ socketPath: '/var/run/docker.sock' });

docker.createContainer({
    Image: 'sha256:7f2b57baebd4602ca67a78e523d88901d0e8f731ea50fa3d8fdaea1170828fec', name: '', HostConfig: {
        PortBindings: {
            "8080/tcp": [{ "HostPort": "8581" }],
        }
    }, function(err, container) {
        console.log(err);

        container.start(function (err, data) {
            console.log(err);
        });
    }
});

// docker.createContainer({Image: 'ubuntu', Cmd: ['/bin/bash'], name: 'ubuntu-test'}, function (err, container) {
//     container.start(function (err, data) {
//       //...
//     });
//   });
