#!/bin/zsh

proxy_on() {
  sudo networksetup -setsocksfirewallproxy Wi-Fi 127.0.0.1 1113
  sudo networksetup -setsocksfirewallproxystate Wi-Fi on
}

proxy_off() {
  sudo networksetup -setsocksfirewallproxystate Wi-Fi off
}

if [ "$1" = "on" ]
then
  proxy_on
elif [ "$1" = "off" ]
then
  proxy_off
else
  echo "Usage: sh proxy.sh {on|off}"
fi
