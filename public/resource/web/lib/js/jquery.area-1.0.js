(function($){
  $.fn.area = function(options){
    options = options || {};
    //系统参数
    var params = {
      //*热区高度与图片高度的百分比
      heightScale : [],
      //*热区宽度与图片宽度的百分比
      widthScale : [],
      //*热区距离图片左上角的x方向偏移百分比
      fixedScale_x : [],
      //*热区距离图片左上角的y方向偏移百分比
      fixedScale_y : [],
      //*热区对应页面的url
      url : [],
      //热区html模版
      areaHtmlHandle : "<div class='area' area-url='@url' tabindex='0' style='left:@leftpx;top:@toppx;width:@widthpx;height:@heightpx;'></div>",
      //热区html临时缓冲区
      areaHtml : "",
      //浏览器可视区域的高度
      winHeight : 0,
      //浏览器可视区域的宽度
      winWidth : 0,
      //热区的高度
      areaHeight : 0,
      //热区的宽度
      areaWidth : 0,
      //热区距离图片左上角的x方向偏移
      fixed_x : 0,
      //热区距离图片左上角的y方向偏移
      fixed_y : 0,
      //运算精度，精确到万分位
      scaleBase : 10000
    };
    //将传过来的参数填充到系统参数中
    for(key in options){
      params[key] = options[key];
    }
    
    //热区定位核心函数
    var core = function core(){
      //获取浏览器可视区域的宽高
      params["winHeight"] = $(window).height();
      params["winWidth"] = $(window).width();
      
      //移除所有旧热区
      $("div[class='area']").each(function(i,n){
        $(n).remove();
      });
      //遍历所有热区
      $.each(params["heightScale"],function(i,n){
        //计算热区位置、宽高
        params["areaWidth"] = params["widthScale"][i]*params["winWidth"]/params["scaleBase"];
        params["areaHeight"] = params["heightScale"][i]*params["winHeight"]/params["scaleBase"];
        params["fixed_x"] = params["fixedScale_x"][i]*params["winWidth"]/params["scaleBase"];
        params["fixed_y"] = params["fixedScale_y"][i]*params["winHeight"]/params["scaleBase"];
        //构造热区html
        params["areaHtml"] = params["areaHtmlHandle"].replace("@url",params["url"][i]);
        params["areaHtml"] = params["areaHtml"].replace("@left",params["fixed_x"]);
        params["areaHtml"] = params["areaHtml"].replace("@top",params["fixed_y"]);
        params["areaHtml"] = params["areaHtml"].replace("@width",params["areaWidth"]);
        params["areaHtml"] = params["areaHtml"].replace("@height",params["areaHeight"]);
        //添加热区
        $("#area_content").append(params["areaHtml"]);
      });
      //热区url跳转
      $(".area").click(function(){
        window.location = $(this).attr("area-url");
      });
    };
    //页面加载完成事件
    $(window).load(function(){
      core();
    });
    //页面可视区域大小变化事件
    $(window).resize(function(){
      core();
    });
  }
})(jQuery);