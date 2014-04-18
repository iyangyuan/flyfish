//引用express框架
var express = require("express");
//引用handlebars模版引擎
var hbs = require("hbs");
//引用加密模块
var crypto = require("crypto");
//引用用户模型
var User = require("./models/user.js");
//引用项目模型
var Project = require("./models/project.js");
//引用http响应封装
var Res = require("./models/res.js");
//生成框架实例
var app = express();

//基础模块引用
app.use(express.favicon(__dirname + '/public/favicon.ico', { maxAge: 2592000000 }));
app.use(express.limit(10240000)); //请求数据大小限制10M
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.methodOverride());
app.use(express.bodyParser({limit: '10mb'})); //请求数据大小限制10M
app.use(express.cookieParser());
app.use(express.session({secret:'poynt',cookie:{path:'/',httpOnly:true,maxAge:43200000}}));
//设置html文件目录
app.set('views', __dirname + '/views');
//指定静态资源目录，所有非html请求都会在该目录下查找
app.use(express.static(__dirname + "/public"));
//指定模板文件的后缀名为html
app.set("view engine","html");
// 运行hbs模块
app.engine('html', hbs.__express);

//登录拦截
app.use(function(request,response,next){
  var path = request.path;
  //判断访问路径
  if(path == "/" || path == "/login" || path == "/reg" || path == "/status"){
    //主页、登录页、注册页、状态页，可以直接访问
    next();
  }else{
    //其他页面均需登录之后访问
    if(request.session.user){
      next();
    }else{
      Res.sendPlain(response,403,"骚年，登录之后才可以访问哦~");
    }
  }
});

//路由
app.use(app.router);

//主页
app.get("/",function(request,response){
  response.render("index");
});

//注册用户
app.post("/reg",function(request,response){
  
  //比较两次密码是否一致
  if(request.body.password == request.body.password_){
    //生成密码md5
    var md5 = crypto.createHash('md5');
    var password = md5.update(request.body.password).digest('hex');
    //创建用户对象
    var user = new User({
      "name": request.body.username,
      "password": password,
      "email": request.body.email,
      "createDate": new Date().getTime()
    });
    //检查用户是否存在
    User.get(user.name,function(err,callbackUser){
      if(callbackUser){
        Res.sendPlain(response,500,"该用户已经存在！");
        return;
      }
      //如果不存在，添加用户
      user.save(function(err){
        if(err){
          Res.sendPlain(response,500,err);
          return;
        }
        //将用户信息写入session
        request.session.user = user;
        
        Res.sendJson(response,200,"{\"msg\":\"注册成功！\"}");
      });
    });
    
  }else{
    Res.sendPlain(response,500,"两次输入密码不一致！");
  }
  
});

//登录
app.post("/login",function(request,response){
  
  //查询用户
  User.get(request.body.username,function(err,callbackUser){
    if(callbackUser){
      //查询到了判断密码是否一致
      var md5 = crypto.createHash('md5');
      var password = md5.update(request.body.password).digest('hex');
      if(password == callbackUser.password){
        //登录成功
        //将用户信息写入session
        request.session.user = callbackUser;
        Res.sendJson(response,200,"{\"msg\":\"登录成功！\"}");
      }else{
        //密码不正确
        Res.sendPlain(response,500,"用户名或密码不正确！");
      }
    }else{
      //用户名不存在，不提示用户名不存在，防止遍历用户名
      Res.sendPlain(response,500,"用户名或密码不正确！");
    }
  });
  
});

//登出
app.get("/logout",function(request,response){
  //清空session信息
  request.session.user = null;
  //返回信息
  Res.sendPlain(response,200,"");
});

//获取登录状态
app.get("/status",function(request,response){
  var user = {};
  user.username = "";
  //判断是否登录
  if(request.session.user){
    //获取登录信息
    user.username = request.session.user.name;
  }
  //返回信息
  Res.sendJson(response,200,JSON.stringify(user));
});

//FlyFish简介
app.get("/help/whatMe",function(request,response){
  response.render("help/whatMe");
});

//使用说明
app.get("/help/useMe",function(request,response){
  response.render("help/useMe");
});

//关于
app.get("/help/aboutMe",function(request,response){
  response.render("help/aboutMe");
});

//保存
app.post("/save/:index",function(request,response){
  //获取请求参数
  var index = request.params.index;
  var data = request.body.data;
  
  //判断项目索引是否合法
  if(/^[1-3]$/.test(index)){
    //构造项目名称
    //项目名称 = 用户名+"_1"
    var name = request.session.user.name + "_" + index;
    
    //创建项目对象
    var project = new Project(name,data);
    
    //判断是否保存过
    Project.get(name,function(err,callbackProject){
      if(callbackProject){
        //保存过，更新
        project.update(function(err){
          //判断是否更新成功
          if(!err){
            //成功
            Res.sendJson(response,200,"{\"msg\":\"保存成功！\"}");
          }else{
            //失败
            Res.sendPlain(response,500,err);
          }
        });
      }else{
        //未保存过，直接保存
        project.save(function(err){
          //判断是否保存成功
          if(!err){
            //成功
            Res.sendJson(response,200,"{\"msg\":\"保存成功！\"}");
          }else{
            //失败
            Res.sendPlain(response,500,err);
          }
        });
      }
    });
  }else{
    Res.sendPlain(response,500,"保存位置不合法！骚年，是在尝试xss注入吗？");
  }
});

//打开
app.get("/open/:index",function(request,response){
  //获取请求参数
  var index = request.params.index;
  
  //判断项目索引是否合法
  if(/^[1-3]$/.test(index)){
    //构造项目名称
    var name = request.session.user.name + "_" + index;
    
    //查找项目
    Project.get(name,function(err,callbackProject){
      if(callbackProject){
        
        //找到，返回数据
        Res.sendPlain(response,200,callbackProject.data);
      }else{
        //未找到，提示错误
        Res.sendPlain(response,500,"此位置还未保存过项目！");
      }
    });
  }else{
    Res.sendPlain(response,500,"保存位置不合法！骚年，是在尝试xss注入吗？");
  }
});

//生成
app.get("/build/:index",function(request,response){
  //获取请求参数
  var index = request.params.index;
  
  //判断项目索引是否合法
  if(/^[1-3]$/.test(index)){
    //构造项目名称
    var name = request.session.user.name + "_" + index;
    
    //查找项目
    Project.get(name,function(err,callbackProject){
      if(callbackProject){
        
        //创建项目对象
        var project = new Project(callbackProject.name,callbackProject.data);
        
        //生成项目
        project.build(request.session.user.name,
        request.session.user.createDate,
        index,
        function(url,err){
          //判断是否生成成功
          if(url){
            //成功，返回下载链接
            Res.sendJson(response,200,"{\"url\":\""+url+"\"}");
          }else{
            //失败，返回错误信息
            Res.sendPlain(response,500,err.toString());
          }
        });
      }else{
        //未找到，提示错误
        Res.sendPlain(response,500,"此位置还未保存过项目！");
      }
    });
    
  }else{
    Res.sendPlain(response,500,"保存位置不合法！骚年，是在尝试xss注入吗？");
  }
  
});




//指定应用端口
app.listen(80);


