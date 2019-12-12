const fs = require('fs');
const path = require("path");

var src = path.join(__dirname, '../../pricing/模板盒/P00001_xxxx活动.js');
var dest = path.join(__dirname, '../static/test.txt');

console.log(src);
console.log(dest);

fs.copyFile(src, dest, err => {
  if(err) {
    console.log('测试文件复制失败.');
    console.log(err);
  } else {
    console.log('测试文件复制成功.');
  }
});

