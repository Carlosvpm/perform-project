FROM node:alpine

WORKDIR /src

COPY package*.json ./

RUN npm install

COPY . . 

EXPOSE 3333

CMD ["npm", "run", "dev"]