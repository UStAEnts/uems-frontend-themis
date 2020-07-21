# uems-frontend-themis

[![Coverage Status](https://coveralls.io/repos/github/ents-crew/uems-frontend-themis/badge.svg?branch=vitineth/testing)](https://coveralls.io/github/ents-crew/uems-frontend-themis?branch=vitineth/testing)

The frontend for the UEMS application.

This is currently hosted using the simple node serve system running in a docker container.

To build the application + docker image:

```
sudo docker build -t uems-themis .
```

To run the docker image:

```
sudo docker run -p 15300:15300 uems-themis
```
