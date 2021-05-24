imports(
    "scripts/constants.js",
    "scripts/wheelConfig.js",
    "scripts/util.js",
    "scripts/draggableListItem.js",
    "scripts/resizableSplit.js",
    "scripts/console.js"
);

class Config {
    constructor(sideBar, mainView, config = { type: fullConfigIndex, wheels: [] }) {
        this.wheels = [];
        
        this.sideBar = document.createElement("div");
        sideBar.appendChild(this.sideBar);
        
        // let split = new ResizableSplit(false);
        // mainView.appendChild(split.container);

        this.mainView = document.createElement("div");
        this.mainView.classList.add("wheelDiv");
        mainView.appendChild(this.mainView);
        // split.first = this.mainView;

        // this.console = new Console();
        // split.second = this.console.container;


        this.prepareUI();

        for (let i = 0; i < config.wheels.length; i++) {
            this.importWheel(config.wheels[i]);
        }
    }
    
    prepareUI() {
        let buttonDiv = document.createElement("div");
        buttonDiv.classList.add("buttonBar");

        let bAdd = document.createElement("button");
        bAdd.innerText = "Add Wheel";
        bAdd.addEventListener("click", (() => this.addWheel()).bind(this));
        buttonDiv.appendChild(bAdd);

        let bImp = document.createElement("button");
        let iImp = document.createElement("input");
        
        bImp.innerText = "Import Wheel";
        bImp.addEventListener("click", () => iImp.click());
    
        iImp.type = "file";
        iImp.accept = ".json";
        iImp.style.display = "none";
        iImp.addEventListener("change", (async evt => {
            this.importWheel(JSON.parse(await evt.target.files[0].text()))
        }).bind(this));

        bImp.appendChild(iImp);
        buttonDiv.appendChild(bImp);

        this.sideBar.appendChild(buttonDiv);

        this.wheelList = document.createElement("ul");
        this.wheelList.classList.add("wheelList");
        this.sideBar.appendChild(this.wheelList);
    }

    delete() {
        if (this.mainView !== null) {
            this.mainView.remove();
        }

        if (this.sideBar !== null) {
            this.sideBar.remove();
        }
    }

    addWheel(name = "Wheel", weights = []) {
        let config = new WheelConfig(name, weights);
        
        let item = document.createElement("li");
        const wheel = { config: config, listItem: item };
        
        let drag = document.createElement("div");
        drag.classList.add("drag");
        drag.innerText = dragSymbol;
        const wheels = this.wheels;
        new DraggableListItem(drag, item, node => {
            const other = wheels.filter(i => i.listItem === node)[0];
            const i = wheels.indexOf(wheel);
            const j = wheels.indexOf(other);
            wheels[i] = other;
            wheels[j] = wheel;
        });
        item.appendChild(drag);
        
        let nameInput = document.createElement("input");
        nameInput.value = name;
        nameInput.addEventListener("change", (() => this.changeWheelName(this.wheels.indexOf(wheel), nameInput.value)).bind(this));
        item.appendChild(nameInput);
        
        let remove = document.createElement("button");
        remove.innerText = removalSymbol;
        remove.classList.add("remove");
        remove.addEventListener("click", (() => this.removeWheel(this.wheels.indexOf(wheel))).bind(this));
        item.appendChild(remove);

        let open = document.createElement("button");
        open.innerText = openSymbol;
        open.classList.add("open");
        open.addEventListener("click", (() => this.openWheel(this.wheels.indexOf(wheel))).bind(this));
        item.appendChild(open);
        
        this.wheelList.appendChild(item);
        this.wheels.push(wheel);

        nameInput.focus();
    }

    importWheel(obj) {
        if (typeof obj.type !== "number") {
            console.error("Malformed wheel config file");
            return;
        }
        
        if (obj.type !== wheelConfigIndex) {
            console.error("Wrong config file type");
            return;
        }

        if (typeof obj.name !== "string" || !Array.isArray(obj.weights)) {
            console.error("Malformed wheel config file");
            return;
        }

        this.addWheel(obj.name, obj.weights);
    }

    openWheel(index) {
        while (this.mainView.firstChild) {
            this.mainView.removeChild(this.mainView.firstChild);
        }

        this.wheels[index].config.createView(this.mainView);
    }

    changeWheelName(index, name) {
        this.wheels[index].config.name = name;
    }

    removeWheel(index) {
        this.wheels[index].listItem.remove();
        this.wheels[index].config.delete();
        this.wheels.splice(index, 1);
    }

    export() {
        const object = {
            type: fullConfigIndex,
            wheels: []
        }

        for (let i = 0; i < this.wheels.length; i++) {
            object.wheels.push(this.wheels[i].config.export());
        }

        return object;
    }
}