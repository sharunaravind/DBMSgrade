let distributionChart = null;

function showDistributionChart(grades) {
  const ctx = document.getElementById('gradeDistribution').getContext('2d');
  
  if (distributionChart) {
    distributionChart.destroy();
  }

  // Calculate total scores and their percentiles
  const totalScores = grades.map(calculateTotalScore);
  const { mean, standardDeviation } = calculateStatistics(totalScores);

  // Create histogram data
  const binCount = Math.ceil(Math.sqrt(totalScores.length)); // Sturges' formula
  const min = Math.min(...totalScores);
  const max = Math.max(...totalScores);
  const binWidth = (max - min) / binCount;
  
  // Initialize bins
  const bins = Array(binCount).fill(0);
  totalScores.forEach(score => {
    const binIndex = Math.min(Math.floor((score - min) / binWidth), binCount - 1);
    bins[binIndex]++;
  });

  // Generate points for Gaussian curve
  const gaussianPoints = [];
  const step = (max - min) / 50;
  for (let x = min; x <= max; x += step) {
    gaussianPoints.push({
      x: x,
      y: gaussianFunction(x, mean, standardDeviation) * grades.length * binWidth
    });
  }

  distributionChart = new Chart(ctx, {
    data: {
      datasets: [
        {
          type: 'bar',
          label: 'Score Distribution',
          data: bins.map((count, i) => ({
            x: min + (i + 0.5) * binWidth,
            y: count
          })),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          type: 'line',
          label: 'Normal Distribution',
          data: gaussianPoints,
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          fill: false,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          title: {
            display: true,
            text: 'Total Score'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Frequency'
          },
          beginAtZero: true
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const dataset = context.dataset;
              if (dataset.type === 'bar') {
                return `Count: ${context.parsed.y}`;
              } else {
                return `Value: ${context.parsed.y.toFixed(2)}`;
              }
            }
          }
        },
        title: {
          display: true,
          text: 'Grade Distribution with Normal Curve'
        }
      }
    }
  });
}