imports(
    "scripts/wheel.js",
    "scripts/constants.js",
    "scripts/util.js",
    "scripts/sketch.js"
);

class WheelConfig {
    constructor(name = "", weights = [], output = () => {}) {
        this.name = name;
        this.options = [];
        this.oldValues = [];
        this.div = null;
        this.optionList = document.createElement("ul");
        this.optionList.classList.add("optionList");

        this.output = output;

        this.wheel = new Wheel(weights, WheelConfig.getDefaultAction(this));
        if (weights.length === 0) {
            this.addOption();
        } else {
            for (let i = 0; i < weights.length; i++) {
                this.importOption(weights[i]);
            }            
        }

        this.setFirstRemoveVisibility(this.options.length > 1);
    }

    delete() {
        if (this.div !== null) {
            this.div.remove();
            this.div = null;
        }
    }

    createView(parent) {
        let div = document.createElement("div");
    
        // Wheel
    
        let wheelDiv = document.createElement("div");
        let bSpin = document.createElement("button")
        let p5Div = document.createElement("div");
        
        wheelDiv.appendChild(p5Div);
        wheelDiv.appendChild(bSpin);
        div.appendChild(wheelDiv);
    
        wheelDiv.classList.add("spinDiv");
        
        bSpin.innerText = "Spin";
        
        // Config
        
        let cfgDiv = document.createElement("div");
        let buttonBar = document.createElement("div");
        let bExp = document.createElement("button");
        let bAdd = document.createElement("button");
        let cfg = this;
        
        buttonBar.appendChild(bExp);
        buttonBar.appendChild(bAdd);
        cfgDiv.appendChild(buttonBar);
        cfgDiv.appendChild(this.optionList);
        div.appendChild(cfgDiv);

        cfgDiv.classList.add("configDiv");
        buttonBar.classList.add("buttonBar");
    
        bExp.innerText = "Export";
        bExp.addEventListener("click", () => downloadJson(cfg.name + "_config.json", cfg.export()));
        
        bAdd.innerText = "Add";
        bAdd.addEventListener("click", () => cfg.addOption())
    
        bSpin.addEventListener("click", () => cfg.wheel.spin());
        
        let p5Script = new p5(wheelSketch(cfg), p5Div);
        p5Div.firstChild.style.visibility = "visible";

        this.div = div;
        parent.appendChild(div);
    }

    setFirstRemoveVisibility(show) {
        this.options[0].children[0].style.visibility = show ? "visible" : "hidden";
    }

    createOption(name = "Option", weight = 0) {
        let option = document.createElement("li");
        option.classList.add("configOption");
        this.optionList.appendChild(option);
        this.oldValues.push("");

        let obj = this;

        let removeButton = document.createElement("button");
        removeButton.classList.add("remove");
        removeButton.innerText = removalSymbol;
        removeButton.addEventListener("click", () => this.removeOption(this.options.indexOf(option)));
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
        action.innerText = "Action: None";
        option.appendChild(action);
                
        let actionDiv = document.createElement("div");
        action.addEventListener("click", () => this.openSelectPopup(() => this.options.indexOf(option), action, actionDiv));
        option.appendChild(actionDiv);
        
        let clearDiv = document.createElement("div");
        clearDiv.style.clear = "both";
        option.appendChild(clearDiv);
        
        this.options.push(option);
        this.setFirstRemoveVisibility(true);

        return [option, action, actionDiv];
    }

    importOption(option) {
        const objects = this.createOption(option.name, option.weight);
        const action = WheelConfig.actions()[option.action.type];
        objects[1].innerText = `Action: ${action[0]}`;
        const id = () => this.options.indexOf(objects[0]);
        action[1](this, id, objects[2]);
        this.wheel.weights[id()].name = option.name;
        this.wheel.weights[id()].action.data = option.action.data;
    }

    static getDefaultAction(cfg) {
        return obj => () => {
            cfg.output(obj.name);
        };
    }

    static actions() {
        return [
            ["None", WheelConfig.noneAction],
            ["Text", WheelConfig.textAction]
        ];
    }

    static noneAction(cfg, id, div) {
        cfg.wheel.modifyAction(id(), {
            type: 0,
            data: {},
            action: WheelConfig.getDefaultAction(cfg)(cfg.wheel.weights[id()])
        });
    }

    static textAction(cfg, id, div) {
        let textInput = document.createElement("input");

        cfg.wheel.modifyAction(id(), {
            type: 1,
            data: { text: textInput.value }, 
            action: () => cfg.output(cfg.wheel.weights[id()].action.data.text) 
        });
        
        textInput.addEventListener("input", () => cfg.wheel.weights[id()].action.data.text = textInput.value);
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
                    button.innerText = `Action: ${action[0]}`;
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
            type: wheelConfigIndex,
            name: this.name,
            weights: []
        };

        for (let i = 0; i < this.options.length; i++) {
            obj.weights.push({ 
                name: this.wheel.weights[i].name,
                weight: this.wheel.weights[i].weight, 
                text: this.wheel.weights[i].text,
                action: {
                    type: this.wheel.weights[i].action.type,
                    data: this.wheel.weights[i].action.data
                }
            });
        }

        return obj;
    }
}
