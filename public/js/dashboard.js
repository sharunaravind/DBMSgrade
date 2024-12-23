// Handle file uploads
async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const token = localStorage.getItem("token");
    const response = await fetch("/api/grades/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const result = await response.json();
    alert(`Grades uploaded successfully! ${result.count} records processed.`);
    viewGrades();
  } catch (error) {
    alert("Error uploading file: " + error.message);
  }
}

// Generate input fields for manual grade entry
function generateStudentFields() {
  const numStudents = document.getElementById("num-students").value;
  const container = document.getElementById("student-fields");
  container.innerHTML = "";

  for (let i = 0; i < numStudents; i++) {
    const div = document.createElement("div");
    div.className = "student-row";
    div.innerHTML = `
      <input type="text" placeholder="Roll No" class="roll-no" required>
      <input type="number" placeholder="T1" class="t1" min="0" max="20" required>
      <input type="number" placeholder="T2" class="t2" min="0" max="20" required>
      <input type="number" placeholder="AP" class="ap" min="0" max="15" required>
      <input type="number" placeholder="Tutorial" class="tutorial" min="0" max="15" required>
      <input type="number" placeholder="Finals" class="finals" min="0" max="50" required>
    `;
    container.appendChild(div);
  }
}

// Submit grades from manual entry
async function submitGrades() {
  const studentRows = document.querySelectorAll(".student-row");
  const grades = [];

  studentRows.forEach((row) => {
    const grade = {
      subject: localStorage.getItem("subject"),
      roll_no: row.querySelector(".roll-no").value,
      t1: parseFloat(row.querySelector(".t1").value),
      t2: parseFloat(row.querySelector(".t2").value),
      ap: parseFloat(row.querySelector(".ap").value),
      tutorial: parseFloat(row.querySelector(".tutorial").value),
      finals: parseFloat(row.querySelector(".finals").value),
    };
    grades.push(grade);
  });

  try {
    const token = localStorage.getItem("token");
    for (const grade of grades) {
      const response = await fetch("/api/grades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(grade),
      });

      if (!response.ok) {
        throw new Error("Failed to submit grades");
      }
    }
    alert("Grades submitted successfully");
    viewGrades();
  } catch (error) {
    alert("Error submitting grades: " + error.message);
  }
}

// Initialize the dashboard
document.addEventListener("DOMContentLoaded", () => {
  const subject = localStorage.getItem("subject");
  if (subject) {
    document.getElementById("current-subject").textContent = `Subject: ${subject}`;
    viewGrades();
  }
});
