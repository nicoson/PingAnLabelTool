class NiuArray extends Array {
    constructor(...args) {
        super(...args);
        this.Container = document.querySelector("#qiniu_tm_contentfiller");
    }
    push (...args) {
        // console.log('trigger push listener');
        super.push(...args)
        refreshList(this.Container, DATA);
        return this
    }
    splice (...args) {
        // console.log('trigger splice listener');
        super.splice(...args)
        refreshList(this.Container, DATA);
        return this
    }
}

let labeltool = null;
// let FILENAME = null;
let DATA = null;    //new NiuArray();  //  2-way binding page data
let LIST = null;
let isNew = true;
// DATA.addContainer(document.querySelector("#qiniu_tm_contentfiller"));

window.onload = function() {
    reloadLabelTool();  //  re-initiate label tool
    refreshSelector();  //  refresh the select list

    // binding change event for image container
    document.querySelector("#qiniu_tm_imgcontainer").hidden = true;
    document.querySelector('#qiniu_tm_imgselector').addEventListener('change', function(e) {
        if(e.target.files.length) {
            let namelist = [];
            for(let i=0; i<e.target.files.length; i++) {
                namelist.push(e.target.files[i].name);

                let imgURL = window.URL.createObjectURL(e.target.files[i]);
                let img = new Image();
                img.src = imgURL;
                let imgData = getBase64Image(img);
            }
    
            document.querySelector('#qiniu_tm_uploadimg_label').textContent = namelist.join('; ');
        }
    });

    checkTrainingStatus();
    setInterval(checkTrainingStatus, 30000);
}

function checkTrainingStatus () {
    fetch('http://0.0.0.0:7890/trainingstatus').then(e => e.json()).then(e => {
        if(e.status == 0) {
            document.querySelector('#qiniu_tm_class_training').textContent = '开始训练';
            document.querySelector('#qiniu_tm_class_training').removeAttribute('disabled');
        } else {
            document.querySelector('#qiniu_tm_class_training').textContent = '模型训练中... ...';
            document.querySelector('#qiniu_tm_class_training').setAttribute('disabled', 'disabled');
        }
    });
}

function reloadLabelTool() {
    if(labeltool) labeltool.destory();
    document.querySelector("#qiniu_tm_contentfiller").innerHTML = '';
    DATA = new NiuArray();  //  2-way binding page data
    let svgContainer = document.querySelector('#qiniu_tm_imgmarker');
    let imgContainer = document.querySelector('#qiniu_tm_img');
    labeltool = new labelTool(svgContainer, imgContainer, DATA);
}

