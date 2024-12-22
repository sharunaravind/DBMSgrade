function createDistributionChart(grades) {
  if (distributionChart) {
    distributionChart.destroy();
  }

  const ctx = document.getElementById("gradeDistribution").getContext("2d");
  const totals = grades.map((grade) => calculateTotal(grade));
  const { mean, standardDeviation } = calculateGaussianParameters(totals);

  // Create histogram data
  const binCount = Math.ceil(Math.sqrt(totals.length));
  //   const binCount = 20;
  const binWidth = (Math.max(...totals) - Math.min(...totals)) / binCount;
  const histogramData = Array(binCount).fill(0);

  totals.forEach((total) => {
    const binIndex = Math.floor((total - Math.min(...totals)) / binWidth);
    histogramData[Math.min(binIndex, binCount - 1)]++;
  });

  // Generate Gaussian curve points
  const gaussianPoints = [];
  const xMin = Math.min(...totals) - binWidth;
  const xMax = Math.max(...totals) + binWidth;
  const step = (xMax - xMin) / 50;

  for (let x = xMin; x <= xMax; x += step) {
    gaussianPoints.push({
      x: x,
      y: gaussianFunction(x, mean, standardDeviation) * grades.length * binWidth,
    });
  }

  distributionChart = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          type: "bar",
          label: "Grade Distribution",
          data: histogramData.map((count, i) => ({
            x: Math.min(...totals) + (i + 0.5) * binWidth,
            y: count,
          })),
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          barPercentage: 1,
          categoryPercentage: 1,
        },
        {
          type: "line",
          label: "Normal Distribution",
          data: gaussianPoints,
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "linear",
          position: "bottom",
          title: {
            display: true,
            text: "Total Score",
          },
        },
        y: {
          title: {
            display: true,
            text: "Frequency",
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return `Score: ${context.parsed.x.toFixed(1)}, Count: ${context.parsed.y.toFixed(0)}`;
            },
          },
        },
      },
    },
  });

  return distributionChart;
}
