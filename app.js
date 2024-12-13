const prayerForm = document.getElementById("prayerForm");
const resultDiv = document.getElementById("result");
const weeklyChartCanvas = document.getElementById("weeklyChart");
const clearDailyDataButton = document.getElementById("clearDailyData");
const clearWeeklyDataButton = document.getElementById("clearWeeklyData");

// Auto-load saved data
const savedData = JSON.parse(localStorage.getItem("salahData")) || {};
const weeklyProgress = JSON.parse(localStorage.getItem("weeklyProgress")) || [];

// Initialize Chart.js
let chart;
function updateChart() {
  const dates = weeklyProgress.map((entry) => entry.date);
  const scores = weeklyProgress.map((entry) => entry.score);

  if (chart) chart.destroy();
  chart = new Chart(weeklyChartCanvas, {
    type: "bar",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Daily Salah Score (%)",
          data: scores.map((score) => (score / 60) * 100),
          backgroundColor: "#00B8D4",
          borderColor: "#008EAA",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
        },
      },
    },
  });
}

// Populate form with saved data
Object.keys(savedData).forEach((id) => {
  const input = document.getElementById(id);
  if (input) {
    if (input.type === "checkbox") {
      input.checked = savedData[id];
    } else {
      input.value = savedData[id];
    }
  }
});

prayerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  let totalScore = 0;
  ["fajr", "dhuhr", "asr", "maghrib", "isha"].forEach((prayer) => {
    const time = parseInt(document.getElementById(`${prayer}Time`).value) || 0;
    const khusho = parseInt(document.getElementById(`${prayer}Khusho`).value) || 0;
    const sunnah = document.getElementById(`${prayer}Sunnah`).checked ? 1 : 0;

    totalScore += time + khusho + sunnah;

    savedData[`${prayer}Time`] = time;
    savedData[`${prayer}Khusho`] = khusho;
    savedData[`${prayer}Sunnah`] = sunnah;
  });

  const today = new Date().toISOString().split("T")[0];
  const index = weeklyProgress.findIndex((entry) => entry.date === today);
  if (index !== -1) {
    weeklyProgress[index].score = totalScore;
  } else {
    weeklyProgress.push({ date: today, score: totalScore });
  }

  localStorage.setItem("salahData", JSON.stringify(savedData));
  localStorage.setItem("weeklyProgress", JSON.stringify(weeklyProgress));

  resultDiv.innerHTML = `Total Score: ${totalScore}/60 (${((totalScore / 60) * 100).toFixed(2)}%)`;
  updateChart();
});

// Clear daily data
clearDailyDataButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear today's data?")) {
    const today = new Date().toISOString().split("T")[0];
    const index = weeklyProgress.findIndex((entry) => entry.date === today);
    if (index !== -1) weeklyProgress.splice(index, 1);

    Object.keys(savedData).forEach((key) => (savedData[key] = ""));
    localStorage.setItem("salahData", JSON.stringify(savedData));
    localStorage.setItem("weeklyProgress", JSON.stringify(weeklyProgress));

    document.querySelectorAll("input").forEach((input) => {
      if (input.type === "checkbox") input.checked = false;
      else input.value = "";
    });

    updateChart();
    resultDiv.innerHTML = "Daily data cleared!";
  }
});

// Clear weekly data
clearWeeklyDataButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all weekly data?")) {
    weeklyProgress.length = 0;
    localStorage.setItem("weeklyProgress", JSON.stringify(weeklyProgress));
    updateChart();
    resultDiv.innerHTML = "Weekly data cleared!";
  }
});

// Initialize the chart
updateChart();
