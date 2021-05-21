var Docker = require('dockerode');
var docker = new Docker({ socketPath: '/var/run/docker.sock' });


docker.getImage("sha256:3d0b42b03384a8bfd8156fa2f9cf840c7ebc20abe132e89147b2dca5aedd0db8")
    .remove({ force: { true: 'true' } }, (err, res) => {
        if (err) {
            console.log(err)
        }
        console.log(res);
    });
