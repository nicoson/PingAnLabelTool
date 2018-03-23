class NiuArray extends Array {
    constructor(...args) {
        super(...args);
        this.Container = document.querySelector("#qiniu_tm_contentfiller");
        // this.Container.innerHTML = "";
    }
    push (...args) {
        super.push(...args)
        refreshList(this.Container, DATA);
        return this
    }
    splice (...args) {
        super.splice(...args)
        refreshList(this.Container, DATA);
        return this
    }
}

let labeltool = null;
let DATA = new NiuArray();  //  2-way binding page data
let LIST = null;
let CURRENT = 0;
let currentFolder = null;
let isNew = true;

window.onload = function() {
    let svgContainer = document.querySelector('#qiniu_tm_imgmarker');
    let imgContainer = document.querySelector('#qiniu_tm_img');
    labeltool = new labelTool(svgContainer, imgContainer, DATA);

    loadPageServer();

    // binding change event for image container
    document.querySelector("#qiniu_tm_imgcontainer").hidden = true;
}

function loadPageServer () {
    fetch('/getfilelist').then(e => e.json()).then(function(data) {
        let tmp = data.map(datum => {
            datum = datum.replace('.json', '');
            return `<li class="list-group-item qiniu-tm-listitem-choose" data-filename="${datum || ''}">
                        ${datum}
                    </li>`
        });
        document.querySelector('#qiniu_tm_listcontainer_list ul').innerHTML = tmp.join('');

        document.querySelectorAll(".qiniu-tm-listitem-choose").forEach(ele => ele.addEventListener("click", function(e) {
            let fileName = e.target.dataset.filename;
            let postBody = {
                headers: { 
                    "Content-Type": "application/json"
                },
                method: 'POST',
                body: JSON.stringify({'dirname': fileName})
            }
            currentFolder = fileName;

            fetch('getImgList', postBody).then(e => e.json()).then(imgList => {
                LIST = imgList;
                CURRENT = 0;

                loadImgPage();
            });
        }));
    });
}

function loadImgPage() {
    DATA = new  NiuArray();
    let containerBody = document.querySelector('#qiniu_tm_imgcontainer_body');
    let svgContainer = document.querySelector('#qiniu_tm_imgmarker');
    let imgContainer = document.querySelector('#qiniu_tm_img');
    containerBody.removeChild(svgContainer);
    svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgContainer.setAttribute('id', 'qiniu_tm_imgmarker');
    containerBody.appendChild(svgContainer);

    labeltool = new labelTool(svgContainer, imgContainer, DATA);

    document.querySelector("#qiniu_tm_contentfiller").innerHTML = "";
    let datum = LIST[CURRENT]
    datum.data.forEach(e => DATA.push(e));
    let imgURL = datum.url;
    document.querySelector('#qiniu_tm_img').src = imgURL;
    let promise = labeltool.init(imgURL);

    document.querySelector("#qiniu_tm_listcontainer").hidden = true;
    document.querySelector("#qiniu_tm_imgcontainer").hidden = false;

    promise.then(e => {
        let svgContainer = document.querySelector('#qiniu_tm_imgmarker');
        let imgContainer = document.querySelector('#qiniu_tm_img');
        svgContainer.style.height = imgContainer.clientHeight;
        labeltool.inputBBox(DATA);
    });
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

document.querySelector('#qiniu_tm_imgnav_previous').addEventListener('click', function(e) {
    CURRENT = (CURRENT <= 0) ? 0 : (CURRENT - 1);
    console.log(CURRENT);
    loadImgPage()
});

document.querySelector('#qiniu_tm_imgnav_next').addEventListener('click', function(e) {
    CURRENT = (CURRENT >= (LIST.length-1)) ? CURRENT : (CURRENT + 1);
    console.log(CURRENT);
    loadImgPage()
});

document.querySelector('#qiniu_tm_detailpanel_btngroup_cancel').addEventListener('click', function(e) {
    location.reload();
});

document.querySelector('#qiniu_tm_detailpanel_btngroup_submit').addEventListener('click', function(e) {
    if(LIST == null) return;

    LIST[CURRENT].data = DATA;
    let postBody = {
        headers: { 
            "Content-Type": "application/json"
        },
        method: 'POST',
        body: JSON.stringify({data: LIST, folder: currentFolder})
    }

    fetch('/submit', postBody).then(function (response) {
        console.log('response: ', response);
    });
});