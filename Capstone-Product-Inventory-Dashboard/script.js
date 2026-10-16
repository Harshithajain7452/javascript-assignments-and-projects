// Capstone: Interactive Product Inventory & Analytics Dashboard
console.log("--- Initializing Inventory System ---");
const inventory = [{name:"Laptop",price:800},{name:"Mouse",price:25}];
const nameText = prompt('Enter new product name:', "Monitor");
const priceText = prompt('Enter new product price:', "150");
const name = nameText === null ? "" : nameText.trim();
const price = Number(priceText);
if (!name || priceText === null || priceText.trim() === "" || !Number.isFinite(price) || price < 0) {
  console.log("Invalid product details. Enter a name and non-negative price.");
} else {
  inventory.push({name, price});
  function categoryFor(amount) {
    if (amount < 100) return "Budget";
    else if (amount < 500) return "Standard";
    else return "Premium";
  }
  const badgeFor = category => {
    switch (category) {
      case "Budget": return "[BUDGET]";
      case "Standard": return "[STANDARD]";
      case "Premium": return "[PREMIUM]";
      default: return "[UNKNOWN]";
    }
  };
  console.log(`\n[Prompt executed: User adds "${name}" at "$${price}"]`);
  console.log("\n--- Processing Inventory Roster (forEach) ---");
  inventory.forEach(item => console.log(`* Item: ${item.name} ($${item.price}) -> Category: ${categoryFor(item.price)} ${badgeFor(categoryFor(item.price))}`));
  const totalValue = items => items.reduce((sum, item) => sum + item.price, 0);
  const withTax = (amount, taxRate = 0.05) => amount + amount * taxRate;
  const affordable = inventory.filter(item => item.price < 200).map(item => item.name);
  const report = inventory.map(item => `${item.name.toUpperCase()}: $${item.price}`);
  console.log("\n--- Financial Analytics ---");
  console.log(`Total Inventory Value: $${totalValue(inventory)}`);
  console.log(`Total Inventory Value with 5% tax (illustrative): $${withTax(totalValue(inventory)).toFixed(2)}`);
  console.log(`Filtered Affordable Items (Under $200): ${JSON.stringify(affordable)}`);
  console.log(`Formatted Report List: ${JSON.stringify(report)}`);
}