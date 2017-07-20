# NProxy

配置写在config.json，分为tunnel，client，server三部分

## 一个基于隧道的https代理

参考[HTTP 代理原理及实现（一）](https://imququ.com/post/web-proxy.html)

需要自己生成及导入证书

    node index.js -t

## 一个类ss实现

    node index.js -c client部分
    node index.js -s server部分

将浏览器代理设置为socks5代理，端口为client所在端口

client和server密码要一致，client的serverPort 与 server的port 要一致

[gfwlist](https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt)

## 密码长度

* aes-256-cfb: 不限制
* aes-256-gcm: 32
* aes-192-gcm: 24
* aes-128-gcm: 16

gcm算法还需要一个初始向量，长度推荐为12