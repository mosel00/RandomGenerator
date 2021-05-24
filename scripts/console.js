class Console {
    #container;
    #text;

    constructor() {
        this.#container = document.createElement("div");
        this.#container.classList.add("console");
        this.#text = "";
    }

    get container() {
        return this.#container;
    }

    writeLine(text) {
        this.#text += `${text}\n`;
        this.#container.innerText = this.#text;
    }
}