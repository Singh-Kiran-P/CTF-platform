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

Shared folder
```
cd shared

# Install all dependencies for utility
npm install
```

## Generate docs REST API
```
cd server

// Light theme
npx typedoc --out docs src

// Dark theme
npm install typedoc-dark-theme --save-dev
npx typedoc --out docs ./src/ --theme ./node_modules/typedoc-dark-theme/bin/
```

## Environment variables
Env variables can be changed in .env files located in de root folders on client and server

### Information on client .env file

1. Hosting
    * This can be set to LOCALHOST if you are running de appliction on your local machine. If you want to run de applicition inside Docker containers set it to DOCKER

 2. ...
```
# Set it to LOCALHOST if you are not using docker!
HOSTING=DOCKER

NODE_ENV=development

VUE_APP_SERVER_PORT=80
VUE_APP_API_SERVER=4000

VUE_APP_API_HOST=localhost
VUE_APP_API_HOST_DOCKER=nodejs-server
```

### Information on server .env file
```
# Set it to LOCALHOST if you are not using docker!
HOSTING=DOCKER

NODE_ENV=development
SERVER_PORT=4000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=postgres
DB_NAME=ctf-platform

DB_HOST_DOCKER=postgres
DB_USER_DOCKER=postgres
DB_PASSWORD_DOCKER=postgres
DB_NAME_DOCKER=ctf-platform

DB_PORT=5432
DB_SCHEMA=public
DB_LOGGING=true
DB_LOAD_DATA=false

SECRET=random_string
```


## How to run services
```
cd server || cd shared || cd shared

# Run client
npm run client

# Run server
npm run server

# Run client and server
npm run dev
```

## Docker
```
# Build Docker compose file
docker-compose build

# Run docker compose to start all containers
docker-compose up

# Show running containers
docker ps

# Delete all images / containers
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
docker rmi -f $(docker images -a -q)
```
