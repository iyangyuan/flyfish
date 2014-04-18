
//日期模块
function Datex(){}

module.exports = Datex;

//提取时间中的年(year)月(month)日(day)
Datex.formatBlock = function(d){
  var date = new Date(d);
  var ymd = {
    "year": date.getFullYear(),
    "month": date.getMonth()+1,
    "day": date.getDate()
  };
  
  return ymd;
}
