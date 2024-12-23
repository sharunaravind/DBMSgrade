// Fetch CGPA data and populate the table
async function fetchAndDisplayCGPA() {
  try {
    const response = await fetch("/api/grades/cgpa", {
      method: "GET",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch CGPA data.");
    }

    const data = await response.json();
    console.log("hoioi", data);
    const tableBody = document.getElementById("cgpa-table").querySelector("tbody");

    // Clear existing rows
    tableBody.innerHTML = "";

    // Populate rows
    data.forEach((student) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${student.roll_no}</td>
        <td>${student.WAD ?? "N/A"}</td>
        <td>${student.DS ?? "N/A"}</td>
        <td>${student.SPC ?? "N/A"}</td>
        <td>${student.MFCS ?? "N/A"}</td>
        <td>${student.DBMS ?? "N/A"}</td>
        <td>${student.overall_cgpa}</td>
      `;

      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching CGPA data:", error);
  }
}

// Logout functionality
// function logout() {
//   localStorage.removeItem("token");
//   window.location.href = "login.html";
// }

// Fetch data on page load
window.onload = fetchAndDisplayCGPA();
