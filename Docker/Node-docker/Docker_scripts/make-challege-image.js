'use strict'

var build = require('dockerode-build')
var path = require('path')
var pump = require('pump')

pump(
  build(path.join('../node_project', 'Dockerfile'), { t: 'challenge1' }),
  process.stdout,
  function (err) {
    if (err) {
      console.log('something went wrong:', err.message)
      process.exit(1)
    }
  }
)
