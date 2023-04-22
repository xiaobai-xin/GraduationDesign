// pages/password/password.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userN:'',
    passW:'',
    newPassW:''
  },
//用户名和密码输入框事件
userNameInput:function(e){
  this.setData({
    userN:e.detail.value,
  })
},
passWdInput:function(e){
  this.setData({
    passW:e.detail.value,
  })
},
newPassWdInput:function(e){
  this.setData({
    newPassW:e.detail.value,
  })
},

//修改密码按钮事件
ChangePwdBtn:function(){
    this.changePwd();
},


//修改密码
changePwd() {
  console.log('发起请求')
  wx.request({
    // url: 'https://bishe.xiaobai1103.cn',
    url: 'http://127.0.0.1:8000',
    method:"POST",
    data:{
      user:this.data.userN,
      pwd:this.data.passW,
      newPwd:this.data.newPassW
    },
    success:(res)=>{
      if(res.data){
        if(res.data=='success'){
          wx.showModal({
            title: '提示',
            content: '修改密码成功',
          })
        }
        else{
          wx.showModal({
            title: '提示',
            content: '修改密码失败',
          })
        }
        
      }
      else{
        wx.showModal({
          title: '提示',
          content: '用户名或密码错误',
        })
      }
    }
  })
},
})