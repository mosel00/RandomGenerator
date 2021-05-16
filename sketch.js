const width = 500;
const height = 500;
const diagonal = 0.9 * width;

//const weights = [2, 4, 1, 1];
const epsilon = 0.0001;

const maxSpeed = 2 * Math.PI;
const maxOffset = 2 * Math.PI;
const reduction = 0.01;
const scaling = 0.5; 

function downloadJson(filename, obj) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj, null, '\t')));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}

class WheelOption {
    constructor(weight, text, previousProcenturalSum, procenturalWeight, color) {
        this.weight = weight, 
        this.start = previousProcenturalSum * TWO_PI, 
        this.end = (previousProcenturalSum + procenturalWeight) * TWO_PI 
        this.color = color;

        if (text === undefined) {
            text = "";
        }

        this.text = text;
    }
}

class Wheel {
    constructor(weights) {
        if (weights === undefined) {
            weights = [];
        }

        this.weights = new Array(weights.length);

        this.sum = 0;
        for (let i = 0; i < weights.length; i++) {
            this.sum += max(weights[i].weight, 0);
            this.weights[i] = new WheelOption(weights[i].weight, weights[i].text);
        }

        this.recalculate();

        this.reset();
    }

    addWeight() {
        this.weights.push(new WheelOption(0, "", 1, 0));

        this.recalculateColors();
    }

    modifyWeight(index, value) {
        let oldWeight = this.weights[index].weight;
        this.weights[index].weight = value;

        this.sum += value - oldWeight;
    
        this.recalculateWeights();
    }

    modifyText(index, value) {
        this.weights[index].text = value;
    }

    removeWeight(index) {
        this.sum -= this.weights[index].weight;
        this.weights.splice(index, 1);

        this.recalculate();
    }

    recalculate() {
        this.recalculateColors();
        this.recalculateWeights();
    }

    recalculateColors() {
        let randomColor = () => {
            let shuffle = (arr) => {
                for (let i = arr.length - 1; i > 0; i--) {
                    let j = Math.floor(Math.random() * (i + 1));
                    let temp = arr[i];
                    arr[i] = arr[j];
                    arr[j] = temp;
                }
            }
            
            let colors = new Array(this.weights.length);
        
            colorMode(HSB);
            for (let i = 0; i < this.weights.length; i++) {
                let hue = i / this.weights.length;
                colors[i] = color(hue * 360, 100, 100);
            }
        
            shuffle(colors);
            
            for (let i = 0; i < this.weights.length; i++) {
                this.weights[i].color = colors[i];
            }
        }

        let twoColor = () => {
            const even = color(0x00, 0xA7, 0xCC);
            const odd = color(0x33);

            for (let i = 0; i < this.weights.length; i++) {
                this.weights[i].color = i % 2 == 0 ? even : odd;
            }
        }

        twoColor();
    }

    recalculateWeights() {
        let s = 0;
        for (let i = 0; i < this.weights.length; i++) {
            let w = max(this.weights[i].weight, 0) / this.sum;
            this.weights[i].start = s * TWO_PI;
            this.weights[i].end = (s + w) * TWO_PI;
            s += w;
        }
    }

    spin() {
        let offset = random(-maxOffset, maxOffset);
        this.velocity = maxSpeed + offset;
        this.spinning = true;
    }

    draw() {
        stroke(0);
        strokeWeight(2);

        if (this.sum === 0) {
            fill(0);
            circle(width / 2, height / 2, diagonal);
        } else {
            for (let i = 0; i < this.weights.length; i++) {
                fill(this.weights[i].color);
                this.drawArc(this.rotated + this.weights[i].start, this.rotated + this.weights[i].end);
            }
        }

        if (this.spinning) {
            this.rotated += this.velocity * deltaTime;
            this.rotated = this.mod(this.rotated, TWO_PI);

            this.velocity *= pow(scaling, reduction * deltaTime);
            
            if (this.velocity < epsilon) {
                this.spinning = false;
                this.velocity = 0;
                this.onFinished();
            }
        }
    }

    mod(value, base) {
        return value - base * floor(value / base);
    }

    drawArc(start, end) {
        arc(width / 2, height / 2, diagonal, diagonal, start - HALF_PI, end - HALF_PI, PIE);
    }

    onFinished() {
        let result = undefined;
        if (this.sum === 0) {
            result = this.weights[0];
        } else {
            let shifted = this.mod(-this.rotated, TWO_PI);
            for (let i = 0; i < this.weights.length; i++) {
                if (this.weights[i].start <= shifted && shifted < this.weights[i].end) {
                    result = [i, this.weights[i]];
                    break;
                }
            }
        }
        
        if (result === undefined) {
            console.error("Unexpected state.");
            return;
        }

        console.log(result);
        console.log("" + (result[0] + 1) + ": " + result[1].text);
        lastResult.html("" + (result[0] + 1) + ": " + result[1].text);
    }