function refreshList (Container, data) {
    let tmp = '';
    data.forEach(function(datum){
        tmp +=  `<div class="card bg-light ${datum.isKey ? 'text-primary border-primary' : 'text-success border-success'} mb-3">
                    <div class="card-header">
                        ${(datum.isKey ? 'Key: ' : 'Value: ') + datum.id}
                        <button type="button" class="close" aria-label="Close">
                            <span aria-hidden="true" class="js-qiniu-tm-tab-remove" data-id="${datum.id || ''}">&times;</span>
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="form-group row">
                            <label class="col-sm-2 col-form-label">名称</label>
                            <div class="col-sm-4">
                                <input type="text" class="form-control js-qiniu-tm-focus" placeholder="standard name" data-item="standard_name" data-id="${datum.id || ''}" value="${datum.standard_name || ''}" ／>
                            </div>
                            <label class="col-sm-2 col-form-label">类型</label>
                            <div class="col-sm-4">
                                <select class="custom-select js-qiniu-tm-focus"  data-id="${datum.id || ''}"  data-item="classtype" value="${datum.classtype || ''}">
                                    <option value="key" ${datum.classtype == 'key' ? 'selected':''}>关键词</option>
                                    <option value="title" ${datum.classtype == 'title' ? 'selected':''}>主标题</option>
                                    <option value="subtitle" ${datum.classtype == 'subtitle' ? 'selected':''}>副标题</option>
                                    <option value="contenttype" ${datum.classtype == 'contenttype' ? 'selected':''}>内容类型</option>
                                </select>    
                            </div>
                        </div>
                        <div class="form-group row">
                            <label class="col-sm-2 col-form-label">内容*</label>
                            <div class="col-sm-4">
                                <input type="text" class="form-control js-qiniu-tm-focus" placeholder="content" data-item="content" data-id="${datum.id || ''}" value="${datum.content || ''}" ／>
                            </div>
                            <label class="col-sm-2 col-form-label">权重</label>
                            <div class="col-sm-4">
                                <input type="number" class="form-control js-qiniu-tm-focus" name="quantity" min="1" max="5" data-item="weight" data-id="${datum.id || ''}" value="${datum.weight || 1}" />
                            </div>
                        </div>
                        <div class="form-group row">
                            <label class="col-sm-2 col-form-label">同义词</label>
                            <div class="col-sm-10">
                            <input type="text" class="form-control js-qiniu-tm-focus" placeholder="prob_names" data-item="prob_names" data-id="${datum.id || ''}" value="${datum.prob_names || ''}" ／>
                            </div>
                        </div>
                    </div>
                </div>`;
    });
    Container.innerHTML = tmp;

    document.querySelectorAll(".js-qiniu-tm-focus").forEach(ele => ele.addEventListener("focus", function(e) {
        let ind = DATA.findIndex(t => t.id == e.target.dataset.id);
        let className = DATA[ind].node.getAttribute('class') + ' qiniu-tm-selecthover-on';
        DATA[ind].node.setAttribute('class', className);
    }));

    document.querySelectorAll(".js-qiniu-tm-focus").forEach(ele => ele.addEventListener("blur", function(e) {
        let ind = DATA.findIndex(t => t.id == e.target.dataset.id);
        let className = DATA[ind].node.getAttribute('class').replace(' qiniu-tm-selecthover-on', '');
        DATA[ind].node.setAttribute('class', className);
    }));

    document.querySelectorAll(".js-qiniu-tm-focus").forEach(ele => ele.addEventListener("change", function(e) {
        let ind = DATA.findIndex(t => t.id == e.target.dataset.id);
        DATA[ind][e.target.dataset.item] = e.target.value;
    }));

    document.querySelectorAll(".js-qiniu-tm-tab-remove").forEach(ele => ele.addEventListener("click", function(e) {
        let ind = DATA.findIndex(t => t.id == e.target.dataset.id);
        DATA[ind].node.remove();
        DATA.splice(ind, 1);
    }));
}

//  binding box status
document.querySelectorAll('#qiniu_tm_detailpanel_toolbox label')[0].addEventListener("click", function(e) {
    document.querySelectorAll('polygon').forEach(e => e.removeEventListener('click', setKeyFun));
    document.querySelectorAll('polygon').forEach(e => e.removeEventListener('click', setValueFun));
});

//  binding key status
document.querySelectorAll('#qiniu_tm_detailpanel_toolbox label')[1].addEventListener("click", function(e) {
    document.querySelectorAll('polygon').forEach(e => e.addEventListener('click', setKeyFun));
    document.querySelectorAll('polygon').forEach(e => e.removeEventListener('click', setValueFun));
});

//  binding value status
document.querySelectorAll('#qiniu_tm_detailpanel_toolbox label')[2].addEventListener("click", function(e) {
    document.querySelectorAll('polygon').forEach(e => e.addEventListener('click', setValueFun));
    document.querySelectorAll('polygon').forEach(e => e.removeEventListener('click', setKeyFun));
});

document.querySelector("#qiniu_tm_createnewclass").addEventListener("click", function(e) {
    $('#qiniu_tm_createnewclass_modal').modal('toggle');
});

document.querySelector("#qiniu_tm_class_delete").addEventListener("click", function(e) {
    let conf = confirm("您确定要删除这个分类及其所有样本数据吗？");
        if(conf == true) {
        let postBody = {
            headers: { 
                "Content-Type": "application/json"
            },
            method: 'POST',
            body: JSON.stringify({'fileName': document.querySelector('#qiniu_tm_chooseclass').value})
        }

        fetch('deleteclass', postBody).then(e => {
            console.log(e);
            localStorage.removeItem('chosenclass');
            refreshSelector();
            // $('#qiniu_tm_createnewclass_modal').modal('toggle');
        });
    }
});

