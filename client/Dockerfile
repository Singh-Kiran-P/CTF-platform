# @author Kiran Singh

FROM node:10-alpine

WORKDIR  /node/client

COPY package*.json /node/client/
RUN npm install

WORKDIR  /node/shared

COPY package*.json /node/shared/
RUN npm install

WORKDIR /ctf/client
# COPY . .

EXPOSE 80

CMD ["npm", "run", "client"]
