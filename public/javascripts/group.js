function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll(".content").forEach((content) => {
    content.style.display = "none";
  });

  // Show the selected section
  document.getElementById(sectionId).style.display = "block";

  // Save the selected section in localStorage
  localStorage.setItem("lastSection", sectionId);

  // Remove the active class from all sections
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.remove("active");
  });

  // Add the active class to the clicked section
  const activeSection = document.querySelector(`.section[data-section="${sectionId}"]`);
  if (activeSection) {
    activeSection.classList.add("active");
  }

  // Save the active section in localStorage
  localStorage.setItem("activeSection", sectionId);
}

// On page load, check for the last selected section and show it
window.onload = function () {
  const lastSection = localStorage.getItem("lastSection");

  if (lastSection) {
    showSection(lastSection); // Show the last section if available
  } else {
    showSection("group-expense-content"); // Default section to show
  }
};




// Get modal element
var modal = document.getElementById("inviteModal");
var btn = document.querySelector(".invite-member");
var span = document.getElementsByClassName("close")[0];

// Open modal when button is clicked
btn.onclick = function () {
  modal.style.display = "block";
};

// Close modal when the close button is clicked
span.onclick = function () {
  modal.style.display = "none";
};

// Close modal when clicking outside of it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};




// Expense _ Modal Form

var expensemodal = document.getElementById("expenseModal");

// Get the button that opens the modal
var but = document.getElementById("openAddExpenseModal");

// Get the <span> element that closes the modal
var cancelBtn = document.getElementById("cancelBtn");

// When the user clicks on the button, open the modal
but.onclick = function () {
  expensemodal.style.display = "block";
};

// When the user clicks on cancel button, close the modal
cancelBtn.onclick = function () {
  expensemodal.style.display = "none";
};



// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == expensemodal) {
    expensemodal.style.display = "none";
  }
};

document.querySelector('.cancel').onclick = function() {
  expensemodal.style.display = "none";
}




// Current date setting

function setCurrentDate() {
  const dateInput = document.getElementById("expense-date");

  // Get today's date
  const today = new Date();

  // Format the date to YYYY-MM-DD, which is the required format for the date input field
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so +1
  const day = String(today.getDate()).padStart(2, "0");

  // Set the value of the date input to today's date
  dateInput.value = `${year}-${month}-${day}`;
}

// Call the function when the page loads
window.onload = setCurrentDate;

