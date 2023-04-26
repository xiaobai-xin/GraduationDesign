const http = require('http')
const mysql = require('mysql2/promise');
var JSONStr = '';
var userInfor = '';
//登录信息(连接内容已省略)
sqlInfor = {
    host: "",
    user: "",
    password: "",
    database: "",
    multipleStatements: true
}
// 登录
async function userCheck(ID,pwd){
    let connection = await mysql.createConnection(sqlInfor)
    var sql = 'SELECT name,type,profile_photo FROM users WHERE id = ' + '\u0022' + ID + '\u0022' +' AND pwd = ' + '\u0022' + pwd + '\u0022';
    try{
        let [results] = await connection.execute(sql, [1])
        if(results==""){
            console.log("error");
            return "error";
        }
        else{
            return results;
        }
    }
    catch (error) {  
        return "error";
    }
}
// 修改密码
async function changePwd(setID,setPwd){
    let connection = await mysql.createConnection(sqlInfor)
    var sql = ' UPDATE users SET pwd = ' + '\u0022' + setPwd + '\u0022' + 'WHERE id = '  + '\u0022' + setID + '\u0022'
    try{
        let [results] = await connection.execute(sql, [1])
        if(results==""){
            console.log("error");
            return 0;
        }
        else{
            console.log(results);
            return 1;
        }
    }
    catch (error) {  
        return 0;
    }
}
//获取教室控制权限
async function gainClassroom(ID,room){
    let connection = await mysql.createConnection(sqlInfor)
    var sql = 'SELECT classroom FROM users WHERE id = '+ '\u0022' + ID + '\u0022';
    try{
        let [results] = await connection.execute(sql, [1])
        if(results==""){
            console.log("error");
            return 0;
        }
        else{
            let str = JSON.stringify(results)
            console.log(str);
            if(str.indexOf(room) != -1){  //有权限
                    return 1;
            }
             else{
                    return 0;   //无权限
             }
        }
    }
    catch (error) {  
        return 0;
    }
}
// 处理POST请求
const server = http.createServer((req, res) => {
    console.log('req content-type:', req.headers['content-type'])
    let postData = ''
    req.on('data', chunk => {
        console.log('chunk', chunk)
        postData += chunk.toString()
    })
    req.on('end', async () => {
        console.log('postData:', postData);
        let user = postData.split('\u0022')[3];
        let pwd = postData.split('\u0022')[7];
        let action = postData.split('\u0022')[9]; //操作类型：newPwd更改密码 或 classroom查询教室访问权限
        let Parameter = postData.split('\u0022')[11];
        //登录部分
        userInfor = await userCheck(user,pwd);//拉取用户信息
        if(userInfor == 'error'){  
            res.end("fail");
        }
        else{
            //更改密码
            if(action=='newPwd'){
                if(await changePwd(user,Parameter)==1){
                    res.end("success");
                 }
                else{
                    res.end("fail");
                }
                return
            }
            //获取教室控制权限
            else if(action=='classroom'){
                if(await gainClassroom(user,Parameter)==1){
                    res.end("pass");
                 }
                else{
                    res.end("fail");
                }
                return
            }
            else{
            //返回客户端结果
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                JSONStr = JSON.stringify(userInfor);
                res.end(JSONStr);
                console.log('返回')
                console.log(JSONStr)
                console.log('成功')
            }
        }
    })
})
server.listen(8000)
