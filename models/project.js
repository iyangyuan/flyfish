var mongodb = require("./db");
var Filex = require("./filex");
var Datex = require("./datex");
var Zipx = require("./zipx");

//项目类
function Project(name,data){
  this.name = name;
  this.data = data;
}

module.exports = Project;

//保存项目
Project.prototype.save = function (callback){
  //构造项目数据
  var project = {
    "name": this.name,
    "data": this.data
  };
  
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }

    //读取 projects 集合
    db.collection('projects', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);//错误，返回 err 信息
      }

      //将用户数据插入 projects 集合
      collection.insert(project, {safe: true}, function (err, user) {
        mongodb.close();//关闭数据库
        callback(null);//成功！err 为 null
      });
    });
  });
}

//更新项目
Project.prototype.update = function (callback){
  //构造项目数据
  var key = {
    "name": this.name
  };
  var value = {
    "data": this.data
  };
  
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }

    //读取 projects 集合
    db.collection('projects', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);//错误，返回 err 信息
      }

      //将用户数据更新到 projects 集合
      collection.update(key, {"$set": value} ,{safe: true}, function (err, user) {
        mongodb.close();//关闭数据库
        callback(null);//成功！err 为 null
      });
    });
  });
};

//生成项目
Project.prototype.build = function(username,createDate,index,callback){
  
  try{
    //获取用户创建时间的年月日
    var date = Datex.formatBlock(createDate);
    //构造项目目录
    var projectPath = "public/user/"+date.year+"/"+date.month+"/"+date.day+"/"+username+"/project/"+index;
    //构造资源生成目录
    var projectPathR = projectPath+"/resource";
    //构造html生成目录
    var projectPathH = projectPath+"/html";
    //构造打包目录
    var zipPath = "public/user/"+date.year+"/"+date.month+"/"+date.day+"/"+username+"/zip/"+index;
    //构造打包zip名称(项目名_时间戳.zip)
    var zipName = zipPath+"/"+this.name+(new Date().getTime())+".zip";
    //构造zip下载路径，默认只替换一次，不会有风险
    var url = zipName.replace("public","");
    //前端基础组件目录
    var basicLib = "public/resource/web/lib";
    //前端基础模版文件
    var basicTemplate = "public/resource/web/template/template.html";

    //清空生成目录
    Filex.rmdirSync(projectPathR);
    Filex.rmdirSync(projectPathH);
    Filex.mkdirSync(projectPathR,0,function(err){
      if(err){
        console.log("@error:生成时用户工作空间创建失败！@params:"+projectPathR);
      }
    });
    Filex.mkdirSync(projectPathH,0,function(err){
      if(err){
        console.log("@error:生成时用户工作空间创建失败！@params:"+projectPathH);
      }
    });
    //清空打包目录
    Filex.rmdirSync(zipPath);
    Filex.mkdirSync(zipPath,0,function(err){
      if(err){
        console.log("@error:生成时用户工作空间创建失败！@params:"+zipPath);
      }
    });
    
    //解析项目数据
    var pd = JSON.parse(this.data);
    var html = "";
    
    //拷贝新的资源文件
    Filex.copy(basicLib,projectPathR,function(err){
      if(err){
        callback(null,err);
      }else{
        //读取前端基础模版内容
        //读取文件必须用回调，不能用返回值，因为是异步执行，用返回值拿到的是undefined
        Filex.readFile(basicTemplate,function(content,err){
          html = content;
          try{
            if(html){
              //移除根节点
              for(var i=0;i<pd.length;i++){
                if(pd[i].id == 1){
                  pd.splice(i,1);
                  break;
                }
              }
              //获取根节点的子节点
              var rootChilds = getChilds({id:1});
              
              //递归
              coreParse(projectPathH,rootChilds);
              
              //将项目打包成zip
              Zipx.toZip(projectPath,zipName);
              
              //回调
              callback(url,null);
            }else{
              callback(null,err);
            }
          }catch(err){
            callback(null,err);
          }
        });
      }
    });
  }catch(err){
    callback(null,err);
  }
  
  //项目生成核心递归方法
  //currentPath当前工作目录
  //nodes节点数组
  function coreParse(currentPath,nodes){
    for(var i=0;i<nodes.length;i++){
      var cn = nodes[i];
      
      //获取子节点
      var childs = getChilds(cn);
      //判断有没有子节点   
      if(childs.length == 0){
        //没有，说明是一个html文件，直接在当前路径下创建
        
        //定义数据容器
        var heightScales = [];
        var widthScales = [];
        var fixedScale_xs = [];
        var fixedScale_ys = [];
        var urls = [];
        var html_ = html;
        
        
        //设置页面标题，用正则是为了实现replaceAll
        html_ = html_.replace(/@title/gm,cn.name);
        //设置页面图片
        html_ = html_.replace("@imgData",cn.areaImg);
        //设置页面所有热区
        var areas = cn.areas;
        for(var k=0;k<areas.length;k++){
          var ca = areas[k];
          heightScales.push(ca.r_height);
          widthScales.push(ca.r_width);
          fixedScale_xs.push(ca.r_x);
          fixedScale_ys.push(ca.r_y);
          urls.push(ca.message);
        }
        html_ = html_.replace("@heightScale",JSON.stringify(heightScales));
        html_ = html_.replace("@widthScale",JSON.stringify(widthScales));
        html_ = html_.replace("@fixedScale_x",JSON.stringify(fixedScale_xs));
        html_ = html_.replace("@fixedScale_y",JSON.stringify(fixedScale_ys));
        html_ = html_.replace("@url",JSON.stringify(urls));
        
        //创建文件
        Filex.writeFile(currentPath+"/"+cn.name+".html",html_);
        
      }else{
        //有，说明是一个目录，继续递归
        coreParse(currentPath+"/"+cn.name,childs);
      }
    }
  }
  
  //获取某个节点的所有子节点
  //node节点对象
  function getChilds(node){
    var ns = [];
    //从项目数据中查找
    for(var i=0;i<pd.length;i++){
      if(pd[i].pId == node.id){
        ns.push(pd[i]);
      }
    }
    return ns;
  }
}

//根据名称查找项目
Project.get = function(name,callback){
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 projects 集合
    db.collection('projects', function (err, collection) {
      if (err) {
        mongodb.close();//关闭数据库
        return callback(err);//错误，返回 err 信息
      }

      //查找项目名（name键）值为 name 一个文档
      collection.findOne({
        name: name
      }, function(err, project){
        mongodb.close();//关闭数据库
        if (project) {
          return callback(null, project);//成功！返回查询的项目信息
        }
        callback(err);//失败！返回 err 信息
      });
    });
  });
};


