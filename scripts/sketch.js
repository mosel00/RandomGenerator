imports(
    "scripts/constants.js",
    "scripts/config.js",
    "https://cdn.jsdelivr.net/npm/p5@1.2.0/lib/p5.js"
);

function downloadJson(filename, obj) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj, null, '\t')));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
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

    createView();
    
    colorMode(RGB);
}

function createView() {
    let wheelDiv = createDiv();
    wheelDiv.style("margin-bottom", "2em");
    
    let bSpin = createButton("Spin");
    bSpin.parent(wheelDiv);
    
    lastResult = createP("");
    lastResult.parent(wheelDiv);
    
    // Config
    
    let cfgDiv = createDiv().elt;
    let bExp = createButton("Export");
    let bImp = createButton("Import");
    let iImp = document.createElement("input");
    let bAdd = createButton("Add");
    cfg = new Config(onResult);

    bExp.parent(cfgDiv);
    bImp.parent(cfgDiv);
    bImp.elt.appendChild(iImp);
    bAdd.parent(cfgDiv);
    cfgDiv.appendChild(cfg.div);

    bExp.style("margin-left", "1.5em");
    bExp.style("float", "left");
    bExp.mousePressed(() => downloadJson("config.json", cfg.export()));

    bImp.mousePressed(() => iImp.click());
    bImp.style("float", "left");

    iImp.type = "file";
    iImp.accept = ".json";
    iImp.style.display = "none";
    iImp.addEventListener("change", async evt => {
        cfg.import(JSON.parse(await evt.target.files[0].text()))
    });
    
    bAdd.mousePressed(() => cfg.addOption())

    bSpin.mousePressed(() => cfg.wheel.spin());
}

function onResult(result) {
    lastResult.html("" + result[0] + ": " + result[1].text);
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