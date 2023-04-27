// pages/me/me.js
const app = getApp();
Page({
  data: {
  //注册登录临时变量
  infoMess: '',
  userN:'',
  passW:'',
  username:'您未登录',
  imgUrl:'https://api.xiaobai1103.cn/img/default.jpg',//默认头像
  //记住密码
  formData: {
    username: "",
    password: "",
    checked: false,
  },
  },
/*
          用于记住密码的自动载入
*/
  onLoad: function (options) {
    this.setData({
      'formData.username': wx.getStorageSync("formData").username,
      'userN': wx.getStorageSync("formData").username,
      'passW': wx.getStorageSync("formData").password,
      'formData.password': wx.getStorageSync("formData").password,
      'formData.checked': wx.getStorageSync('formData').checked
    })
  },

/*  
        修改app.js中的data
*/ 
  setAppValue(key, value) {
    app.setValue(key, value)
  },

/*  
        登录注册部分
*/ 
//用户名和密码输入框事件
userNameInput:function(e){
  this.setData({
    userN:e.detail.value,
    'formData.username': e.detail.value
  })
},
passWdInput:function(e){
  this.setData({
    passW:e.detail.value,
    'formData.password': e.detail.value
  })
},
//退出按钮事件
exitBtnClick:function(){
  setAppValue("isLogin","false")
},
//登录按钮事件
loginBtnClick:function(){
  if(this.data.userN.length == 0 || this.data.passW.length == 0){
   wx.showModal({
     title: '提示',
     content: '用户名和密码不能为空',
   })
  }else{
    this.setAppValue("userID",this.data.userN)
    this.setAppValue("passWd",this.data.passW)
    this.login();
  }
},
/*  
        登录
*/ 
login() {
  // 如果勾选"记住密码"选框则存储登录信息，反之则清空存储的信息
  this.data.formData.checked == true ? wx.setStorageSync("formData", this.data.formData) : wx.setStorageSync("formData", "");
  wx.request({
    url: 'https://bishe.xiaobai1103.cn',
    // url: 'http://127.0.0.1:8000',
    method:"POST",
    data:{
      user:app.data.userID,
      pwd:app.data.passWd
    },
    success:(res)=>{
      if(res.data){
        if(res.data.indexOf('502') != -1){
          wx.showModal({
            title: '提示',
            content: '连接错误502',
          })
          return
        }
        this.setAppValue("isLogin","true")
        this.setAppValue("userType",res.data[0].type)
        this.setAppValue("userImg",'https://' + res.data[0].profile_photo)
        this.setAppValue("userName",res.data[0].name)
        var userTypeStr = ""
        if(res.data[0].type == "stu")
          userTypeStr = "学生"
        else
          userTypeStr = "教师"
        this.setData({
          "username":res.data[0].name + '您好,您的用户类型是' + userTypeStr,
          "imgUrl":'https://' + res.data[0].profile_photo
        });
      }
      else{
        wx.showModal({
          title: '提示',
          content: '用户名或密码错误',
        })
      }
    },
    fail:(res)=>{
      wx.showModal({
        title: '提示',
        content: '连接错误',
      })
    }
  })
},
/*  
        记住密码框事件
*/ 
onChange(e) {
  this.setData({
    'formData.checked': e.detail.value.includes('1')
  })
},


})