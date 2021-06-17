FROM node:16-alpine
WORKDIR /home/gidget
ENV NODE_ENV="production"
# See below
RUN apk add --no-cache curl bash git
# Commands => qr, record
RUN apk add --no-cache libqrencode lame
# Build C++/Python addons (Canvas, gifsicle, @discordjs/opus)
RUN apk add --no-cache build-base g++ autoconf automake libtool
# Any Canvas command (only node.js versions where binary Canvas is not available)
RUN apk add --no-cache libpng libpng-dev jpeg-dev pango-dev cairo-dev giflib-dev
# Making free space
RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash -s -- -b /usr/local/bin
# Installing project dependencies
COPY package.json .
RUN npm install --only=production --legacy-peer-deps
# Doing things with Discord.js
RUN cd ./node_modules/discord.js && npm i && gen-esm-wrapper ./src/index.js ./src/index.mjs
# Free space
RUN /usr/local/bin/node-prune
RUN apk del git build-base autoconf automake libtool make gcc g++ curl bash \
    && rm -rf /usr/include \
    && rm -rf /var/cache/apk/* /usr/share/man /tmp/*
# Copying bot code
COPY . .
# Testing
RUN npm test
# Exposing private API
ENV PORT=8080
EXPOSE 8080
# CMD ["node", "--experimental-json-modules", "."]
CMD ["npm", "start"]