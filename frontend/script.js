const API_URL = "http://localhost:3000/api/measurements";
const METRICS_URL = "http://localhost:3000/api/measurements/metrics";


const fieldSelect = document.getElementById("field");
const startInput = document.getElementById("startDate");
const endInput = document.getElementById("endDate");
const loadBtn = document.getElementById("loadBtn");

const avgEl = document.getElementById("avg");
const minEl = document.getElementById("min");
const maxEl = document.getElementById("max");
const stdEl = document.getElementById("std");

const ctx = document.getElementById("chart").getContext("2d");

let chart;

// кнопка загрузки
loadBtn.addEventListener("click", async () => {
  const field = fieldSelect.value;
  const start = startInput.value;
  const end = endInput.value;

  if (!start || !end) {
    alert("Please select start and end dates");
    return;
  }

  // --- fetch time-series data ---
const dataRes = await fetch(
  `${API_URL}?field=${field}&start_date=${start}&end_date=${end}`
);

  const data = await dataRes.json();

  // --- fetch metrics ---
 const metricsRes = await fetch(
  `${METRICS_URL}?field=${field}&start_date=${start}&end_date=${end}`
);

  const metrics = await metricsRes.json();

  updateMetrics(metrics);
  drawChart(data, field);
});

function updateMetrics(m) {
  avgEl.textContent = m.avg?.toFixed(2) ?? "-";
  minEl.textContent = m.min?.toFixed(2) ?? "-";
  maxEl.textContent = m.max?.toFixed(2) ?? "-";
  stdEl.textContent = m.stdDev?.toFixed(2) ?? "-";
}

function drawChart(data, field) {
  const labels = data.map(d =>
    new Date(d.timestamp).toLocaleString()
  );
  const values = data.map(d => d[field]);

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: field,
          data: values,
          borderWidth: 2,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: "Time",
          },
        },
        y: {
          title: {
            display: true,
            text: field,
          },
        },
      },
    },
  });
}
