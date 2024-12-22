FROM node:latest
WORKDIR /rowbot
COPY ./ ./

RUN npm update

CMD [ "npm", "start" ]
