FROM node:22-alpine
ARG ENVCONSUL_VERSION=0.13.2

ADD https://releases.hashicorp.com/envconsul/${ENVCONSUL_VERSION}/envconsul_${ENVCONSUL_VERSION}_linux_amd64.zip /tmp/envconsul.zip
RUN unzip /tmp/envconsul.zip && \
    rm /tmp/envconsul.zip && \
    mv envconsul /usr/local/bin/

# Create app directory
WORKDIR /app
COPY . ./

RUN npm ci && \
    npm run build

VOLUME /app/config

ENV NODE_ENV production
ENV AUTH_SYNC_CONFIG_PATH /app/config

ENTRYPOINT ["envconsul", "-config", "/app/config/env.hcl", "./bin/run.js", "monitor"]
