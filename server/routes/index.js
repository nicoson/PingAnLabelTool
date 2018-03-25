var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var multer  = require('multer');
const UPLOAD_PATH = './public/file/';
var upload = multer({ dest: UPLOAD_PATH })

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
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

router.post('/uploadimgs', upload.array('uploadimgs'), function(req, res, next) {
  const files  = req.files;
  let folder = req.body.foldername;
  console.log('=============í');
  console.log(files);
  console.log(folder);
  console.log('=============í');

  if(!fs.existsSync(`${UPLOAD_PATH}${folder}/`)) {
    fs.mkdirSync(`${UPLOAD_PATH}${folder}/`);
  }

  const result = new Promise((resolve, reject) => {
    files.map((v) => {
      fs.rename(v.path, `${UPLOAD_PATH}${folder}/${v.originalname}`, (err, data) => {
        if(err) reject(err);
        resolve('success');
      });
    });
  });

  result.then(r => {
    res.render('index');
  }).catch(err => {
    res.json({ err });
  });
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
  res.send(file.filter(e => e.indexOf('.json') > -1));
});

router.post('/getImglist', function(req, res, next) {
  let filedir = 'public/file/' + req.body.fileName;
  if(fs.existsSync(filedir)) {
    let file = fs.readdirSync('public/file/' + req.body.fileName);
    console.log(file);
    let conf = JSON.parse(fs.readFileSync('public/file/' + req.body.fileName + '.json'));
    console.log(conf);
    res.send({
      imgList: file,
      tmpName: conf.fileName
    });
  }
  res.send({
    imgList: [],
    tmpName: ''
  });
});

router.post('/getdetail', function(req, res, next) {
  let fileName = req.body.fileName;
  console.log(fileName);
  let data = fs.readFileSync('public/file/' + fileName + '.json');
  res.send(data);
});

router.post('/createnewclass', function(req, res, next) {
  console.log(req.body.fileName);
  console.log('public/file/' + req.body.fileName + '.json');
  if(req.body.fileName.length) {
    let fileName = 'public/file/' + req.body.fileName + '.json';
    if(!fs.existsSync(fileName)) {
      fs.writeFileSync(fileName, JSON.stringify({
        fileName: req.body.fileName,
        data: []
      }), 'utf8');
    }
  }
  res.send('done');
});

router.post('/submitseperate', function(req, res, next) {
  console.log(req.body.fileName);
  let labelFileDir = 'public/file/' + req.body.fileName + '.json';

  fs.writeFileSync(labelFileDir, JSON.stringify({
    fileName: req.body.tmpName,
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
