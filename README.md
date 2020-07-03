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