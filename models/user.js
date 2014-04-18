var mongodb = require('./db');
var Filex = require("./filex");
var Datex = require("./datex");

function User(user) {
  this.name = user.name;
  this.password = user.password;
  this.email = user.email;
  this.createDate = user.createDate;
};

module.exports = User;

//存储用户信息
User.prototype.save = function(callback) {

  //要存入数据库的用户文档
  var user = {
      name: this.name,
      password: this.password,
      email: this.email,
      createDate: this.createDate
  };

  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }

    //读取 users 集合
    db.collection('users', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);//错误，返回 err 信息
      }

      //将用户数据插入 users 集合
      collection.insert(user, {safe: true}, function (err, user) {
        mongodb.close();//关闭数据库
        
        //-----创建用户的工作空间------
        //项目生成资源目录：public/user/年/月/日/用户名/project/[1-3]/resource
        //项目生成html目录：public/user/年/月/日/用户名/project/[1-3]/html
        //项目打包目录：public/user/年/月/日/用户名/zip/[1-3]
        //前端基础组件目录：public/resource/web/lib
        //前端基础模版目录：public/resource/web/template
        //-----------------------------
        
        //获取用户创建时间的年月日
        var date = Datex.formatBlock(user[0].createDate);
        //构造生成目录
        var projectPath = "public/user/"+date.year+"/"+date.month+"/"+date.day+"/"+user[0].name+"/project/";
        //构造打包目录
        var zipPath = "public/user/"+date.year+"/"+date.month+"/"+date.day+"/"+user[0].name+"/zip/";
        //生成目录
        for(var i=1;i<4;i++){
          Filex.mkdirSync(projectPath+i+"/resource",0,function(err){
            if(err){
              console.log("@error:用户工作空间创建失败！@params:"+projectPath+i+"/resource");
            }
          });
          Filex.mkdirSync(projectPath+i+"/html",0,function(err){
            if(err){
              console.log("@error:用户工作空间创建失败！@params:"+projectPath+i+"/html");
            }
          });
          Filex.mkdirSync(zipPath+i,0,function(err){
            if(err){
              console.log("@error:用户工作空间创建失败！@params:"+zipPath+i);
            }
          });
        }
        callback(null);//成功！err 为 null
      });
    });
  });
};

//读取用户信息
User.get = function(name, callback) {

  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 users 集合
    db.collection('users', function (err, collection) {
      if (err) {
        mongodb.close();//关闭数据库
        return callback(err);//错误，返回 err 信息
      }

      //查找用户名（name键）值为 name 一个文档
      collection.findOne({
        name: name
      }, function(err, user){
        mongodb.close();//关闭数据库
        if (user) {
          return callback(null, user);//成功！返回查询的用户信息
        }
        callback(err);//失败！返回 err 信息
      });
    });
  });
};


