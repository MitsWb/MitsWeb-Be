FROM node:14
WORKDIR /MitsWeb-Be
COPY package.json .
RUN npm install
COPY . .
CMD npm start
