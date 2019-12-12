const express = require('express');
const app = express();
const path = require('path');
const execa = require('execa');
const fs = require('fs');

var 定价 = require('../pricing/设计盒/P00001_xxxx活动.js');

// let regexs = [
//   /[(\s=?:,;]require\s*(\s*'([^"'`]+)'\s*\)/,
//   /[(\s=?:,;]require\s*\(\s*"([^"'`]+)"\s*\)/,           
//   /[(\s=?:,;]require\s*\(`([^"'`]+)`\s*\)/,
// ];

app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("Content-Type", "application/json");
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/save', function (req, res) {
  req.on('data', function (data) {
    var obj = JSON.parse(data.toString());
    if (obj.code.indexOf(`require('fs')`) > 0 || obj.code.indexOf(`require("fs")`) > 0) {
      res.send('error_injection');
      return;
    }
    fs.writeFile(path.join(__dirname, '../pricing/设计盒/P00001_xxxx活动.js'), obj.code, function (err) {
      if (err) {
        console.log(err);
        res.send('error');
      } else {
        delete require.cache[require.resolve('../pricing/设计盒/P00001_xxxx活动.js')];
        定价 = require('../pricing/设计盒/P00001_xxxx活动.js');
        res.send('ok');
      }
    });
  });
});

app.get('/promotion', function (req, res) {
  fs.readFile(path.join(__dirname, '../pricing/设计盒/P00001_xxxx活动.js'), 'utf-8', function (err, data) {
    if (err) {
      res.send(console.error(err));
    }
    res.send(data.toString());
  });
});

app.get('/template_input', function (req, res) {
  var filename = path.join(__dirname, `../pricing/模板盒/${req.query.value}.json`);
  fs.exists(filename, function (exists) {
    if(exists) {
      fs.readFile(filename, 'utf-8', function (err, data) {
        if (err) {
          res.send(console.error(err));
        }
        res.send(data.toString());
      });
    } else {
      res.send('error');
    }
  });  
});

app.get('/autocompletion', function (req, res) {
  var filename = path.join(__dirname, `../pricing/模板盒/自动完成.json`);
  fs.exists(filename, function (exists) {
    if(exists) {
      fs.readFile(filename, 'utf-8', function (err, data) {
        if (err) {
          res.send(console.error(err));
        }
        res.send(data.toString());
      });
    } else {
      res.send('error');
    }
  });  
});

app.get('/template', function (req, res) {
  var filename = path.join(__dirname, `../pricing/模板盒/${req.query.value}.js`);
  fs.exists(filename, function (exists) {
    if(exists) {
      fs.readFile(filename, 'utf-8', function (err, data) {
        if (err) {
          res.send(console.error(err));
        }
        res.send(data.toString());
      });
    } else {
      res.send('// 没有找到相关模板');
    }
  });  
});


app.post('/calc', function (req, res) {
  req.on('data', function (data) {
    var bill = JSON.parse(data.toString());
    定价().计算(bill);
    res.send(bill);
  });
});

app.listen(3000, () => console.log('webapi listening on port http://127.0.0.1:3000/'));