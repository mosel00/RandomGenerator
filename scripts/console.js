class Console {
    #container;

    constructor() {
        this.#container = document.createElement("div");
        this.#container.classList.add("console");
    }

    get container() {
        return this.#container;
    }
}