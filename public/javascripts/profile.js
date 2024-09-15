document.getElementById("showPieChart").addEventListener("click", function () {
  displayChart("pie");
});

document
  .getElementById("showOldMonthGraph")
  .addEventListener("click", function () {
    displayChart("bar");
  });

function displayChart(type) {
  // Dummy data for the example
  const data = {
    labels: ["Rent", "Food", "Utilities", "Transport", "Miscellaneous"],
    datasets: [
      {
        label: "Monthly Spending",
        data: [500, 200, 100, 150, 50],
        backgroundColor: [
          "#ff6384",
          "#36a2eb",
          "#cc65fe",
          "#ffce56",
          "#ff9f40",
        ],
      },
    ],
  };

  const config = {
    type: type,
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  };

  // Clear previous chart
  document.getElementById("chartContainer").innerHTML = "";

  const canvas = document.createElement("canvas");
  document.getElementById("chartContainer").appendChild(canvas);

  new Chart(canvas.getContext("2d"), config);
}
