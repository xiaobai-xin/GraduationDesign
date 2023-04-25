// pages/automation.js
const app = getApp();
Page({
  data: {
    /*
          要发送的信息
          格式：sit # isAutoOpen # isAutoPowerOpen # isAutoFanOpen # autoFanValue # isAutoLedOpen # autoLedvalue
     */
    isAutoOpen : "",
    isAutoPowerOpen : "",
    isAutoFanOpen : "",
    autoFanValue : "",
    isAutoLedOpen : "",
    autoLedvalue : "",
  },
/*
    修改本页面的data
*/
  setValue(key, value) {
    this.setData({
      [key]: value,
    });
  },
/*
        自动化方法
*/
  //开启自动化
  automationSwitch : function (e) {
    this.setValue("isAutoOpen",e.detail.value)
  },
  //开启自动断电
  autoPowerSwitch : function (e) {
    this.setValue("isAutoPowerOpen",e.detail.value)
  },
  //开启自动风扇
  autoFanSwitch : function (e) {
    this.setValue("isAutoFanOpen",e.detail.value)
  }, 
  //开启自动LED控制
  autoLedSwitch : function (e) {
    this.setValue("isAutoLedOpen",e.detail.value)
  },
  // 开启风扇转速
  fan_slider:function(e) {
    console.log(e.detail.value);
    this.setValue("autoFanValue", e.detail.value);//转速存入缓存
  },
  // 开启LED转速
  led_slider:function(e) {
    console.log(e.detail.value);
    this.setValue("autoLedvalue", e.detail.value);//转速存入缓存
  },
/*
        提交按钮事件
*/
  submit : function(){
    if(app.data.isLogin == 'true')
    {
      let msg = 'sit'+'#'+this.data.isAutoOpen+'#'+this.data.isAutoPowerOpen+'#'+this.data.isAutoFanOpen+'#'+this.data.autoFanValue+'#'+this.data.isAutoLedOpen+'#'+this.data.autoLedvalue
      app.publish(msg)
    }
    else
    {
      wx.showModal({
        title: '提示',
        content: '您未登录',
      })
    }
  }
  
})