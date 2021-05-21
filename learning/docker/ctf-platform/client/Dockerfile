FROM node:10

WORKDIR /home/singh/Desktop/PSOPV/inf-psopv-20-21-team-groep-2/Docker/ctf-platform/client

COPY package*.json ./

RUN npm install

EXPOSE 80

CMD ["npm", "run", "serve"]
