// Grade display functionality
async function viewGrades() {
  try {
    const token = localStorage.getItem("token");
    const subject = localStorage.getItem("subject");
    const response = await fetch(`/api/grades/${subject}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const grades = await response.json();
    displayGradesTable(grades);
    showDistributionChart(grades);
  } catch (error) {
    alert("Error fetching grades");
  }
}

function displayGradesTable(grades) {
  // Calculate total scores and percentiles based on total scores
  const gradesWithTotals = grades.map((grade) => ({
    ...grade,
    total_score: calculateTotalScore(grade),
  }));

  const gradesWithPercentile = gradesWithTotals.map((grade) => ({
    ...grade,
    percentile: calculatePercentile(grades, grade),
  }));

  const gradesWithCgpa = gradesWithPercentile.map((grade) => ({
    ...grade,
    cgpa: calculateCgpa(grade.total_score),
  }));

  // Sort by total score
  gradesWithPercentile.sort((a, b) => b.total_score - a.total_score);

  gradesWithCgpa.sort((a, b) => b.total_score - a.total_score);

  const container = document.getElementById("grades-table");
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Roll No</th>
          <th>T1</th>
          <th>T2</th>
          <th>T Total</th>
          <th>AP</th>
          <th>Tutorial</th>
          <th>Finals</th>
          <th>Total Score</th>
          <th>Cgpa</th>
          <th>Percentile</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${gradesWithCgpa
          .map(
            (grade) => `
          <tr>
            <td>${grade.roll_no}</td>
            <td>${grade.t1}</td>
            <td>${grade.t2}</td>
            <td>${grade.t_total}</td>
            <td>${grade.ap}</td>
            <td>${grade.tutorial}</td>
            <td>${grade.finals}</td>
            <td>${grade.total_score.toFixed(1)}</td>
            <td>${grade.cgpa !== null ? grade.cgpa : "N/A"}</td>
            <td>${grade.percentile}%</td>
            <td>
              <button onclick="deleteGrade(${grade.id})" class="delete-btn">Delete</button>
            </td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

async function deleteGrade(id) {
  if (!confirm("Are you sure you want to delete this grade?")) return;

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`/api/grades/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      viewGrades();
    } else {
      throw new Error("Failed to delete grade");
    }
  } catch (error) {
    alert("Error deleting grade");
  }
}
