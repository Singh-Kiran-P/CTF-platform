var Docker = require('dockerode');
var docker = new Docker({ socketPath: '/var/run/docker.sock' });

docker.createContainer({ Image: 'fakka-man', name: 'team2-challedfsnge2', HostConfig: { PortBindings: { '8080/tcp': [{ HostPort: '8081' }] } } }, function (err, container) {
    container.start(function (err, data) {
    });
});

// docker.createContainer({Image: 'ubuntu', Cmd: ['/bin/bash'], name: 'ubuntu-test'}, function (err, container) {
//     container.start(function (err, data) {
//       //...
//     });
//   });
