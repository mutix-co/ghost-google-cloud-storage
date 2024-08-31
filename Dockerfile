FROM ghost:5.91.0 as base

ENV GHOST_INSTALL /var/lib/ghost
ENV GHOST_CLOUD_STORAGE_ADAPTER /var/lib/ghost/content/adapters/storage
COPY --chown=node ./src/google-cloud-storage "$GHOST_CLOUD_STORAGE_ADAPTER"

FROM base as test
ENV NODE_ENV test
WORKDIR "$GHOST_CLOUD_STORAGE_ADAPTER"
RUN set -eux; \
    gosu node yarn install;
CMD [ "yarn", "run", "test" ]

FROM base as production
ENV NODE_ENV production
WORKDIR "$GHOST_CLOUD_STORAGE_ADAPTER"
RUN set -eux; \
    gosu node yarn install; \
    chown -R node:node "$GHOST_CLOUD_STORAGE_ADAPTER"; \
    chmod -R 1777 "$GHOST_CLOUD_STORAGE_ADAPTER"; \
    gosu node yarn cache clean; \
    cd "$GHOST_INSTALL"; \
    gosu node yarn cache clean; \
    gosu node npm cache clean --force; \
    npm cache clean --force; \
    rm -rv /tmp/v8*

WORKDIR "$GHOST_INSTALL"
