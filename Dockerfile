FROM node:latest

WORKDIR /user/src/uems/front

EXPOSE 15300

COPY package*.json ./

RUN npm install

RUN npm install -g serve

COPY . .

RUN npm run build:docker

CMD ["serve", "-s", "build", "-l", "15300"]
