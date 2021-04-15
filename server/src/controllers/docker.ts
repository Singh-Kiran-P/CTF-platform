import Docker = require('dockerode');
import AdmZip = require("adm-zip");
import path = require('path');
var appDir = path.dirname(require.main.filename);
var docker = new Docker({ socketPath: '/var/run/docker.sock' });

function getAllRunningContainers() {
  let data = [];
  docker.listContainers(function (err, containers) {
    containers.forEach(function (containerInfo) {
      data.push([containerInfo]);
    });
  });
  Promise.all
  return data;
}

async function unzip(name) {

  let challengeFilePath = appDir + "/uploads/Challenges/compressed/" + name + ".zip";
  console.log(challengeFilePath);

  var zip = new AdmZip(challengeFilePath);
  let newPath = appDir + "/uploads/Challenges/uncompressed/" + name + "/";
  zip.extractAllTo(newPath, true);

  return newPath;
}


/**
 * unzip and make docker image from Dockerfile
 * @param challengeFile Zip file
 */
async function createChallengeImage(req, res, next) {
  let files = unzip("test")

  res.send(files)
}

module.exports = {
  getAllRunningContainers,
  createChallengeImage,
  unzip
}
