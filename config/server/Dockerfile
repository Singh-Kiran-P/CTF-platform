# @author Kiran Singh
FROM mrsingh00/node14-docker

WORKDIR  /ctf/server/

COPY . /ctf/server/

RUN npm install

EXPOSE 4000

CMD ["npm", "run", "server"]
