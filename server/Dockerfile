# @author Kiran Singh

FROM mrsingh00/node14-docker

WORKDIR  /node/server

COPY package*.json /node/server/
RUN npm install

WORKDIR  /node/shared

COPY package*.json /node/shared/
RUN npm install

WORKDIR /ctf/server

# COPY  . .

EXPOSE 4000

CMD ["npm", "run", "server"]
