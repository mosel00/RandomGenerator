imports(
    "scripts/constants.js",
    "scripts/config.js",
    "scripts/util.js",
    "https://cdn.jsdelivr.net/npm/p5@1.2.0/lib/p5.js"
);

const wheelSketch = cfg => sketch => {
    let backgroundColor = 0;
    let triangleColor = 0;

    sketch.setup = () => {
        sketch.createCanvas(width, height);
        backgroundColor = sketch.color(0x1E);
        triangleColor = sketch.color(0xFF);
    };

    sketch.draw = () => {
        sketch.background(backgroundColor);

        cfg.wheel.draw(sketch);

        sketch.fill(triangleColor);
        sketch.stroke(0);
        sketch.strokeWeight(2);
        sketch.triangle(
            (0.5 - 0.02) * width, 0.025 * height,
            (0.5 + 0.02) * width, 0.025 * height,
            0.5 * width, (0.1 + 0.05) * height,
        );
    };
};