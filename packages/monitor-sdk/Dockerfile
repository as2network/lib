FROM mhart/alpine-node:14.15.4

WORKDIR /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm install

COPY tsconfig.json /app/tsconfig.json
COPY source/ /app/source/

ENTRYPOINT [ "node", "--inspect=0.0.0.0", "-r", "ts-node/register", "source/script.ts" ]
