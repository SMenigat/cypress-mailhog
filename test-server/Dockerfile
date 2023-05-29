FROM cypress/included:12.13.0

ADD . /e2e
WORKDIR /e2e/test-server
RUN cd /e2e/test-server && yarn
