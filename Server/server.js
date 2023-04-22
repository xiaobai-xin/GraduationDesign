const http = require('http')
const querystring = require('querystring')
var mysql = require('mysql');  
var JSONStr = '';

var mysql_user = {                 
	host: '',        
	user: '',              
	password: '',              
	database: ''         
};
//建立数据库链接
var connection = mysql.createConnection(mysql_user);
connection.connect(function(err) {
	if (err) {      
		console.log('[错误]' + err);
		connection.end();
		return;
	};
	console.log('链接成功');   
});
// 修改密码
function changePwd(setID,setPwd){
    var sql = ' UPDATE users SET pwd = ' + '\u0022' + setPwd + '\u0022' + 'WHERE id = '  + '\u0022' + setID + '\u0022'
    connection.query(sql,function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            return 0;
        }
        if(result=='')
        {
            return 0;
        }
        else
        {
            return 1;
            
        }
    });
}
// 处理POST请求
const server = http.createServer((req, res) => {
    console.log('req content-type:', req.headers['content-type'])
    let postData = ''
    req.on('data', chunk => {
        console.log('chunk', chunk)
        postData += chunk.toString()
    })
    req.on('end', () => {
        console.log('postData:', postData)
        let user = postData.split('\u0022')[3]
        let pwd = postData.split('\u0022')[7]
        let isChangePwd = postData.split('\u0022')[9]
        let newPwd = postData.split('\u0022')[11]
        var  sql = 'SELECT name,type,profile_photo FROM users WHERE id = ' + '\u0022' + user + '\u0022' +' AND'+ ' pwd = ' + '\u0022' + pwd + '\u0022';//\u0022为双引号转义字符
        //执行SQL查询语句
        connection.query(sql,function (err, result) {
            if(err){
            console.log('[SELECT ERROR] - ',err.message);
            res.end("fail") // 返回结果
            return;
            }
            if(result=='')
            {
                res.end("fail");
            }
            else
            {
                //请求更改密码
                if(isChangePwd=='newPwd'){
                    if(changePwd(user,newPwd)==1){
                        res.end("success");
                     }
                    else{
                        res.end("success");
                    }
                    return
                }
                else{
                //返回客户端结果
                    JSONStr = JSON.stringify(result);
                    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                    res.end(JSONStr);
                    console.log('成功')
                }
                
            }
        });
    })
})


server.listen(8000)
console.log('GET OK~~~')
