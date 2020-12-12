FROM node:15-alpine
WORKDIR /home/gidget
# See below
RUN apk add --no-cache curl bash
# Commands => qr, record
RUN apk add --no-cache libqrencode lame
# Build C++/Python addons (Canvas, gifsicle, @discordjs/opus)
RUN apk add --no-cache build-base g++ autoconf automake libtool python
# Any Canvas command (only node.js versions where binary Canvas is not available)
RUN apk add --no-cache libpng libpng-dev jpeg-dev pango-dev cairo-dev giflib-dev
# screenshot command
RUN apk add --no-cache chromium
# Making free space
RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash -s -- -b /usr/local/bin
# Installing project dependencies
COPY package.json .
RUN npm install --only=production --legacy-peer-deps
# Free space
RUN /usr/local/bin/node-prune
# Copying bot code
COPY . .
# Exposing private API
ENV PORT=8080
EXPOSE 8080
# CMD ["node", "--experimental-json-modules", "."]
CMD ["npm", "start"]