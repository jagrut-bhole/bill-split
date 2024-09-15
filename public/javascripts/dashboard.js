// Delete Group Code
let groupIdToDelete = "";

function openDeleteModal(groupId) {
  groupIdToDelete = groupId;
  const deleteModal = new bootstrap.Modal(
    document.getElementById("deleteGroupModal")
  );
  deleteModal.show();
}

function deleteGroup() {
  fetch(`/group/delete/${groupIdToDelete}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Redirect or reload the page to reflect changes
        window.location.href = "/dashboard";
      } else {
        alert("Error deleting the group.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
