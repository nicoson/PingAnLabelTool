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
  console.log(req.body.data);
  console.log(req.body.folder);
  let filedir = "public/file/" + req.body.folder + '/label.json';

  fs.writeFileSync(filedir, JSON.stringify(req.body.data), 'utf8');
  res.send('success');
});


// =========================================
// second set
// =========================================
router.get('/getfilelist', function(req, res, next) {
  let file = fs.readdirSync('public/file/');
  console.log(file);
  res.send(file);
});

router.post('/getImgList', function(req, res, next) {
  let filedir = 'public/file/' + req.body.dirname + '/label.json';
  console.log(filedir);
  let data = [];
  if(fs.existsSync(filedir)) {
    console.log('... ... reading label.json');
    data = JSON.parse(fs.readFileSync(filedir, 'utf8'));
    console.log(data);
  }

  let imgList = fs.readdirSync('public/file/' + req.body.dirname);
  imgList = imgList.filter(e => e != 'label.json' && e != '.DS_Store');
  console.log(imgList);

  let result = imgList.map(e => {
    let ind = data.findIndex(datum => datum.url == ('/file/' + req.body.dirname + '/' + e));
    console.log(ind, ('/file/' + req.body.dirname + '/' + e));
    if(ind > -1) {
      return {
        url: '/file/' + req.body.dirname + '/' + e,
        data: data[ind].data
      }
    } else {
      return {
        url: '/file/' + req.body.dirname + '/' + e,
        data: []
      }
    }
  })
  console.log(result);
  
  res.send(result);
});

router.post('/submitseperate', function(req, res, next) {
  console.log(req.body.fileName);
  let imgFileName = req.body.fileName + '.png';
  let labelFileDir = 'public/file/' + req.body.fileName + '.json';

  console.log('img name: ',req.body.imgs);
  if(req.body.imgs != '') {
    console.log(req.body.imgs);
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
