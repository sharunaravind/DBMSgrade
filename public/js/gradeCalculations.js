// Calculate total score from all components
function calculateTotalScore(grade) {
  return (
    grade.t_total + // T_total (max 20)
    grade.ap +      // AP (max 15)
    grade.tutorial + // Tutorial (max 15)
    grade.finals    // Finals (max 50)
  );
}

// Calculate percentile based on total scores
function calculatePercentile(grades, currentGrade) {
  const allTotalScores = grades.map(calculateTotalScore);
  const currentTotalScore = calculateTotalScore(currentGrade);
  const higherScores = allTotalScores.filter(score => score <= currentTotalScore).length;
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
  return (1 / (standardDeviation * Math.sqrt(2 * Math.PI))) * 
         Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(standardDeviation, 2)));
}