class DraggableListItem {
    constructor(trigger, element, swapCallback = (node) => {}) {
        this.x = 0;
        this.y = 0;
        this.trigger = trigger;
        this.element = element;
        this.attached = false;
        this.dragging = false;
        this.placeholder = null;
        this.swapCallback = swapCallback;

        this.handler = () => {};

        this.attach();
    }

    attach() {
        if (!this.attached) {
            const obj = this;
            
            const swap = function(nodeA, nodeB) {
                const parentA = nodeA.parentNode;
                const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;
            
                nodeB.parentNode.insertBefore(nodeA, nodeB);
            
                parentA.insertBefore(nodeB, siblingA);
            };

            const isAbove = function(nodeA, nodeB) {
                const rectA = nodeA.getBoundingClientRect();
                const rectB = nodeB.getBoundingClientRect();
            
                return (rectA.top + rectA.height / 2 < rectB.top + rectB.height / 2);
            };

            const mouseMoveHandler = evt => {
                if (!obj.dragging) {
                    obj.dragging = true;
                    
                    obj.placeholder = document.createElement('div');
                    obj.placeholder.classList.add('placeholder');
                    obj.element.parentNode.insertBefore(
                        obj.placeholder,
                        obj.element.nextSibling
                    );
            
                    obj.placeholder.style.height = `${obj.element.getBoundingClientRect().height}px`;
                }
                
                obj.element.style.width = `${obj.element.offsetWidth}px`;
                obj.element.style.position = "absolute";
                obj.element.style.top = `${evt.pageY - obj.y}px`; 
                
                const prev = obj.element.previousElementSibling;
                const next = obj.placeholder.nextElementSibling;

                if (prev && isAbove(obj.element, prev)) {
                    swap(obj.placeholder, obj.element);
                    swap(obj.placeholder, prev);
                    obj.swapCallback(prev);
                    return;
                }

                if (next && isAbove(next, obj.element)) {
                    swap(next, obj.placeholder);
                    swap(next, obj.element);
                    obj.swapCallback(next);
                }
            }
            
            const mouseUpHandler = () => {
                obj.placeholder && obj.placeholder.parentNode.removeChild(obj.placeholder);
                obj.dragging = false;

                obj.element.style.removeProperty("position");
                obj.element.style.removeProperty("top");
                obj.element.style.removeProperty("left");
                obj.element.style.removeProperty("width");

                document.removeEventListener("mousemove", mouseMoveHandler);
                document.removeEventListener("mouseup", mouseUpHandler);
            };
    
            const mouseDownHandler = evt => {
                const rect = obj.element.getBoundingClientRect();
                obj.x = evt.pageX - rect.left;
                obj.y = evt.pageY - rect.top;

                document.addEventListener("mousemove", mouseMoveHandler);
                document.addEventListener("mouseup", mouseUpHandler);
            };
    
            this.handler = mouseDownHandler;
            this.trigger.addEventListener("mousedown", this.handler);

            this.attached = true;
        }
    }
}