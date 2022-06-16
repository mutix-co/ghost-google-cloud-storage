FROM ghost:5

COPY ./src/google-cloud-storage content/adapters/storage

WORKDIR content/adapters/storage

RUN yarn install --production

WORKDIR /var/lib/ghost/
