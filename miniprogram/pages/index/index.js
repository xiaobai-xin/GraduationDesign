const app = getApp();
Page({
  data: {
    array: ['101', '102', '103', '104'],
    objectArray: [
      {
        id: 0,
        name: '101'
      },
      {
        id: 1,
        name: '102'
      },
      {
        id: 2,
        name: '103'
      },
      {
        id: 3,
        name: '104'
      }
    ],
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
    temp:"",//温度值
    lum:"",//亮度值
    //arduino当前的转速亮度设置
 
    //要推送的内容
    fan_speed:"0",//设置的转速值
    LED_lum:"0",//灯状态


    mqttOptions: {
      username: "test",
      password: "test",
      reconnectPeriod: 1000, // 1000毫秒，设置为 0 禁用自动重连，两次重新连接之间的间隔时间
      connectTimeout: 30 * 1000, // 30秒，连接超时时间
      // 更多参数请参阅 MQTT.js 官网文档：https://github.com/mqttjs/MQTT.js#mqttclientstreambuilder-options
      // 更多 EMQ 相关 MQTT 使用教程可在 EMQ 官方博客中进行搜索：https://www.emqx.com/zh/blog
    },
  
    //显示在页面的用户名
    username:'您未登录',
    imgUrl:'https://api.xiaobai1103.cn/img/default.jpg'//默认头像



  },

  setValue(key, value) {
    this.setData({
      [key]: value,
    });
  },
//修改app.js的方法
  setAppValue(key, value) {
    app.setValue(key, value)
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
//连接服务器
  connect() {
    if(app.data.isLogin=="true")
{
  app.connect();
  }
  else{
    wx.showModal({
      title: '提示',
      content: '您未登录',
    })

  }
  },
//取消订阅
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
// 与服务器断开连接
  disconnect() {
    this.data.client.end();
    this.data.client = null;
    this.setAppValue("conenctBtnText", "连接");
    wx.showToast({
      title: "成功断开连接",
    });
  },


/*
    页面控制单元
*/
// LED灯开关
onChange_light({ detail }){
  //detail是滑块的值，检查是打开还是关闭，并更换正确图标
this.setData({ 
  checked_led: detail,
 });
 if(detail == true){
  this.setValue("LED_lum", "100");//转速存入缓存
 }else{
  this.setValue("LED_lum", "0");//转速存入缓存
 }
 this.publish();
},
// 风扇开关
onChange_fan({ detail }){
  //detail是滑块的值，检查是打开还是关闭，并更换正确图标
  this.setData({ 
    checked_fan: detail,
  });
  if(detail == true){
    this.setValue("fan_speed", "100");//转速存入缓存

  }
  else{
    this.setValue("fan_speed", "0");//转速存入缓存
  }
  this.publish();
},
// 风扇转速控制滑块
fan_slider:function(e) {
  this.setValue("fan_speed", e.detail.value);//转速存入缓存
  if(e.detail.value)//开启风扇滑块
    this.setValue("checked_fan", true);
  else  //关闭风扇滑块
    this.setValue("checked_fan", false);//转速存入缓存
  this.publish();
},
// LED亮度控制滑块
LED_slider:function(e) {
  this.setValue("LED_lum", e.detail.value);//亮度存入缓存
  if(e.detail.value)//开启LED滑块
    this.setValue("checked_led", true);
  else  //关闭LED滑块
    this.setValue("checked_led", false);//亮度存入缓存
  this.publish();
},

//教室选择
setClassroom(room){
  if(app.data.isLogin!="true"){
    wx.showModal({
      title: '提示',
      content: '您未登录',
    })
  }
  else if(app.data.userType=="th"){
    setAppValue("subTopic","classroom_" + string(room))
    setAppValue("pubTopic","miniprogram_" + string(room))
  }
  else{
    wx.request({
      url: 'https://bishe.xiaobai1103.cn',
      // url: 'http://127.0.0.1:8000',
      method:"POST",
      data:{
        user:app.data.userID,
        pwd:app.data.passWd,
        classroom:room
      },
      success:(res)=>{
        if(res.data=="pass"){
          setAppValue("subTopic","classroom_" + string(room))
          setAppValue("pubTopic","miniprogram_" + string(room))
        }
        else{
          wx.showModal({
            title: '提示',
            content: '您没有当前教室的控制权限',
          })
        }
      }
    })
 }

},


// 教室选择
bindPickerChange_classroom:function (e) {
  if(e.detail.value==0)
  {
    this.setClassroom(101)
  }
  if(e.detail.value==1)
  {
    this.setClassroom(102)
  } if(e.detail.value==2)
  {
    this.setClassroom(103)
  } if(e.detail.value==3)
  {
    this.setClassroom(104)
  }
},
// 推送
publish() {
  let msg = this.data.fan_speed + '#' + this.data.LED_lum;
  app.publish(msg);
},
//刷新页面
onLoad:function(options){
  setInterval(() =>{
    this.setData({
      "temp": app.data.temp,
      "lum": app.data.lum,
      "username":app.data.userName,
      "imgUrl":app.data.userImg,
      "fan_speed":app.data.speedSet,//当前单片机设定值
      "LED_lum":app.data.lumSet//当前单片机设定值
    });
  },1000)
},







});
