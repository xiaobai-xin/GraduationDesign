// app.js
import mqtt from "./utils/mqtt.min.js";
App({
  data: {
    index: 0,
    client: null,
    conenctBtnText: "连接",
    host: "mqtt.xiaobai1103.cn",
    subTopic: "classroom_101",  //订阅主题,默认订阅对象为101教室 
    pubTopic: "miniprogram_101",  //发布主题，默认控制对象为101教室
    checked_led: false,//led的状态,默认关闭
    checked_fan: false,//led的状态,默认关闭
    fan:" ",//风扇的状态,默认关闭
    pubMsg: " ",
    receivedMsg: "",
    //接收的亮度值存这里，由页面刷新获取
    temp:"",//温度值
    lum:"",//亮度值
    speedSet:"",//当前单片机设定值
    lumSet:"",//当前单片机设定值
    mqttOptions: {
      username: "test",
      password: "test",
      reconnectPeriod: 1000, // 1000毫秒，设置为 0 禁用自动重连，两次重新连接之间的间隔时间
      connectTimeout: 30 * 1000, // 30秒，连接超时时间
      // 更多参数请参阅 MQTT.js 官网文档：https://github.com/mqttjs/MQTT.js#mqttclientstreambuilder-options
      // 更多 EMQ 相关 MQTT 使用教程可在 EMQ 官方博客中进行搜索：https://www.emqx.com/zh/blog
    },
/*
          注册登录部分
*/
    // isLogin: 'true',//（测试用）跳过登录检查
    isLogin: 'false',//默认登录状态
    userName: '您未登录',//默认用户名
    userID:'',//学号、员工号
    userType:'',
    userImg:'https://api.xiaobai1103.cn/img/default.jpg',//默认用户头像
    passWd: '',
  },
/*
    修改本页面的data
*/
  setValue(key, value) {
    this.data[key]=value
  },
  setHost(e) {
    this.setValue("host", e.detail.value);
  },
  setSubTopic(e) {
    this.setValue("subTopic", e.detail.value);
  },
  setPubTopic(e) {
    this.setValue("pubTopic", e.detail.value);
  },
  setPubMsg(e) {
    this.setValue("pubMsg", e.detail.value);
  },
  setRecMsg(msg) {
    this.setValue("receivedMsg", msg);
  },
/*
          MQTT连接
*/
  connect() {
  try {
    this.setValue("conenctBtnText", "连接中...");
    const clientId = new Date().getTime();
    this.data.client = mqtt.connect(`wxs://mqtt.xiaobai1103.cn:8084/mqtt`, {
      ...this.data.mqttOptions,
      clientId,
    });
    this.data.client.on("connect", () => {
      wx.showToast({
        title: "已连接",
      });
      this.setValue("conenctBtnText", "连接成功");
      //订阅主题
      this.data.client.subscribe(this.data.subTopic);
      this.data.client.on("message", (topic, payload) => {
        //数据封装拆解部分
        var  msg = payload.toString();
        console.log(msg)
        var mqtt_Data = msg.split("#");
        this.setValue("temp",mqtt_Data[2]);
        this.setValue("lum",mqtt_Data[1]);
        this.setValue("lumSet",mqtt_Data[3]);
        this.setValue("speedSet",mqtt_Data[4]);
        console.log("msg is arrived ")
      });
      this.data.client.on("error", (error) => {
        this.setValue("conenctBtnText", "连接");
        console.log("onError", error);
      });
      this.data.client.on("reconnect", () => {
        this.setValue("conenctBtnText", "连接");
        console.log("reconnecting...");
      });
      this.data.client.on("offline", () => {
        this.setValue("conenctBtnText", "连接");
        console.log("onOffline");
      });
    });
  } catch (error) {
    this.setValue("conenctBtnText", "连接");
    console.log("mqtt.connect error", error);
  }
  },
/*
          取消订阅
*/
  unsubscribe() {
    if (this.data.client) {
      this.data.client.unsubscribe(this.data.subTopic);
      wx.showModal({
        content: `成功取消订阅主题：${this.data.subTopic}`,
        showCancel: false,
      });
      return;
    }
    wx.showToast({
      title: "请先点击连接",
      icon: "error",
    });
  },
/*
          断开连接
*/
  disconnect() {
    this.data.client.end();
    this.data.client = null;
    this.setAppValue("conenctBtnText", "连接");
    wx.showToast({
      title: "成功断开连接",
    });
  },
/*
          MQTT消息发布
*/
  publish(msg){
    this.data.client.publish(this.data.pubTopic,msg);
  }
})
