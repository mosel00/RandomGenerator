imports(
    "scripts/wheel.js",
    "scripts/util.js",
    "scripts/sketch.js"
);

class WheelConfig {
    constructor(name) {
        this.name = name;
        this.options = [];
        this.oldValues = [];
        this.div = document.createElement("div");

        this.wheel = new Wheel();
        this.addOption();
        this.setFirstRemoveVisibility(false);
    }

    setFirstRemoveVisibility(show) {
        this.options[0].children[0].style.visibility = show ? "visible" : "hidden";
    }

    createOption(name = "Option", weight = 0, text = "") {
        let option = document.createElement("div");
        option.classList.add("configOption");
        this.div.appendChild(option);
        this.oldValues.push("");

        let obj = this;

        let removeButton = document.createElement("button");
        removeButton.classList.add("removeButton");
        removeButton.innerText = "-";
        removeButton.addEventListener("click", () => obj.removeOption(this.options.indexOf(option)));
        option.appendChild(removeButton);

        let nameInput = document.createElement("input");
        nameInput.classList.add("nameInput");
        nameInput.value = name;
        nameInput.addEventListener("input", () => this.wheel.modifyName(this.options.indexOf(option), nameInput.value === undefined ? "" : nameInput.value));
        option.appendChild(nameInput);

        let weightInput = document.createElement("input");
        weightInput.classList.add("weightInput");
        weightInput.value = weight;
        weightInput.addEventListener("input", () => {
            let value = weightInput.value;
            let index = this.options.indexOf(option);

            if (obj.oldValues[index].length < value.length) {
                let lastChar = value[value.length - 1];
                if (0 <= lastChar && lastChar <= 9) {
                    obj.oldValues[index] = value;
                    this.wheel.modifyWeight(index, parseInt(value));
                } else {
                    weightInput.value = obj.oldValues[index];
                }
            } else {
                obj.oldValues[index] = value;
                let v = value.length == 0 ? 0 : parseInt(value);
                this.wheel.modifyWeight(index, v);
            }
        });
        option.appendChild(weightInput);

        let action = document.createElement("button");
        
        action.classList.add("actionOption");
        action.innerText = "No action selected";
        option.appendChild(action);

        let actionDiv = document.createElement("div");
        action.addEventListener("click", () => this.openSelectPopup(() => this.options.indexOf(option), action, actionDiv));
        option.appendChild(actionDiv);

        let clearDiv = document.createElement("div");
        clearDiv.style.clear = "both";
        option.appendChild(clearDiv);

        this.options.push(option);
        this.setFirstRemoveVisibility(true);
    }

    static actions() {
        return [
            ["Text", WheelConfig.textAction]
        ];
    }

    static textAction(cfg, id, div) {
        let textInput = document.createElement("input");
        textInput.addEventListener("input", () => {
            cfg.wheel.modifyAction(id(), () => console.log(textInput.value === undefined ? "" : textInput.value));
        });
        div.appendChild(textInput);
    }

    openSelectPopup(id, button, actionContainer) {
        openInternalPopup(close => {
            let div = document.createElement("div");
            div.classList.add("configSelectAction");

            let h1 = document.createElement("h1");
            h1.innerText = "Select Action";
            div.appendChild(h1);

            let actions = WheelConfig.actions();

            for (let i = 0; i < actions.length; i++) {
                let actionDiv = document.createElement("div");
                actionDiv.classList.add("actionDiv");

                let action = actions[i];

                let p = document.createElement("p");
                p.innerText = action[0];
                p.style.margin = 0;
                actionDiv.appendChild(p);

                let cfg = this;

                actionDiv.addEventListener("click", () => {
                    while (actionContainer.firstChild) {
                        actionContainer.removeChild(actionContainer.firstChild);
                    }

                    action[1](cfg, id, actionContainer);
                    button.innerText = action[0];
                    close();
                });

                div.appendChild(actionDiv);
            }
            
            return div;
        });
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
            this.setFirstRemoveVisibility(false);
        }
    }

    export() {
        let obj = {
            name: this.name,
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
            this.createOption("Option", obj.weights[i].weight, obj.weights[i].text);
        }
        
        if (this.options.length == 1) {
            this.setFirstRemoveVisibility(false);
        }
    }
}

class Config {
    constructor() {
        this.wheelConfigs = [];
        this.div = document.createElement("div");
        this.div.classList.add("configDiv");
        document.body.appendChild(this.div);
    }

    addWheel() {
        let div = document.createElement("div");
    
        // Wheel
    
        let wheelDiv = document.createElement("div");
        let bSpin = document.createElement("button")
        let p5Div = document.createElement("div");
        
        wheelDiv.appendChild(bSpin);
        wheelDiv.appendChild(p5Div);
        div.appendChild(wheelDiv);
    
        wheelDiv.classList.add("wheelDiv");
        
        bSpin.innerText = "Spin";
        
        // Config
        
        let cfgDiv = document.createElement("div");
        let bExp = document.createElement("button");
        let bImp = document.createElement("button");
        let iImp = document.createElement("input");
        let bAdd = document.createElement("button");
        let cfg = new WheelConfig();
    
        cfgDiv.appendChild(bExp);
        bImp.appendChild(iImp);
        cfgDiv.appendChild(bImp);
        cfgDiv.appendChild(bAdd);
        cfgDiv.appendChild(cfg.div);
        div.appendChild(cfgDiv);
    
        bExp.innerText = "Export";
        bExp.style.marginLeft = "1.5em";
        bExp.style.float = "left";
        bExp.addEventListener("click", () => downloadJson("config.json", cfg.export()));
    
        bImp.innerText = "Import";
        bImp.float = "left";
        bImp.addEventListener("click", () => iImp.click());
    
        iImp.type = "file";
        iImp.accept = ".json";
        iImp.style.display = "none";
        iImp.addEventListener("change", async evt => {
            cfg.import(JSON.parse(await evt.target.files[0].text()))
        });
        
        bAdd.innerText = "Add";
        bAdd.addEventListener("click", () => cfg.addOption())
    
        bSpin.addEventListener("click", () => cfg.wheel.spin());
        
        this.wheelConfigs.push(cfg);

        let p5Script = new p5(wheelSketch(cfg), p5Div);
        p5Div.firstChild.style.visibility = "visible";

        this.div.appendChild(div);
    }
}