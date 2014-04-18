//数组中根据id查找元素
Array.prototype.getById = function(id){
  for(var i=0;i<this.length;i++){
    if(this[i].id == id){
      return this[i];
    }
  }
  return null;
};
//数组中根据id移除元素
Array.prototype.rmById = function(id){
  for(var i=0;i<this.length;i++){
    if(this[i].id == id){
      this.splice(i,1);
      break;
    }
  }
};
//通用普通信息提示框封装
//title提示框标题
//content提示框内容
function areaAlert(title,content){
  //修改ui容器数据
  $("#commonAlertLabel").text(title);
  $("#commonAlertBody").text(content);
  //显示
  $("#commonAlert").modal("show");
}
//通用异步加载信息提示框封装
//title提示框标题
//url提示框内容加载地址
function areaAlertAsync(title,url){
  //修改ui容器标题
  $("#commonAlertLabel").text(title);
  //修改ui容器内容(进度条)
  var progressTemplate = 
  "<div class='progress progress-striped active'>"+
    "<div class='progress-bar'  role='progressbar' aria-valuenow='100' aria-valuemin='0' aria-valuemax='100' style='width: 100%'>"+
      "<span class='sr-only'></span>"+
    "</div>"+
  "</div>";
  $("#commonAlertBody").html(progressTemplate);
  //显示
  $("#commonAlert").modal("show");
  //请求真实内容
  //为了防止请求失败导致永远显示加载条，需要设置回调函数
  $("#commonAlertBody").load(url,function(resonse,status,xhr){
    //判断是否请求成功
    if(xhr.status != 200){
      //请求不成功直接写入响应码和响应文本
      //xhr即XMLHttpReqeust对象
      $("#commonAlertBody").html(xhr.status+"："+xhr.responseText);
    }
  });
}
//通用等待信息提示框封装
//show参数控制显示/隐藏，分别传入show/hide
function areaAlertWatting(show){
  $("#wattingModal").modal(show);
}
//通用确认提示框封装
//确认类
var c_confirm = {
  callback:function(){},
  val:""
};
//执行确认类
function areaConfirmExec(){
  c_confirm.callback();
}
//对外接口
//title提示框标题
//content提示框内容
//callback确认操作回调函数
//val确认操作回调函数参数，可以在回调函数中用this.val访问
function areaConfirm(title,content,callback,val){
  //用确认类进行数据封装
  c_confirm.callback=callback;
  c_confirm.val = val;
  //修改ui容器数据
  $("#commonConfirmLabel").text(title);
  $("#commonConfirmBody").text(content);
  //显示
  $("#commonConfirm").modal("show");
}
//通用ajax表单提交验证方法，最大程度兼容html5 form表单提交
//tags需要验证的表单元素数组，只针对input、textarea标签
//通过标签的required属性判断元素是否为必填(必选)，优先级高于pattern
//通过标签的pattern属性获取验证的正则表达式，然后进行验证
//通过标签的data-group属性获取组，同一组内的所有值应相同，组名以字母开头，应用场景：两次输入密码一致
function validateForm(tags){
  var result = true;
  
  //遍历-移除所有错误样式
  for(var i=0;i<tags.length;i++){
    $(tags[i]).removeClass("has-error-extend");
  }
  
  //遍历-验证必填(必选)项
  for(var i=0;i<tags.length;i++){
    var s = $(tags[i]);
    //判断是否有required属性
    if(s.attr("required")){
      //判断是否为checkbox或radio元素
      if(s.attr("type") == "checkbox" || s.attr("type") == "radio"){
        //判断是否选中
        if(!s.attr("checked")){
          //没有选中，添加错误样式
          s.addClass("has-error-extend");
          //结果标记为false
          result = false;
        }
      }else{
        //判断是否有值
        if(s.val() == ""){
          //没有值，添加错误样式
          s.addClass("has-error-extend");
          //结果标记为false
          result = false;
        }
      }
    }
  }
  
  //遍历-验证表达式
  for(var i=0;i<tags.length;i++){
    var s = $(tags[i]);
    //获取验证表达式
    var regText = s.attr("pattern");
    //判断是否有验证表达式
    if(regText){
      //有表达式，则创建正则对象，进行验证(忽略为空的情况)
      var reg = new RegExp(regText);
      if(!reg.test(s.val()) && s.val()!=""){
        //验证不通过，添加错误样式
        s.addClass("has-error-extend");
        //结果标记为false
        result = false;
      }
    }
  }
  
  //遍历-验证组
  var group = {};
  for(var i=0;i<tags.length;i++){
    var s = $(tags[i]);
    //判断有无组属性
    var groupName = s.attr("data-group");
    if(groupName){
      //判断属性值是否存过
      var groupValue = group[groupName];
      if(groupValue){
        //保存过判断当前值与保存的值是否相等
        if(groupValue != s.val()){
          //不相同添加错误样式
          s.addClass("has-error-extend");
          //结果标记为false
          result = false;
        }
      }else{
        //没存过直接保存
        group[groupName] = s.val();
      }
    }
  }

  return result;
}

//获取IE6~IE9版本号
//如果获取到，直接返回对应数字，获取不到返回false
var _OLD_IE = (function(){
    var v = 3, div = document.createElement('div'), all = div.getElementsByTagName('i');
    while (
        div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
        all[0]
    );
    return v > 4 ? v : false ;
}());

