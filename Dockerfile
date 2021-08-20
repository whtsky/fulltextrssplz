FROM node:16 AS build
WORKDIR /app
ENV CYPRESS_INSTALL_BINARY=0

COPY yarn.lock /app
COPY package.json /app
RUN yarn install --frozen-lockfile
COPY tsconfig.json /app
COPY rollup.config.js /app
COPY tailwind.config.js /app
COPY tailwind.config.js /app
COPY src /app/src
COPY index.html /app
RUN yarn build

FROM node:16
WORKDIR /app
COPY yarn.lock /app
COPY package.json /app
RUN yarn install --frozen-lockfile --production
COPY --from=build /app/public /app/public
COPY --from=build /app/src /app/src
EXPOSE 80
ENV PORT=80
ENV HOSTNAME=0.0.0.0
ENTRYPOINT ["node", "src/server.js"]