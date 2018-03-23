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


// =========================================
// second set
// =========================================
router.get('/getfilelist', function(req, res, next) {
  let file = fs.readdirSync('public/file/');
  console.log(file);
  res.send(file.filter(e => e.indexOf('.json')>-1));
});

router.post('/getdetail', function(req, res, next) {
  let fileName = req.body.fileName;
  console.log(fileName);
  let data = fs.readFileSync('public/file/' + fileName + '.json');
  res.send(data);
});

router.post('/submitseperate', function(req, res, next) {
  console.log(req.body.fileName);
  let imgFileName = req.body.fileName + '.png';
  let labelFileDir = 'public/file/' + req.body.fileName + '.json';

  console.log('img name: ',req.body.imgs);
  if(req.body.imgs != '') {
    var dataBuffer = new Buffer(req.body.imgs, 'base64');
    fs.writeFileSync("public/file/imgs/" + imgFileName, dataBuffer);
  }

  fs.writeFileSync(labelFileDir, JSON.stringify({
    fileName: req.body.fileName,
    data: req.body.data
  }), 'utf8');
  res.send('success');
});

router.post('/removeseperate', function(req, res, next) {
  let labelFile = 'public/file/' + req.body.fileName + '.json';
  let imgFileName = "public/file/imgs/" + req.body.fileName + '.png';
  fs.unlinkSync(labelFile);
  fs.unlinkSync(imgFileName);
  res.send('done');
});

module.exports = router;
