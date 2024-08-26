FROM node:lts-alpine as runtime
WORKDIR /app

RUN apk --no-cache add curl

COPY . .

RUN npm install
RUN npm run build

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
CMD node ./dist/server/entry.mjs