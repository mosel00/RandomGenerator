imports(
    "scripts/wheel.js"
);

class Config {
    constructor(onResult, parent = document.body) {
        this.options = [];
        this.oldValues = [];
        this.div = document.createElement("div");
        parent.appendChild(this.div);

        this.wheel = new Wheel(onResult);
        this.addOption();
        this.setFirstRemoveVisibility(false);
    }

    setFirstRemoveVisibility(show) {
        this.options[0].children[0].style.visibility = show ? "visible" : "hidden";
    }

    createOption(weight = 0, text = "") {
        let options = document.createElement("div");
        this.div.appendChild(options);
        this.oldValues.push("");

        let obj = this;

        let removeButton = document.createElement("button");
        removeButton.innerText = "-";
        removeButton.addEventListener("click", () => obj.removeOption(this.options.indexOf(options)));
        removeButton.style.float = "left";
        options.appendChild(removeButton);
        
        let weightInput = document.createElement("input");
        weightInput.value = weight;
        weightInput.addEventListener("input", () => {
            let value = weightInput.value;
            let index = this.options.indexOf(options);

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
        weightInput.style.float = "left";
        weightInput.style.width = "50px";
        options.appendChild(weightInput);

        let textInput = document.createElement("input");
        textInput.value = text;
        textInput.addEventListener("input", () => this.wheel.modifyText(this.options.indexOf(options), textInput.value === undefined ? "" : textInput.value));
        options.appendChild(textInput);

        this.options.push(options);
        this.setFirstRemoveVisibility(true);
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
            this.setFirstRemoveVisibility(false);
        }
    }
}