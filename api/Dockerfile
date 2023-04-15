FROM node

EXPOSE 8000

WORKDIR /app

COPY ./scripts ./scripts
COPY ./src ./src/
COPY package.json ./
COPY tsconfig.json ./

RUN yarn

RUN yarn db:setup

CMD [ "npm", "run", "start" ]