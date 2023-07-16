FROM node:alpine

WORKDIR /usr/server

COPY package.json .

RUN npm install

COPY . .

CMD ["npm", "run", "build"]

CMD ["npm", "run", "start"]

