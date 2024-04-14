FROM node:18-alpine

ENV APP_DIR /home/node/app

# ENV TZ Asia/Shanghai

# RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone \
#     && mkdir -p $APP_DIR

WORKDIR $APP_DIR

COPY yarn.lock package.json $APP_DIR/

RUN yarn install --production --registry=https://registry.npmmirror.com

COPY . $APP_DIR

EXPOSE 1113

# Entrypoint
CMD ["npm", "run", "start:client:docker"]
