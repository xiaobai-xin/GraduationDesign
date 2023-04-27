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
    classroom:"",
    subTopic: "classroom_101",  //订阅主题,默认订阅对象为101教室 
    pubTopic: "miniprogram_101",  //发布主题，默认控制对象为101教室
    checked_led: false,//led的状态,默认关闭
    checked_fan: false,//led的状态,默认关闭
    fan:" ",//风扇的状态,默认关闭
    pubMsg: " ",
    receivedMsg: "",
    temp:"",//温度值
    lum:"",//亮度值
    //要推送的内容
    fan_speed:"",//设置的转速值
    LED_lum:"",//灯状态
    //显示在页面的用户名
    username:'您未登录',
    imgUrl:'https://api.xiaobai1103.cn/img/default.jpg',//默认头像

    dataInit:false,//页面是否已刷新

    //超时检查
    isPubCheck:false,//更新检查开关
    pubCount:0,       //计时

    timeout:10        //超时时间10秒
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
    修改app.js的方法
*/
  setAppValue(key, value) {
    app.setValue(key, value)
  },
/*
    连接服务器
*/
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
/*
    断开连接
*/
  disconnect() {
    app.disconnect()
  },
/*
    LED开关
*/
onChange_light({ detail }){
  if(this.allowUpdate()){
    this.setData({ 
      checked_led: detail,
    });
    if(detail == true){
      this.setValue("LED_lum", "100");//转速存入缓存
    }else{
      this.setValue("LED_lum", "0");//转速存入缓存
    }
    this.publish();
  }
},
/*
    风扇开关
*/
onChange_fan({ detail }){
  if(this.allowUpdate()){
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
  }
},
/*
    风扇转速调节滑块
*/
fan_slider:function(e) {
  if(this.allowUpdate()){
    this.setValue("fan_speed", e.detail.value);//转速存入缓存
    if(e.detail.value)//开启风扇滑块
      this.setValue("checked_fan", true);
    else  //关闭风扇滑块
      this.setValue("checked_fan", false);//转速存入缓存
    this.publish();
  }
},
/*
    LED亮度调节滑块
*/
LED_slider:function(e) {
  if(this.allowUpdate()){
    this.setValue("LED_lum", e.detail.value);//亮度存入缓存
    if(e.detail.value)//开启LED滑块
      this.setValue("checked_led", true);
    else  //关闭LED滑块
      this.setValue("checked_led", false);//亮度存入缓存
    this.publish();
  }
},
/*
    设置控制教室
*/
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
    room = String(room)
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
          wx.showModal({
            title: '提示',
            content: '您可以控制当前教室啦~',
          })
          this.setAppValue("subTopic","classroom_" + String(room))
          this.setAppValue("pubTopic","miniprogram_" + String(room))
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
/*
          教室选择
*/
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
/*
          消息推送
*/
publish() {
  let msg = this.data.LED_lum + '#' + this.data.fan_speed;
  app.publish(msg);
  this.data.isPubCheck == true;
},
/*
          刷新页面
*/
onLoad:function(options){
  setInterval(() =>{
    //刷新常规数据
    this.setData({
      "temp": app.data.temp,
      "lum": app.data.lum,
      "username":app.data.userName,
      "imgUrl":app.data.userImg,
    });
    //接收到了第一个数据，且页面数据未初始化用于将页面的数据初始化
    if(app.data.IsInitData==true&&this.data.dataInit==false){
      this.dataInit();
      this.data.dataInit=true;//页面数据已初始化
    }
    // 检查单片机数据是否需要检查
    if(this.data.isPubCheck == true){
      this.pubCheck();
    }
    
  },1000)
},
/*
          页面数据初始化
*/
dataInit(){
  console.log("刷新")
  this.setData({
    "fan_speed":app.data.speedSet,//当前单片机设定值
    "LED_lum":app.data.lumSet//当前单片机设定值
  });    
  if(app.data.speedSet!='0'){
    this.setData({
      checked_fan:true
    });
  }
  else{
    this.setData({
      checked_fan:false
    });
  }
  if(app.data.lumSet!='0'){
    this.setData({
      checked_led:true
    });
  }
  else{
    this.setData({
      checked_led:false
    });
  }
},
/*
          超时检查
*/
pubCheck(){
  if(this.data.LED_lum == app.data.lumSet&&this.data.fan_speed == app.data.speedSet){
    this.data.isPubCheck = false;//完成检查
    this.data.pubCount = 0;
  }
  else{
    if(this.data.pubCount < this.data.timeout){
      this.data.pubCount += 1;
    }
    else{
      //已超时
      this.data.pubCount = 0;
      this.data.isPubCheck = false;//完成检查
      //将控制量设为当前单片机的状态
      this.setValue('fan_speed',app.data.speedSet)
      this.setValue('LED_lum',app.data.lumSet)
      wx.showModal({
        title: '提示',
        content: '数据更新失败',
      })
    }
  }
},
/*
          是否允许更新数据
          只有上个数据已经上传的情况下才允许更新
*/
allowUpdate(){
  //上一个数据已经完成更新
  if(this.data.isPubCheck == false)
    return 1;
  else
  {
    wx.showModal({
      title: '提示',
      content: '上一个数据还未完成更新，请稍后尝试',
    })
    return 0;
  }
}

});
