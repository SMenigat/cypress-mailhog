FROM cypress/included:16.3.0

ADD . /e2e
WORKDIR /e2e
RUN npx --yes yarn@1.22.22 install --frozen-lockfile --production
WORKDIR /e2e/test-server
RUN npx --yes yarn@1.22.22 install --frozen-lockfile
