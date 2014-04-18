var fs = require("fs");
var path = require("path");
var ncp = require("ncp").ncp;

//文件助手模块
function Filex(){}

module.exports = Filex;

//创建目录
//url目录路径，如：aaa/ddd/dd
//mode权限，默认0755
//cd回调函数
Filex.mkdirSync = function(url,mode,cb){
  var arr = url.split("/");
  mode = mode || 0755;
  cb = cb || function(){};
  if(arr[0]==="."){//处理 ./aaa
      arr.shift();
  }
  if(arr[0] == ".."){//处理 ../ddd/d
      arr.splice(0,2,arr[0]+"/"+arr[1])
  }
  function inner(cur){
      if(!path.existsSync(cur)){//不存在就创建一个
          fs.mkdirSync(cur, mode)
      }
      if(arr.length){
          inner(cur + "/"+arr.shift());
      }else{
          cb();
      }
  }
  arr.length && inner(arr.shift());
}

//清空目录
//示例：rmdirSync("aaa",function(e){})
Filex.rmdirSync = (function(){
  function iterator(url,dirs){
      var stat = fs.statSync(url);
      if(stat.isDirectory()){
          dirs.unshift(url);//收集目录
          inner(url,dirs);
      }else if(stat.isFile()){
          fs.unlinkSync(url);//直接删除文件
      }
  }
  function inner(path,dirs){
      var arr = fs.readdirSync(path);
      for(var i = 0, el ; el = arr[i++];){
          iterator(path+"/"+el,dirs);
      }
  }
  return function(dir,cb){
      cb = cb || function(){};
      var dirs = [];

      try{
          iterator(dir,dirs);
          for(var i = 0, el ; el = dirs[i++];){
              fs.rmdirSync(el);//一次性删除所有收集到的目录
          }
          cb()
      }catch(e){//如果文件或目录本来就不存在，fs.statSync会报错，不过我们还是当成没有异常发生
          e.code === "ENOENT" ? cb() : cb(e);
      }
  }
})();

//同步创建文件(utf-8编码)
//path文件路径
//content文件内容
Filex.writeFile = function (path,content){
  fs.writeFileSync(path,content,"utf-8",function(err){//会先清空原先的内容
    if(err) throw err;
  });
};

//异步读取文件(utf-8编码)
//其实作者本来想用同步的，但为了演示异步的用法，就这样写了
//path文件路径
//cb回调函数，必须用回调，才能确保文件读取完毕
Filex.readFile = function(path,cb){
  fs.readFile(path,"utf-8",function(err,data){
    if(err){
      cb(null,err);
    }else{
      cb(data,null);
    }
  });
};

//异步复制文件/文件夹
//source源路径
//destination目标路径
Filex.copy = function (source,destination,cb){
  ncp.limit = 16;

  ncp(source, destination, function (err) {
   if (err) {
     cb(err);
   }else{
     cb(null);
   }
  });
};


