FROM cypress/included:7.6.0

ADD . /e2e
WORKDIR /e2e/test-server
RUN cd /e2e/test-server && yarn
