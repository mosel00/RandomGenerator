imports(
    "scripts/constants.js",
    "https://cdn.jsdelivr.net/npm/p5@1.2.0/lib/p5.js"
);

class WheelOption {
    constructor(weight = 0, text = "", previousProcenturalSum = 1, procenturalWeight = 0, color = 0) {
        this.weight = weight, 
        this.start = previousProcenturalSum * TWO_PI, 
        this.end = (previousProcenturalSum + procenturalWeight) * TWO_PI 
        this.color = color;

        if (text === undefined) {
            text = "";
        }

        this.text = text;
    }
}

class Wheel {
    constructor(onResult, weights = []) {
        this.weights = new Array(weights.length);
        this.onResult = onResult;

        this.sum = 0;
        for (let i = 0; i < weights.length; i++) {
            this.sum += Math.max(weights[i].weight, 0);
            this.weights[i] = new WheelOption(weights[i].weight, weights[i].text);
        }

        this.recalculate();

        this.reset();
    }

    addWeight() {
        this.weights.push(new WheelOption());

        this.recalculateColors();
    }

    modifyWeight(index, value) {
        let oldWeight = this.weights[index].weight;
        this.weights[index].weight = value;

        this.sum += value - oldWeight;
    
        this.recalculateWeights();
    }

    modifyText(index, value) {
        this.weights[index].text = value;
    }

    removeWeight(index) {
        this.sum -= this.weights[index].weight;
        this.weights.splice(index, 1);

        this.recalculate();
    }

    recalculate() {
        this.recalculateColors();
        this.recalculateWeights();
    }

    recalculateColors() {
        let randomColor = () => {
            let shuffle = (arr) => {
                for (let i = arr.length - 1; i > 0; i--) {
                    let j = Math.floor(Math.random() * (i + 1));
                    let temp = arr[i];
                    arr[i] = arr[j];
                    arr[j] = temp;
                }
            }
            
            let colors = new Array(this.weights.length);
        
            colorMode(HSB);
            for (let i = 0; i < this.weights.length; i++) {
                let hue = i / this.weights.length;
                colors[i] = color(hue * 360, 100, 100);
            }
        
            shuffle(colors);
            
            for (let i = 0; i < this.weights.length; i++) {
                this.weights[i].color = colors[i];
            }
        }

        let twoColor = () => {
            const even = color(0x00, 0xA7, 0xCC);
            const odd = color(0x33);

            for (let i = 0; i < this.weights.length; i++) {
                this.weights[i].color = i % 2 == 0 ? even : odd;
            }
        }

        twoColor();
    }

    recalculateWeights() {
        let s = 0;
        for (let i = 0; i < this.weights.length; i++) {
            let w = Math.max(this.weights[i].weight, 0) / this.sum;
            this.weights[i].start = s * TWO_PI;
            this.weights[i].end = (s + w) * TWO_PI;
            s += w;
        }
    }

    spin() {
        let offset = Math.random(-maxOffset, maxOffset);
        this.velocity = maxSpeed + offset;
        this.spinning = true;
    }

    draw() {
        stroke(0);
        strokeWeight(2);

        if (this.sum === 0) {
            fill(0);
            circle(width / 2, height / 2, diagonal);
        } else {
            for (let i = 0; i < this.weights.length; i++) {
                fill(this.weights[i].color);
                this.drawArc(this.rotated + this.weights[i].start, this.rotated + this.weights[i].end);
            }
        }

        if (this.spinning) {
            this.rotated += this.velocity * deltaTime;
            this.rotated = this.mod(this.rotated, TWO_PI);

            this.velocity *= pow(scaling, reduction * deltaTime);
            
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

    drawArc(start, end) {
        arc(width / 2, height / 2, diagonal, diagonal, start - HALF_PI, end - HALF_PI, PIE);
    }

    onFinished() {
        let result = undefined;
        if (this.sum === 0) {
            result = this.weights[0];
        } else {
            let shifted = this.mod(-this.rotated, TWO_PI);
            for (let i = 0; i < this.weights.length; i++) {
                if (this.weights[i].start <= shifted && shifted < this.weights[i].end) {
                    result = [i, this.weights[i]];
                    break;
                }
            }
        }

        this.onResult(result);
    }

    reset() {
        this.velocity = 0;
        this.spinning = false;
        this.rotated = 0;
    }
}