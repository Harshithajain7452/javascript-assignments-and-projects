// Operators, expressions, and input handling
const billText = prompt("Enter bill amount:", "100");
const tipText = prompt("Enter tip percentage:", "15");
const bill = Number(billText), percent = Number(tipText);
if (billText === null || tipText === null || billText.trim() === "" || tipText.trim() === "" || !Number.isFinite(bill) || !Number.isFinite(percent) || bill < 0 || percent < 0) {
  console.log("Invalid input. Enter non-negative numbers.");
} else {
  const tip = bill * percent / 100;
  let total = bill;
  total += tip;
  console.log(`Subtotal: $${bill}`);
  console.log(`Tip Percentage: ${percent}%`);
  console.log(`Calculated Tip: $${tip}`);
  console.log(`Total Amount to Pay: $${total}`);
}