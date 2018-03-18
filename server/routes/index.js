var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/check', function(req, res, next) {
  res.render('check', { title: 'Express' });
});

router.get('/getlist', function(req, res, next) {
  let file = fs.readFileSync('public/file/label.json');
  // console.log(file);
  res.send(file);
});

router.post('/getdetail', function(req, res, next) {
  let fileName = fs.readdirSync('public/file/');
  console.log(req.body.fileName);
  let data = fs.readFileSync('public/file/' + fileName);
  res.send(data);
});

router.post('/remove', function(req, res, next) {
  let labelFile = 'public/file/label.json';
  let odata = JSON.parse(fs.readFileSync(labelFile));
  console.log(odata);
  let ind = odata.findIndex(e => e.fileName == req.body.fileName);
  console.log(ind);
  if(ind > -1) {
    odata.splice(ind, 1);
    console.log(odata);
    fs.writeFileSync(labelFile, JSON.stringify(odata), 'utf8');
    console.log('odata');
    let fn = "public/file/imgs/" + req.body.fileName;
    fs.unlink("public/file/imgs/" + req.body.fileName);

    console.log('bb');
  }
  res.send('success');
});

router.post('/submit', function(req, res, next) {
  console.log(req.body.fileName);
  let fileName = req.body.fileName + '.png';
  let labelFile = 'public/file/label.json';

  let odata = JSON.parse(fs.readFileSync(labelFile));
  let ind = odata.findIndex(e => e.fileName == fileName);
  if(ind > -1) {
    odata[ind].data = req.body.data;
  } else {
    odata.push({
      fileName: fileName,
      data: req.body.data
    });
    
    var dataBuffer = new Buffer(req.body.imgs, 'base64');
    fs.writeFileSync("public/file/imgs/" + fileName, dataBuffer);
    res.send("保存成功！");
  }

  fs.writeFileSync(labelFile, JSON.stringify(odata), 'utf8');
  res.send('success');
});


module.exports = router;
