# @author Kiran Singh
FROM node:10-alpine

WORKDIR  /ctf/client/

COPY . /ctf/client/

RUN npm install

EXPOSE 80

CMD ["npm", "run", "client"]
