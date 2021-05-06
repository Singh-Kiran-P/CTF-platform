# CTF platform
...
## Vue.js(Frontend) + Node.js (REST API) + PostgreSQL

- Frontend - Vue.js
    - Vue.js, Vue Router, BootstrapVue

- API
    - Node.js, Express, Socket.io

## Setup for development
Client side
```
cd client

# Install all dependencies for Vue
npm install
```

Server side
```
cd server

# Install all dependencies for the REST API
npm install
```
Environment variables can be changed in .env files


## How to run services
```
cd server

# Run client
npm run client

# Run server
npm run server

# Run client and server
npm run dev
```

## Docker
```
# Run all dockers
docker-compose up
# Delete all images / containers
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
docker rmi -f $(docker images -a -q)
```
