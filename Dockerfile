# FROM node:10-alpine
FROM node:10

ENV APP_DIR /home/node/app

# ENV TZ Asia/Shanghai

# RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone \
#     && mkdir -p $APP_DIR

WORKDIR $APP_DIR

COPY yarn.lock package.json $APP_DIR/

RUN yarn install --production --registry=https://registry.npm.taobao.org

COPY . $APP_DIR

EXPOSE 8886

# Entrypoint
CMD ["npm", "run", "start:docker"]