document.querySelector('#qiniu_tm_createnewclass_submit').addEventListener('click', function(e) {
    let postBody = {
        headers: { 
            "Content-Type": "application/json"
        },
        method: 'POST',
        body: JSON.stringify({'fileName': document.querySelector('#qiniu_tm_templatename').value})
    }

    fetch('createnewclass', postBody).then(e => {
        console.log(e);
        refreshSelector();
        $('#qiniu_tm_createnewclass_modal').modal('toggle');
    });
});

document.querySelector('#qiniu_tm_chooseclass').addEventListener("change", function(e) {
    localStorage.setItem('chosenclass', e.target.value);
    refreshImgList();
});

document.querySelector('#qiniu_tm_class_training').addEventListener("click", function(e) {
    let conf = confirm("训练过程将耗时30分钟，确定要开启新的训练？");
    if(conf == true) {
        fetch('/saveouttrainingconf').then(e => {
            fetch('http://0.0.0.0:7890/starttraining').then(e => {
                document.querySelector('#qiniu_tm_class_training').textContent = '模型训练中... ...';
                document.querySelector('#qiniu_tm_class_training').setAttribute('disabled', 'disabled');
            });
        });
    }
});

function refreshImgList() {
    let postBody = {
        headers: { 
            "Content-Type": "application/json"
        },
        method: 'POST',
        body: JSON.stringify({'fileName': document.querySelector('#qiniu_tm_chooseclass').value})
    }

    fetch('getImglist', postBody).then(e => e.json()).then(data => {
        let tmp = "";
        if(data.imgList.length) {
            tmp = data.imgList.map(datum => {
                return `<li class="list-group-item qiniu-tm-listitem-choose ${(datum == data.tmpName)?'list-group-item-success':''}" data-filename="${datum || ''}">
                            ${datum} ${(datum == data.tmpName)?'（标准模版）':''}
                            <button type="button" class="close" aria-label="Close">
                                <span aria-hidden="true" class="js-qiniu-tm-listitem-remove" data-filename="${datum || ''}">&times;</span>
                            </button>
                        </li>`
            });
            tmp = tmp.join('');
        }
        document.querySelector('#qiniu_tm_listcontainer_list ul').innerHTML = tmp;

        document.querySelectorAll(".js-qiniu-tm-listitem-remove").forEach(ele => ele.addEventListener("click", function(e) {
            e.stopPropagation();
            e.preventDefault();
            let conf = confirm("您确定要删除这个模版吗？");
            if(conf == true) {
                let postBody = {
                    headers: { 
                        "Content-Type": "application/json"
                    },
                    method: 'POST',
                    body: JSON.stringify({
                        'className': document.querySelector('#qiniu_tm_chooseclass').value,
                        'fileName': e.target.dataset.filename
                    })
                }
    
                fetch('/removeimg', postBody).then(function (response) {
                    console.log('response: ', response);
                    refreshImgList();
                });
            }
        }));

        document.querySelectorAll(".qiniu-tm-listitem-choose").forEach(ele => ele.addEventListener("click", function(e) {
            let fileName = e.target.dataset.filename;
            if(e.target.getAttribute('class').indexOf('list-group-item-success') > -1){
                let postBody = {
                    headers: { 
                        "Content-Type": "application/json"
                    },
                    method: 'POST',
                    body: JSON.stringify({'fileName': document.querySelector('#qiniu_tm_chooseclass').value})
                }
    
                fetch('getdetail', postBody).then(e => e.json()).then(e => {
                    e.data.forEach(e => DATA.push(e));
                    let imgURL = '/file/imgs/' + document.querySelector('#qiniu_tm_chooseclass').value + '/' + fileName;
                    document.querySelector('#qiniu_tm_img').src = imgURL;
                    let promise = labeltool.init(imgURL);
                    promise.then(e => {
                        let svgContainer = document.querySelector('#qiniu_tm_imgmarker');
                        let imgContainer = document.querySelector('#qiniu_tm_img');
                        svgContainer.style.height = imgContainer.clientHeight;
                        labeltool.inputBBox(DATA)
                    });
                });
            } else {
                let imgURL = '/file/imgs/' + document.querySelector('#qiniu_tm_chooseclass').value + '/' + fileName;
                document.querySelector('#qiniu_tm_img').src = imgURL;
                let promise = labeltool.init(imgURL);
                promise.then(e => {
                    let svgContainer = document.querySelector('#qiniu_tm_imgmarker');
                    let imgContainer = document.querySelector('#qiniu_tm_img');
                    svgContainer.style.height = imgContainer.clientHeight;
                    labeltool.inputBBox(DATA)
                });
            }
            
            

            document.querySelector("#qiniu_tm_listcontainer").hidden = true;
            document.querySelector("#qiniu_tm_imgcontainer").hidden = false;
            document.querySelector('#qiniu_tm_detailpanel_btngroup_cancel').removeAttribute('disabled');
            document.querySelector('#qiniu_tm_detailpanel_btngroup_submit').removeAttribute('disabled');
            document.querySelector('#qiniu_tm_imgcontainer_title_classname').innerHTML = document.querySelector('#qiniu_tm_chooseclass').value;
            document.querySelector('#qiniu_tm_imgcontainer_title_filename').innerHTML = fileName;
 
        }));
    });
}

