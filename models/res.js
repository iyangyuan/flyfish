//http请求响应类
function Res(){}

module.exports = Res;

//http响应封装
//-response 响应对象
//-responseCode 响应代码，200、500等
//-responseContent 响应内容
Res.sendPlain = function(response,code,content){
  response.writeHead(code,{'Content-Type':'text/plain;charset=utf-8'});
  response.write(content);
  response.end();
}

Res.sendJson = function(response,code,content){
  response.writeHead(code,{'Content-Type':'text/json;charset=utf-8'});
  response.write(content);
  response.end();
}
