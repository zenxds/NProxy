# docker build -f server.dockerfile -t zenxds/nproxy:latest .
docker run --name nproxy \
  -p 8886:8886 \
  # -p 1113:1113 \
  -v $PWD/config.js:/home/node/app/config.js \
  --restart always \
  -d zenxds/nproxy:latest
