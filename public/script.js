let token = '';
let currentSubject = '';
let bellCurveChart = null;

async function signup() {
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const subject = document.getElementById('subject-select').value;

    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, subject })
        });

        if (response.ok) {
            alert('Signup successful! Please login.');
        } else {
            const data = await response.json();
            alert(data.error);
        }
    } catch (error) {
        alert('Error during signup');
    }
}

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            token = data.token;
            currentSubject = data.subject;
            document.getElementById('auth-section').classList.add('hidden');
            document.getElementById('main-section').classList.remove('hidden');
            document.getElementById('current-subject').textContent = `Current Subject: ${currentSubject}`;
            viewGrades();
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert('Error during login');
    }
}

function generateStudentFields() {
    const numStudents = document.getElementById('num-students').value;
    const container = document.getElementById('student-fields');
    container.innerHTML = '';

    for (let i = 0; i < numStudents; i++) {
        const div = document.createElement('div');
        div.className = 'student-row';
        div.innerHTML = `
            <input type="text" placeholder="Roll No" class="roll-no" required>
            <input type="number" placeholder="T1" class="t1" min="0" max="100" required>
            <input type="number" placeholder="T2" class="t2" min="0" max="100" required>
            <input type="number" placeholder="AP" class="ap" min="0" max="100" required>
            <input type="number" placeholder="Tutorial" class="tutorial" min="0" max="100" required>
            <input type="number" placeholder="Finals" class="finals" min="0" max="100" required>
        `;
        container.appendChild(div);
    }
}

async function submitGrades() {
    const studentRows = document.querySelectorAll('.student-row');
    const grades = [];

    studentRows.forEach(row => {
        const grade = {
            subject: currentSubject,
            roll_no: row.querySelector('.roll-no').value,
            t1: parseFloat(row.querySelector('.t1').value),
            t2: parseFloat(row.querySelector('.t2').value),
            ap: parseFloat(row.querySelector('.ap').value),
            tutorial: parseFloat(row.querySelector('.tutorial').value),
            finals: parseFloat(row.querySelector('.finals').value)
        };
        grades.push(grade);
    });

    try {
        for (const grade of grades) {
            const response = await fetch('/api/grades', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(grade)
            });

            if (!response.ok) {
                throw new Error('Failed to submit grades');
            }
        }
        alert('Grades submitted successfully');
        viewGrades();
    } catch (error) {
        alert('Error submitting grades');
    }
}

async function deleteGrade(id) {
    if (!confirm('Are you sure you want to delete this grade?')) return;

    try {
        const response = await fetch(`/api/grades/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            viewGrades();
        } else {
            throw new Error('Failed to delete grade');
        }
    } catch (error) {
        alert('Error deleting grade');
    }
}

async function viewGrades() {
    try {
        const response = await fetch(`/api/grades/${currentSubject}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const grades = await response.json();
        displayGradesTable(grades);
        showDistributionChart(grades);
    } catch (error) {
        alert('Error fetching grades');
    }
}

function calculatePercentile(scores, score) {
    if (scores.length === 0) return 0;
    const belowCount = scores.filter(s => s < score).length;
    return ((belowCount / scores.length) * 100).toFixed(1);
}

function displayGradesTable(grades) {
    const finalsScores = grades.map(grade => grade.finals);
    const gradesWithPercentile = grades.map(grade => ({
        ...grade,
        percentile: calculatePercentile(finalsScores, grade.finals)
    }));

    gradesWithPercentile.sort((a, b) => b.finals - a.finals);

    const container = document.getElementById('grades-table');
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
                    <th>Percentile</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${gradesWithPercentile.map(grade => `
                    <tr>
                        <td>${grade.roll_no}</td>
                        <td>${grade.t1}</td>
                        <td>${grade.t2}</td>
                        <td>${grade.t_total}</td>
                        <td>${grade.ap}</td>
                        <td>${grade.tutorial}</td>
                        <td>${grade.finals}</td>
                        <td>${grade.percentile}%</td>
                        <td>
                            <button onclick="deleteGrade(${grade.id})" class="delete-btn">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function showDistributionChart(grades) {
    const ctx = document.getElementById('bellCurve').getContext('2d');
    
    // Destroy existing chart if it exists
    if (bellCurveChart) {
        bellCurveChart.destroy();
    }

    const finalsScores = grades.map(grade => grade.finals);
    const rollNos = grades.map(grade => grade.roll_no);

    bellCurveChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Student Scores',
                data: finalsScores.map((score, i) => ({
                    x: score,
                    y: calculatePercentile(finalsScores, score),
                    rollNo: rollNos[i]
                })),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Final Scores'
                    },
                    min: 0,
                    max: 100
                },
                y: {
                    title: {
                        display: true,
                        text: 'Percentile'
                    },
                    min: 0,
                    max: 100
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const point = context.raw;
                            return `Roll No: ${point.rollNo}, Score: ${point.x}, Percentile: ${point.y}%`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Score Distribution'
                }
            }
        }
    });
}