var Docker = require('dockerode');
var docker = new Docker({ socketPath: '/var/run/docker.sock' });

docker.createContainer({
    Image: 'fakka-man', name: 'team2-challcxvfgdsdfdxfgedfsnge2', HostConfig: {
        PortBindings: {
            "8080/tcp": [{ "HostPort": "8581" }],
            "6222/tcp": [{ "HostPort": "6222" }],
            "8222/tcp": [{ "HostPort": "8222" }]
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
