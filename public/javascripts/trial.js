const ctx1 = document
  .querySelector(".category-expense-chart .chart")
  .getContext("2d");
const categoryChart = new Chart(ctx1, {
  type: "doughnut",
  data: {
    labels: [
      "Entertainment",
      "Food & drink",
      "Shopping",
      "Transportation",
      "Others",
    ],
    datasets: [
      {
        label: "Category Expense",
        data: [10250, 3042, 11000, 1500, 5000],
        backgroundColor: [
          "#f1c40f",
          "#e74c3c",
          "#3498db",
          "#2ecc71",
          "#9b59b6",
        ],
      },
    ],
  },
});

const ctx2 = document
  .querySelector(".monthly-expense-graph .chart")
  .getContext("2d");
const monthlyChart = new Chart(ctx2, {
  type: "line",
  data: {
    labels: ["1", "2", "3", "4", "5", "6", "7"],
    datasets: [
      {
        label: "Monthly Expenses",
        data: [2000, 4000, 5000, 9000, 8000, 7000, 6000],
        fill: true,
        backgroundColor: "rgba(231, 76, 60, 0.2)",
        borderColor: "#e74c3c",
        tension: 0.3,
      },
    ],
  },
});