function setKeyFun(e) {
    e.stopPropagation();
    e.preventDefault();
    
    let ind = DATA.findIndex(t => t.id == e.target.dataset.id);
    DATA[ind].isKey = true;
    DATA[ind].node.setAttribute('stroke', '#1E90FF');
    DATA[ind].node.setAttribute('fill', '#1E90FF');
    refreshList(document.querySelector("#qiniu_tm_contentfiller"), DATA);
}

function setValueFun(e) {
    e.stopPropagation();
    e.preventDefault();

    let ind = DATA.findIndex(t => t.id == e.target.dataset.id);
    DATA[ind].isKey = false;
    DATA[ind].node.setAttribute('stroke', '#28a745');
    DATA[ind].node.setAttribute('fill', '#28a745');
    refreshList(document.querySelector("#qiniu_tm_contentfiller"), DATA);
}

function refreshSelector() {
    fetch('/getfilelist').then(e => e.json()).then(function(data) {
        let tmp = data.map(datum => {
            datum = datum.replace('.json', '');
            return `<option value="${datum}">${datum}</option>`
        });
        document.querySelector('#qiniu_tm_chooseclass').innerHTML = tmp.join('');
        if(localStorage.getItem('chosenclass')) {
            document.querySelector('#qiniu_tm_chooseclass').value = localStorage.getItem('chosenclass');
        }
        refreshImgList();
    });
}

function loadPageServer () {
    fetch('/getfilelist').then(e => e.json()).then(function(data) {
        LIST = data;
        let tmp = data.map(datum => {datum = datum.replace('.json', ''); return `<li class="list-group-item qiniu-tm-listitem-choose" data-filename="${datum || ''}">
                                            ${datum}
                                            <button type="button" class="close" aria-label="Close">
                                                <span aria-hidden="true" class="js-qiniu-tm-listitem-remove" data-filename="${datum || ''}">&times;</span>
                                            </button>
                                        </li>`});
        document.querySelector('#qiniu_tm_listcontainer_list ul').innerHTML = tmp.join('');

        document.querySelectorAll(".js-qiniu-tm-listitem-remove").forEach(ele => ele.addEventListener("click", function(e) {
            e.stopPropagation();
            e.preventDefault();
            let conf = confirm("您确定要删除这个模版吗？");
            if(conf == true) {
                let postBody = {
                    headers: { 
                        "Content-Type": "application/json"
                    },
                    method: 'POST',
                    body: JSON.stringify({'fileName': e.target.dataset.filename})
                }
    
                fetch('/removeseperate', postBody).then(function (response) {
                    console.log('response: ', response);
                    location.reload();
                });
            }
        }));

        document.querySelectorAll(".qiniu-tm-listitem-choose").forEach(ele => ele.addEventListener("click", function(e) {
            let fileName = e.target.dataset.filename;
            let postBody = {
                headers: { 
                    "Content-Type": "application/json"
                },
                method: 'POST',
                body: JSON.stringify({'fileName': fileName})
            }

            fetch('getdetail', postBody).then(e => e.json()).then(e => {
                e.data.forEach(e => DATA.push(e));
                isNew = false;
                document.querySelector('#qiniu_tm_templatename').value = fileName;
                let imgURL = '/file/imgs/' + fileName + '.png';
                document.querySelector('#qiniu_tm_img').src = imgURL;
                let promise = labeltool.init(imgURL);

                document.querySelector("#qiniu_tm_listcontainer").hidden = true;
                document.querySelector("#qiniu_tm_imgcontainer").hidden = false;

                promise.then(e => labeltool.inputBBox(DATA));
            });
            // let ind = LIST.findIndex(e => e.fileName == fileName);
            // if(ind > -1) {
            //     LIST[ind].data.forEach(e => DATA.push(e));

            //     isNew = false;
            //     document.querySelector('#qiniu_tm_templatename').value = fileName.slice(0,-4);
            //     document.querySelector('#qiniu_tm_img').src = '/file/imgs/' + fileName;
            //     let promise = labeltool.init('/file/imgs/' + fileName);

            //     document.querySelector("#qiniu_tm_listcontainer").hidden = true;
            //     document.querySelector("#qiniu_tm_imgcontainer").hidden = false;

            //     promise.then(e => labeltool.inputBBox(DATA));
            // }
        }));
    });
}

