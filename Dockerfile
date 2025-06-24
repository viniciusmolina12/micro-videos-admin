# FROM node:23.8-slim

# USER node
# COPY . .
# WORKDIR /home/node/app

# CMD ["tail", "-f", "/dev/null"]

FROM node:23.8-slim

WORKDIR /home/node/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN chown -R node:node /home/node/app

USER node

CMD ["yarn", "start"]
