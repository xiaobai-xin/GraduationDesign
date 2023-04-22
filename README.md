#基于单片机的微信小程序智能教室控制系统设计与实现
##功能实现
灯光控制、亮度调节、亮度显示、温度显示、温控风扇控制、wifi或蓝牙数据采集、微信小程序显示等。
##硬件部分
单片机基于Arduino和ESP8266
##软件部分
###微信小程序
主要分为登录功能和控制功能，控制功能包括自动控制和手动控制
###注册管理系统
登录管理系统后端基于node.js，数据库基于MySQL
###MQTT消息服务器
MQTT消息服务器基于EMQX，搭建方法：https://xiaobai1103.cn/2023/02/16/%e5%9f%ba%e4%ba%8eemqx%e6%90%ad%e5%bb%ba%e7%a7%81%e6%9c%89mqtt%e6%9c%8d%e5%8a%a1%e5%99%a8/
##文件结构
├── MCU<br>
│   ├── Arduino<br>
│   └── ESP8266<br>
├── server<br>
└──miniPrograme