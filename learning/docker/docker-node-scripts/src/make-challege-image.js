'use strict'

var build = require('dockerode-build')
var path = require('path')
var pump = require('pump')

pump(
    build(path.join('/docker-projects/node_project', 'Dockerfile'), { t: 'sss' }),
    process.stdout,
    function (err) {
        if (err) {
            console.log('something went wrong:', err.message)
            process.exit(1)
        }
    }
)