    reset() {
        this.velocity = 0;
        this.spinning = false;
        this.rotated = 0;
    }
}

class Config {
    constructor() {
        this.div = createDiv();
        this.options = [];
        this.oldValues = [];

        this.wheel = new Wheel();
        this.addOption();
        this.hideFirstRemove();
    }

    hideFirstRemove() {
        this.options[0].elt.children[0].style.visibility = "hidden";
    }

    createOption(weight, text) {
        if (weight === undefined) {
            weight = 0;
        }

        if (text === undefined) {
            text = "";
        }

        let options = createDiv();
        options.parent(this.div);
        this.oldValues.push("");

        let obj = this;

        let removeButton = createButton("-");
        removeButton.mousePressed(() => obj.removeOption(this.options.indexOf(options)));
        removeButton.style("float", "left");
        removeButton.parent(options);

        let weightInput = createInput();
        weightInput.value(weight)
        weightInput.input(() => {
            let value = weightInput.value();
            let index = this.options.indexOf(options);

            if (obj.oldValues[index].length < value.length) {
                let lastChar = value[value.length - 1];
                if (0 <= lastChar && lastChar <= 9) {
                    obj.oldValues[index] = value;
                    this.wheel.modifyWeight(index, parseInt(value));
                } else {
                    weightInput.value(obj.oldValues[index]);
                }
            } else {
                obj.oldValues[index] = value;
                let v = value.length == 0 ? 0 : parseInt(value);
                this.wheel.modifyWeight(index, v);
            }
        });
        weightInput.style("float", "left");
        weightInput.size(50);
        weightInput.parent(options);

        let textInput = createInput();
        textInput.value(text);
        textInput.input(() => this.wheel.modifyText(this.options.indexOf(options), textInput.value() === undefined ? "" : textInput.value()));
        textInput.parent(options);

        this.options.push(options);
        this.options[0].elt.children[0].style.visibility = "visible";      
    }

    addOption() {  
        this.createOption();
        this.wheel.addWeight();
    }

    removeOption(index) {
        this.options[index].remove();
        this.options.splice(index, 1);
        this.oldValues.splice(index, 1);

        this.wheel.removeWeight(index);
        
        if (this.options.length == 1) {
            this.hideFirstRemove();
        }
    }

    export() {
        let obj = {
            weights: []
        };

        for (let i = 0; i < this.options.length; i++) {
            obj.weights.push({ weight: this.wheel.weights[i].weight, text: this.wheel.weights[i].text });
        }

        return obj;
    }

    import(obj) {
        for (let i = 0; i < this.options.length; i++) {
            this.options[i].remove();
        }

        this.options = [];

        this.wheel = new Wheel(obj.weights);

        for (let i = 0; i < obj.weights.length; i++) {
            this.createOption(obj.weights[i].weight, obj.weights[i].text);
        }
        
        if (this.options.length == 1) {
            this.hideFirstRemove();
        }
    }
}

let backgroundColor = 0;
let triangleColor = 0;
let lastResult = 0;
let cfg = 0;

function setup() {
    createCanvas(width, height);
    colorMode(RGB);
    backgroundColor = color(0x1E);
    triangleColor = color(0xFF);

    let wheelDiv = createDiv();
    wheelDiv.style("margin-bottom", "2em");
    
    let bSpin = createButton("Spin");
    bSpin.parent(wheelDiv);
    
    lastResult = createP("");
    lastResult.parent(wheelDiv);

    let cfgDiv = createDiv().elt;

    let bExp = createButton("Export");
    bExp.style("margin-left", "1.5em");
    bExp.style("float", "left");
    bExp.parent(cfgDiv);

    let bImp = createButton("Import");
    let iImp = document.createElement("input");
    iImp.type = "file";
    iImp.name = "file";
    iImp.accept = ".json";
    iImp.style.display = "none";
    bImp.elt.appendChild(iImp);
    bImp.parent(cfgDiv);
    
    cfg = new Config();
    bExp.mousePressed(() => downloadJson("config.json", cfg.export()));
    bImp.mousePressed(() => {
        iImp.click();
    });
    iImp.addEventListener("change", async evt => {
        cfg.import(JSON.parse(await evt.target.files[0].text()))
    });

    let bAdd = createButton("Add");
    bAdd.style("margin-left", "1.5em");
    bAdd.mousePressed(() => cfg.addOption())
    bSpin.mousePressed(() => cfg.wheel.spin());
    
    colorMode(RGB);
}

function draw() {
    background(backgroundColor);
    
    cfg.wheel.draw();

    fill(triangleColor);
    stroke(0);
    strokeWeight(2);
    triangle(
        (0.5 - 0.02) * width, 0.025 * height,
        (0.5 + 0.02) * width, 0.025 * height,
        0.5 * width, (0.1 + 0.05) * height,
    );
}