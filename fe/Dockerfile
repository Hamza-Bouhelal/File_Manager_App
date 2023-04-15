FROM node

EXPOSE 8000

WORKDIR /app

COPY ./src ./src/
COPY ./public ./public/
COPY tailwind.config.js ./
COPY package.json ./
COPY tsconfig.json ./

RUN npm install --force

 
CMD [ "yarn", "start" ]