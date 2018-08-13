/*!
 * labelTool v1.0.0
 * Copyright 2011-2018 Xiaohui Ni
 * Copyright 2011-2018 Qiniu, Ltd.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

class labelTool {
    constructor(svgContainer, imgContainer, datalist) {
        this.img = null;
        this.svgContainer = svgContainer;
        this.imgContainer = imgContainer;
        this.datalist = datalist;
        this.count = datalist.slice(-1).length ? (datalist.slice(-1)[0].id + 1) : 0;
        this.stretchRate = 1;

        this.startX = null;
        this.startY = null;
        this.endX = null;
        this.endY = null;
        this.centerX = null;
        this.centerY = null;
        this.radius = null;

        this.step = 1;

        this.createLabelMarkers();
        this.createEvents();
    }

    init(imgURL) {
        this.img = new Image();
        this.img.src = imgURL;
        return new Promise((resolve, reject) => {
            this.img.onload = function() {
                this.stretchRate = this.img.width / this.imgContainer.offsetWidth;
                console.log(this.stretchRate);
                resolve();
            }.bind(this)
        })
    }

    startTrace() {
        this.createLabelMarkers();
        this.createEvents();
    }

    stopTrace() {
        // this.svgContainer.removeEventListener('click', getEventListeners(this.svgContainer)[click].forEach(e => e.listener));
    }

    createLabelMarkers() {
        this.currentNode = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        this.currentNode.setAttribute('stroke', '#28a745');
        this.currentNode.setAttribute('stroke-width', 1);
        this.currentNode.setAttribute('stroke-opacity', 1);
        this.currentNode.setAttribute('fill', '#28a745');
        this.currentNode.setAttribute('fill-opacity', 0.2);
        this.currentNode.setAttribute('class', 'qiniu-tm-selecthover');
        this.svgContainer.appendChild(this.currentNode);
        
        this.cycleEle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.cycleEle.setAttribute('stroke', 'grey');
        this.cycleEle.setAttribute('stroke-width', 1);
        this.cycleEle.setAttribute('stroke-opacity', 0.8);
        this.cycleEle.setAttribute('fill', 'grey');
        this.cycleEle.setAttribute('fill-opacity', 0.2);
        this.svgContainer.appendChild(this.cycleEle);

        // <text x="0" y="15" fill="red">I love SVG</text>
        this.textNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        this.textNode.setAttribute('id', 'tmp_text');
        this.textNode.setAttribute('x', '0');
        this.textNode.setAttribute('y', '0');
        this.textNode.setAttribute('stroke', 'blue');
        this.textNode.setAttribute('stroke-width', 1);
        this.textNode.innerHTML = null;
        this.svgContainer.appendChild(this.textNode);
    }

    createEvents() {
        this.clickEvent = this.svgContainer.addEventListener('click', this.clickEventFun.bind(this));

        this.mouseMoveEvent = this.svgContainer.addEventListener('mousemove', function(e){
            if(this.step === 2) {
                this.endX = e.offsetX;
                this.endY = e.offsetY;

                this.radius = Math.sqrt((this.startX - this.endX)**2 + (this.startY - this.endY)**2) / 2;
                this.centerX = (this.startX + this.endX) / 2;
                this.centerY = (this.startY + this.endY) / 2;
                
                this.cycleEle.setAttribute('cx', this.centerX);
                this.cycleEle.setAttribute('cy', this.centerY);
                this.cycleEle.setAttribute('r', this.radius);
                
                let points = `${this.startX},${this.startY} ${this.endX},${this.startY} ${this.endX},${this.endY} ${this.startX},${this.endY}`;
                this.currentNode.setAttribute('points', points);
            } else if (this.step === 3) {
                // <polygon points="200,10 250,190 160,210" style="fill:lime;stroke:purple;stroke-width:1"/>
                let x = e.offsetX;
                let y = e.offsetY;
                let maxX = Math.max(this.startX, this.endX);
                let minX = Math.min(this.startX, this.endX);
                x = (x > (this.centerX + this.radius)) ? maxX : ((x < (this.centerX - this.radius)) ? minX : x);

                let y1 = this.centerY + Math.sqrt(this.radius**2 - (x - this.centerX)**2);
                let y2 = this.centerY - Math.sqrt(this.radius**2 - (x - this.centerX)**2);

                let midX = x;
                let midY = (Math.abs(y1 - y) > Math.abs(y2 - y)) ? y2 : y1;

                let midX2 = this.endX - (midX - this.startX);
                let midY2 = this.endY - (midY - this.startY);

                let points = `${this.startX},${this.startY} ${midX},${midY} ${this.endX},${this.endY} ${midX2},${midY2}`;

                this.currentNode.setAttribute('points', points);
            }

            this.textNode.setAttribute('x', e.offsetX + 10);
            this.textNode.setAttribute('y', e.offsetY - 10);
            this.textNode.innerHTML = `(${e.offsetX}, ${e.offsetY})`;

        }.bind(this));
    }

    clickEventFun(e) {
        switch(this.step) {
            case 1:
                this.startX = e.offsetX;
                this.startY = e.offsetY;
                this.step = 2;
                break;
            case 2:
                this.step = 3;
                break;
            case 3:
                this.step = 1;
                this.cycleEle.setAttribute("r", 0);
                this.currentNode.setAttribute('data-id', this.count);
                let outputdata = {
                    id: this.count,
                    node: this.currentNode.cloneNode(true),
                    bbox: this.calculateClockWise(this.currentNode.getAttribute('points').split(' ').map(e => e.split(',')).map(e => e.map(e => e*this.stretchRate))),
                    isKey: false
                }
                this.datalist.push(outputdata);
                this.svgContainer.appendChild(outputdata.node);
                this.currentNode.setAttribute('points', '');
                this.count++;
                break;
            default:
                break;
        }
    }

    inputBBox(datalist) {
        this.datalist = datalist;
        this.count = datalist.slice(-1).length ? ((datalist.slice(-1)[0].id !== undefined) ? datalist.slice(-1)[0].id + 1 : 0) : 0;

        this.datalist.forEach(function(datum) {
            let points =   `${datum.bbox[0][0]/this.stretchRate},${datum.bbox[0][1]/this.stretchRate} 
                            ${datum.bbox[1][0]/this.stretchRate},${datum.bbox[1][1]/this.stretchRate} 
                            ${datum.bbox[2][0]/this.stretchRate},${datum.bbox[2][1]/this.stretchRate} 
                            ${datum.bbox[3][0]/this.stretchRate},${datum.bbox[3][1]/this.stretchRate}`;
            
            let tempNode = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            tempNode.setAttribute('stroke', datum.isKey ? '#1E90FF' : '#28a745');
            tempNode.setAttribute('stroke-width', 1);
            tempNode.setAttribute('stroke-opacity', 1);
            tempNode.setAttribute('fill', datum.isKey ? '#1E90FF' : '#28a745');
            tempNode.setAttribute('fill-opacity', 0.2);
            tempNode.setAttribute('class', 'qiniu-tm-selecthover');
            tempNode.setAttribute('data-id', datum.id);
            tempNode.setAttribute('points', points);
            this.svgContainer.appendChild(tempNode);
            datum.node = tempNode;
        }.bind(this));
    }

    calculateClockWise(bbox) {
        let delta_X_01 = bbox[1][0] - bbox[0][0];
        let delta_Y_01 = -(bbox[1][1] - bbox[0][1]);
        let hypotenuse_01 = Math.sqrt(delta_X_01**2 + delta_Y_01**2);
        let sin01 = delta_Y_01 / hypotenuse_01;
        let cos01 = delta_X_01 / hypotenuse_01;

        let delta_X_02 = bbox[2][0] - bbox[0][0];
        let delta_Y_02 = -(bbox[2][1] - bbox[0][1]);
        let hypotenuse_02 = Math.sqrt(delta_X_02**2 + delta_Y_02**2);
        let sin02 = delta_Y_02 / hypotenuse_02;
        let cos02 = delta_X_02 / hypotenuse_02;

        let sin0102 = sin01*cos02 - cos01*sin02
        if (sin0102 < 0) {
            return [bbox[0], bbox[2], bbox[1], bbox[3]];
        } else {
            return bbox;
        }
    }
}
        
        
        

        

        