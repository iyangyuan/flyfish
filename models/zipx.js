var fs = require("fs");
var archiver = require("archiver");

function Zipx(){}

module.exports = Zipx;

//压缩文件/文件夹到指定压缩文件
//source文件/文件夹路径
//zipPath压缩包路径
Zipx.toZip = function(source,zipPath){
  var output = fs.createWriteStream(zipPath);
  var archive = archiver('zip');

  output.on('close', function() {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  archive.on('error', function(err) {
    throw err;
  });

  archive.pipe(output);
  
  //src这样配置才能获取source目录下的所有文件、文件夹(包括子目录)
  archive.bulk([
    { expand: true, cwd: source, src: ['**/*'] }
  ]);

  archive.finalize();
}


