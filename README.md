# CTF platform
...
## Node.js (REST API) + Vue.js(Frontend) + PostgreSQL

- API
    - Node.js, Express, Socket.io

- Frontend - Vue.js
    - Vue.js, Vue Router, BootstrapVue

## Setup for development
Client side
```
cd client

# Install all dependencies for Vue
npm install

# Start Vue framework
npm run serve
```

Server side
```
cd server

# Install all dependencies for the REST API
npm i
# Only once time
npm i -g nodemon ts-node 

# Start backend server
npm run server_dev
```
Environment variables can be changed in .env files!


## How to run services
```
cd server

# Check if typescript compile everything correctly (NodeJs server only)
npm run server_watch_TS

# Run backend server
npm run start:watch

# Run Client framework (VUE)
npm run client

# Run Client & REST API
npm run dev
```
