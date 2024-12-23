// Calculate total score from all components
function calculateTotalScore(grade) {
  return (grade.t_total + grade.ap + grade.tutorial) / (40 / 50) + grade.finals / (60 / 50);
}

// Calculate percentile based on total scores
function calculatePercentile(grades, currentGrade) {
  const allTotalScores = grades.map(calculateTotalScore);
  const currentTotalScore = calculateTotalScore(currentGrade);
  const higherScores = allTotalScores.filter((score) => score <= currentTotalScore).length;
  return ((higherScores / allTotalScores.length) * 100).toFixed(1);
}

// Calculate mean and standard deviation
function calculateStatistics(data) {
  const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
  const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length;
  const standardDeviation = Math.sqrt(variance);
  return { mean, standardDeviation };
}

// Calculate Gaussian function value
function gaussianFunction(x, mean, standardDeviation) {
  return (
    (1 / (standardDeviation * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(standardDeviation, 2)))
  );
}

//caluclate cpga from final score.
function calculateCgpa(totalScore) {
  console.log(totalScore);
  if (totalScore >= 91) return 10;
  if (totalScore >= 81) return 9;
  if (totalScore >= 71) return 8;
  if (totalScore >= 61) return 7;
  if (totalScore >= 56) return 6;
  if (totalScore >= 50) return 5;
  return null; // Return null for scores below 50
}
