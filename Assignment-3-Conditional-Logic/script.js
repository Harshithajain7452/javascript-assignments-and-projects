// Conditional logic
const scoreText = prompt("Enter test score (0-100):", "85");
const score = Number(scoreText);
if (scoreText === null || scoreText.trim() === "" || !Number.isFinite(score) || score < 0 || score > 100) {
  console.log("Invalid score.");
} else {
  let grade;
  if (score >= 90) grade = "A";
  else if (score >= 80) grade = "B";
  else if (score >= 70) grade = "C";
  else if (score >= 60) grade = "D";
  else grade = "F";
  let description;
  switch (grade) {
    case "A": description = "Excellent"; break;
    case "B": description = "Good"; break;
    case "C": description = "Average"; break;
    case "D": description = "Needs Improvement"; break;
    default: description = "Failing";
  }
  const status = score >= 40 ? "Passed" : "Failed";
  console.log(`Score: ${score}`);
  console.log(`Grade: ${grade}`);
  console.log(`Status: ${status}`);
  console.log(`Grade Description: ${description}`);
}