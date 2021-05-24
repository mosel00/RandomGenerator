const width = 500;
const height = 500;
const diagonal = 0.9 * width;

const epsilon = 0.0001;

const maxSpeed = 2 * Math.PI;
const maxOffset = 2 * Math.PI;
const reduction = 0.01;
const scaling = 0.5; 

const removalSymbol = '\u00D7';
const dragSymbol = '\u2261';
const openSymbol = '>';

const fullConfigIndex = 0;
const wheelConfigIndex = 1;

const splitterThickness = "10px";