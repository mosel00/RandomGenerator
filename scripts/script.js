imports(
    "scripts/config.js",
    "scripts/util.js"
);

class Process {
    constructor(sideBar, mainView) {
        Process.current = this;

        this.bar = document.getElementById(sideBar);
        this.view = document.getElementById(mainView);
        
        this.config = null;
    }
}

function run(sideBar, mainView) {
    const process = new Process(sideBar, mainView);

    const config = new Config(process.bar, process.view);
    process.config = config;
}

function importConfig() {
    let iImp = document.createElement("input");

    iImp.type = "file";
    iImp.accept = ".json";
    iImp.style.display = "none";
    iImp.addEventListener("change", (async evt => {
        const process = Process.current;
        const config = new Config(process.bar, process.view, JSON.parse(await evt.target.files[0].text()));
        process.config.delete();
        process.config = config;
    }).bind(this));

    iImp.click();
}

function exportConfig() {
    downloadJson("config.json", Process.current.config.export());
}