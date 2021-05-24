class ResizableSplit {
    #first;
    #second;
    #fDiv;
    #sDiv;
    #container;
    #splitter;
    horizontal;

    constructor(horizontal = false, first, second) {
        this.#first = first;
        this.#second = second;
        this.horizontal = horizontal;
        
        this.#container = document.createElement("div");
        this.#container.style.display = "flex";
        
        this.#fDiv = document.createElement("div");
        this.#container.appendChild(this.#fDiv);
        this.#splitter = document.createElement("div");
        this.#splitter.classList.add("splitter");
        
        if (horizontal) {
            this.#container.style.width = "100%";
            this.#splitter.classList.add("horizontal");
        } else {
            this.#container.style.height = "100%";
            this.#container.style.flexFlow = "column";
            this.#splitter.classList.add("vertical");
        }

        let mousePos = 0;
        let firstSize = 0;
        
        const mouseMoveResize = (horizontal ? evt => {
                const dx = evt.clientX - mousePos;
                const width = (firstSize + dx) * 100 / this.#container.getBoundingClientRect().width;
                this.#fDiv.style.width = `${width}%`;
                
                document.body.style.cursor = 'col-resize';
        } : evt => {
                const dy = evt.clientY - mousePos;
                const height = (firstSize + dy) * 100 / this.#container.getBoundingClientRect().height;
                this.#fDiv.style.height = `${height}%`;
                
                document.body.style.cursor = 'row-resize';
        }).bind(this);

        const mouseMove = (evt => {
            mouseMoveResize(evt);
                
            this.#fDiv.style.userSelect = 'none';
            this.#fDiv.style.pointerEvents = 'none';

            this.#sDiv.style.userSelect = 'none';
            this.#sDiv.style.pointerEvents = 'none';

        }).bind(this);
        
        const mouseUp = (() => {
            document.body.style.removeProperty("cursor");
        
            this.#fDiv.style.removeProperty("user-select");
            this.#fDiv.style.removeProperty("pointer-events");
        
            this.#sDiv.style.removeProperty("user-select");
            this.#sDiv.style.removeProperty("pointer-events");
        
            document.removeEventListener("mousemove", mouseMove);
            document.removeEventListener("mouseup", mouseUp);
        }).bind(this);

        const sizeOp = (horizontal ? evt => {
            mousePos = evt.clientX;
            firstSize = this.#fDiv.getBoundingClientRect().width;
        } : evt => {
            mousePos = evt.clientY;
            firstSize = this.#fDiv.getBoundingClientRect().height; 
        }).bind(this);

        const mouseDown = evt => {
            sizeOp(evt);
            
            document.addEventListener("mousemove", mouseMove);
            document.addEventListener("mouseup", mouseUp);
        };

        this.#splitter.addEventListener("mousedown", mouseDown);

        this.#container.appendChild(this.#splitter);
        
        this.#sDiv = document.createElement("div");
        this.#sDiv.style.flex = "1 1 0%";
        this.#container.appendChild(this.#sDiv);
        
        this.#refreshChildren()
    }
    
    get container() {
        return this.#container;
    }

    get first() {
        return this.#first;
    }

    set first(value) {
        this.#first = value;
        this.#refreshChildren();
    }

    get second() {
        return this.#second;
    }

    set second(value) {
        this.#second = value;
        this.#refreshChildren();
    }

    #refreshChildren() {
        if (this.#fDiv.firstChild) {
            this.#fDiv.removeChild(this.#fDiv.firstChild);
        }

        if (this.#first) {
            this.#fDiv.appendChild(this.#first);
        }

        if (this.#sDiv.firstChild) {
            this.#sDiv.removeChild(this.#sDiv.firstChild);
        }

        if (this.#second) {
            this.#sDiv.appendChild(this.#second);
        }
    }

    delete() {
        this.#container.remove();
    }
}