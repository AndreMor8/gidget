FROM node:18-alpine
WORKDIR /home/gidget
ENV NODE_ENV="production"
# Install system dependencies
RUN apk add --no-cache curl bash git libqrencode build-base g++ autoconf automake libtool libpng libpng-dev jpeg-dev pango-dev cairo-dev giflib-dev gifsicle
RUN npm install -g node-prune
# Installing project dependencies
COPY package.json .
RUN npm i
# Free space
RUN node-prune
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
