// Loop control structures
console.log("-- Multiplication Table of 5 --");
for (let i = 1; i <= 5; i++) console.log(`5 x ${i} = ${5 * i}`);
console.log("\n-- First number > 10 divisible by 6 --");
let n = 11;
while (true) {
  if (n > 10 && n % 6 === 0) { console.log(`Found: ${n}`); break; }
  n++;
}
console.log("\n-- do...while with continue --");
let count = 0;
do {
  count++;
  if (count === 2 || count === 4) continue;
  console.log(`Number: ${count}`);
} while (count < 5);