// document.querySelector('#qiniu_tm_listcontainer_upload').addEventListener('click', function(e) {
//     if(localStorage.data == undefined || localStorage.data.length == 0) return;
//     let postBody = {
//         headers: { 
//             "Content-Type": "application/json"
//         },
//         method: 'POST',
//         body: localStorage.data
//     }

//     fetch('/submit', postBody).then(function(response) {
//         console.log(response.ok);
//         if(response.ok) {
//             let cls = document.querySelector('#qiniu_tm_success_alert').getAttribute('class').replace('qiniu-tm-hidden', '');
//             document.querySelector('#qiniu_tm_success_alert').setAttribute('class', cls);
//             setTimeout(function() {
//                 let cls = document.querySelector('#qiniu_tm_success_alert').getAttribute('class') + 'qiniu-tm-hidden';
//                 document.querySelector('#qiniu_tm_success_alert').setAttribute('class', cls);
//             }, 1000);
//             console.log('update success!');
//         } else {
//             let cls = document.querySelector('#qiniu_tm_fail_alert').getAttribute('class').replace('qiniu-tm-hidden', '');
//             document.querySelector('#qiniu_tm_fail_alert').setAttribute('class', cls);
//             setTimeout(function() {
//                 let cls = document.querySelector('#qiniu_tm_fail_alert').getAttribute('class') + 'qiniu-tm-hidden';
//                 document.querySelector('#qiniu_tm_fail_alert').setAttribute('class', cls);
//             }, 1000);
//             console.log('update failed!');
//         }
        
//     }).catch(function(e) {
//         console.log(e);
//     });
// });

document.querySelector('#qiniu_tm_detailpanel_btngroup_cancel').addEventListener('click', function(e) {
    reloadLabelTool();
    refreshImgList();
    document.querySelector("#qiniu_tm_listcontainer").hidden = false;
    document.querySelector("#qiniu_tm_imgcontainer").hidden = true;
    document.querySelector('#qiniu_tm_detailpanel_btngroup_cancel').setAttribute('disabled', 'disabled');
    document.querySelector('#qiniu_tm_detailpanel_btngroup_submit').setAttribute('disabled', 'disabled');
});

document.querySelector('#qiniu_tm_detailpanel_btngroup_submit').addEventListener('click', function(e) {
    let fileName = document.querySelector('#qiniu_tm_chooseclass').value;
    let postBody = {
        headers: { 
            "Content-Type": "application/json"
        },
        method: 'POST',
        body: JSON.stringify({'fileName': fileName, 'tmpName': document.querySelector('#qiniu_tm_imgcontainer_title_filename').textContent, 'data': DATA})
    }

    fetch('/submit', postBody).then(function (response) {
        console.log('response: ', response);
    });
});

function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);

    var dataURL = canvas.toDataURL("image/png");
    // return dataURL

    return dataURL.replace("data:image/png;base64,", "");
}