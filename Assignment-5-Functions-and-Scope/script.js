// Functions and scope
function rectangleArea(length = 5, width = 4) { return length * width; }
const calculateArea = (length = 5, width = 4) => length * width;
console.log(`Standard Function Area (Default 5x4): ${rectangleArea()}`);
console.log(`Arrow Function Area (Custom 10x3): ${calculateArea(10, 3)}`);
if (true) {
  let blockVar = "inside block";
  console.log(blockVar);
}
try { console.log(blockVar); }
catch (error) { console.log(`Scope Test Error: ${error.name}: blockVar is not defined`); }