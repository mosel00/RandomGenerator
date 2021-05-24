imports(
    "scripts/constants.js",
    "https://cdn.jsdelivr.net/npm/p5@1.2.0/lib/p5.js"
);

class WheelOption {
    constructor(name, weight = 0, action = { type: 0, data: {}, action: () => {} }, previousProcenturalSum = 1, procenturalWeight = 0, color = 0) {
        this.name = name;
        this.weight = weight, 
        this.action = action;
        this.start = previousProcenturalSum * 2 * Math.PI, 
        this.end = (previousProcenturalSum + procenturalWeight) * 2 * Math.PI 
        this.color = color;
    }
}

class Wheel {
    constructor(weights, defaultAction) {
        this.weights = new Array(weights.length);
        this.defaultAction = defaultAction;

        this.sum = 0;
        for (let i = 0; i < weights.length; i++) {
            this.sum += Math.max(weights[i].weight, 0);
            this.weights[i] = new WheelOption("", weights[i].weight);
        }

        this.recalculate();

        this.reset();
    }

    addWeight() {
        const option = new WheelOption("Option");
        option.action.action = this.defaultAction(option);
        this.weights.push(option);
    }

    modifyWeight(index, value) {
        let oldWeight = this.weights[index].weight;
        this.weights[index].weight = value;

        this.sum += value - oldWeight;
    
        this.recalculateWeights();
    }

    modifyName(index, name) {
        this.weights[index].name = name;
    }
    
    modifyAction(index, action) {
        this.weights[index].action = action;
    }

    removeWeight(index) {
        this.sum -= this.weights[index].weight;
        this.weights.splice(index, 1);

        this.recalculate();
    }

    recalculate() {
        this.recalculateWeights();
    }

    recalculateWeights() {
        let s = 0;
        for (let i = 0; i < this.weights.length; i++) {
            let w = Math.max(this.weights[i].weight, 0) / this.sum;
            this.weights[i].start = s * 2 * Math.PI;
            this.weights[i].end = (s + w) * 2 * Math.PI;
            s += w;
        }
    }

    spin() {
        let offset = Math.random(-maxOffset, maxOffset);
        this.velocity = maxSpeed + offset;
        this.spinning = true;
    }

    draw(sketch) {
        sketch.stroke(0);
        sketch.strokeWeight(2);

        if (this.sum === 0) {
            sketch.fill(0);
            sketch.circle(width / 2, height / 2, diagonal);
        } else {
            const even = sketch.color(0x00, 0xA7, 0xCC);
            const odd = sketch.color(0x33);

            for (let i = 0; i < this.weights.length; i++) {
                sketch.fill(i % 2 == 0 ? even : odd); // sketch.fill(this.weights[i].color);
                this.drawArc(sketch, this.rotated + this.weights[i].start, this.rotated + this.weights[i].end);
            }
        }

        if (this.spinning) {
            this.rotated += this.velocity * sketch.deltaTime;
            this.rotated = this.mod(this.rotated, 2 * Math.PI);

            this.velocity *= Math.pow(scaling, reduction * sketch.deltaTime);
            
            if (this.velocity < epsilon) {
                this.spinning = false;
                this.velocity = 0;
                this.onFinished();
            }
        }
    }

    mod(value, base) {
        return value - base * Math.floor(value / base);
    }

    drawArc(sketch, start, end) {
        sketch.arc(width / 2, height / 2, diagonal, diagonal, start - 0.5 * Math.PI, end - 0.5 * Math.PI, sketch.PIE);
    }

    onFinished() {
        let result = undefined;
        if (this.sum === 0) {
            result = this.weights[0];
        } else {
            let shifted = this.mod(-this.rotated, 2 * Math.PI);
            for (let i = 0; i < this.weights.length; i++) {
                if (this.weights[i].start <= shifted && shifted < this.weights[i].end) {
                    result = [i, this.weights[i]];
                    break;
                }
            }
        }

        if (result[1] !== undefined) {
            result[1].action.action();
        }
    }

    reset() {
        this.velocity = 0;
        this.spinning = false;
        this.rotated = 0;
    }
}