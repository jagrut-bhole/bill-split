document.getElementById("showPieChart").addEventListener("click", function () {
  fetchGroupSpendingData().then((data) => {
    displayChart("pie", data);
  });
});

document.getElementById("showOldMonthGraph").addEventListener("click", function () {
  fetchMonthlySpendingData().then((data) => {
    displayChart("bar", data);
  });
});

function displayChart(type, data) {
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

// Functions to fetch data from the server
async function fetchGroupSpendingData() {
  const response = await fetch("/api/group-spending");
  const data = await response.json();
  return {
    labels: data.labels, // Group names
    datasets: [
      {
        label: "Group Spending",
        data: data.amounts, // Spending amounts per group
        backgroundColor: ["#ff6384", "#36a2eb", "#cc65fe", "#ffce56", "#ff9f40"],
      },
    ],
  };
}

async function fetchMonthlySpendingData() {
  const response = await fetch("/api/monthly-spending");
  const data = await response.json();
  return {
    labels: data.labels, // Category names
    datasets: [
      {
        label: "Monthly Spending",
        data: data.amounts, // Spending amounts per category
        backgroundColor: ["#ff6384", "#36a2eb", "#cc65fe", "#ffce56", "#ff9f40"],
      },
    ],
  };
}
