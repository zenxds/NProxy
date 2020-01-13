docker run --name nproxy \
  -p 8886:8886 \
  -v $PWD/config.js:/home/node/app/config.js \
  --network="host" \
  --restart always \
  -d zenxds/nproxy:1.0
