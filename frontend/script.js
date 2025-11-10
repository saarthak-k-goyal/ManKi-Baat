feather.replace();

// --- Global variables ---
let currentPage = 1;
let searchTimer = null;
let deleteTargetId = null; // ID for the delete modal

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {

  // Initial call to get moods
  getMoods();

  // Add event listener to the Save Mood button
  document.querySelector(".submit-pulse").addEventListener("click", addMood);

  // Add all filter event listeners
  document.getElementById("searchInput").addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      currentPage = 1; // Reset to page 1 on new search
      getMoods(this.value);
    }, 300);
  });

  document.getElementById("sortSelect").addEventListener("change", () => {
    currentPage = 1; // Reset to page 1 on sort change
    getMoods(document.getElementById("searchInput").value);
  });

  document.getElementById("limitSelect").addEventListener("change", () => {
    currentPage = 1; // Reset to page 1 on limit change
    getMoods(document.getElementById("searchInput").value);
  });

  document.getElementById("fromDate").addEventListener("change", () => {
    currentPage = 1; // Reset to page 1 on date change
    getMoods(document.getElementById("searchInput").value);
  });

  document.getElementById("toDate").addEventListener("change", () => {
    currentPage = 1; // Reset to page 1 on date change
    getMoods(document.getElementById("searchInput").value);
  });

  document.getElementById("filterToggle").addEventListener("click", () => {
    const panel = document.getElementById("filterPanel");
    panel.classList.toggle("hidden");
  });

  document.getElementById("clearFilters").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    document.getElementById("sortSelect").value = "date_desc";
    document.getElementById("limitSelect").value = "5";
    document.getElementById("fromDate").value = "";
    document.getElementById("toDate").value = "";
    currentPage = 1;
    getMoods(); // Get all moods
    document.getElementById("filterPanel").classList.add("hidden");
  });

});

// --- Toast Notification ---
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');

  const isError = type === 'error';
  const bgColor = isError ? 'bg-red-500' : 'bg-green-500';
  const icon = isError
    ? '<i data-feather="x-circle" class="w-5 h-5"></i>'
    : '<i data-feather="check-circle" class="w-5 h-5"></i>';

  toast.className = `toast-slide-in p-4 rounded-lg shadow-lg text-white flex items-center space-x-3 ${bgColor}`;
  toast.innerHTML = `
        <span class="flex-shrink-0">${icon}</span>
        <span class="flex-grow text-sm">${message}</span>
    `;

  container.appendChild(toast);
  feather.replace();

  const fadeOutTimer = setTimeout(() => {
    toast.classList.remove('toast-slide-in');
    toast.classList.add('toast-slide-out');
  }, 2700);

  const removeTimer = setTimeout(() => {
    toast.remove();
    clearTimeout(fadeOutTimer);
  }, 3000);
}

// --- CRUD Functions ---

// Function to add a new mood
async function addMood() {
  const moodSelect = document.getElementById("mood");
  const noteTextarea = document.getElementById("note");

  const mood = moodSelect.value;
  const note = noteTextarea.value;
  const token = localStorage.getItem('token');

  if (mood === "Select a mood" || !note) {
    showToast("Please select a mood and add a note.", "error");
    return;
  }
  if (!token) {
    showToast("You must be logged in to save a mood.", "error");
    window.location.href = 'login.html';
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/moods", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ mood, note }),
    });

    if (response.ok) {
      showToast("Mood saved successfully!", "success");
      noteTextarea.value = "";
      moodSelect.value = "Select a mood";
      getMoods(document.getElementById("searchInput").value); // Refresh with current search
    } else {
      if (response.status === 401) {
        showToast("Session expired. Please log in again.", "error");
        localStorage.removeItem('token');
        window.location.href = 'login.html';
      } else {
        const errorData = await response.json();
        showToast(errorData.error || "Error saving mood.", "error");
      }
    }
  } catch (error) {
    console.error("Failed to add mood:", error);
    showToast("Failed to connect to the server.", "error");
  }
}

// Function to fetch and display all moods
async function getMoods(search = "") {
  const moodHistoryDiv = document.querySelector(".mood-history");
  moodHistoryDiv.innerHTML = "";
  const token = localStorage.getItem('token');
  if (!token) return;

  const sort = document.getElementById("sortSelect")?.value || "date_desc";
  const limit = document.getElementById("limitSelect")?.value || 5;
  const from = document.getElementById("fromDate")?.value || "";
  const to = document.getElementById("toDate")?.value || "";

  const url = new URL("http://localhost:5000/api/moods");
  url.searchParams.append("search", search);
  url.searchParams.append("page", currentPage);
  url.searchParams.append("limit", limit);
  url.searchParams.append("sort", sort);

  if (from) url.searchParams.append("from", from);
  if (to) url.searchParams.append("to", to);

  try {
    const response = await fetch(url, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (response.status === 401) {
      showToast("Session expired. Please log in again.", "error");
      localStorage.removeItem('token');
      window.location.href = 'login.html';
      return;
    }

    const moods = await response.json();

    if (moods.length === 0) {
      const searchVal = document.getElementById("searchInput").value;
      const fromVal = document.getElementById("fromDate").value;
      const toVal = document.getElementById("toDate").value;

      if (searchVal || fromVal || toVal) {
        moodHistoryDiv.innerHTML = `
          <div class="text-center py-10 text-gray-500 dark:text-gray-400">
            <i data-feather="wind" class="mx-auto w-10 h-10 mb-3"></i>
            <p>No moods found matching your filters.</p>
          </div>
        `;
      } else {
        moodHistoryDiv.innerHTML = `
          <div class="text-center py-10 text-gray-500 dark:text-gray-400">
            <i data-feather="cloud-plus" class="mx-auto w-10 h-10 mb-3"></i>
            <p>No moods recorded yet. Add one above!</p>
          </div>
        `;
      }
      feather.replace();

      document.getElementById("pageNumber").innerText = "Page 1";
      document.getElementById("resultCount").innerText = "Showing 0 results";
      document.getElementById("prevButton").disabled = true;
      document.getElementById("nextButton").disabled = true;
      return;
    }

    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };

    moods.forEach(mood => {
      const date = new Date(mood.date).toLocaleDateString('en-GB', options);
      let editedLabel = "";
      if (mood.lastEdited) {
        const editedDate = new Date(mood.lastEdited);
        const today = new Date();
        const isToday = editedDate.getDate() === today.getDate() &&
          editedDate.getMonth() === today.getMonth() &&
          editedDate.getFullYear() === today.getFullYear();
        const timeStr = editedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const dateStr = editedDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
        editedLabel = isToday
          ? `<span class="ml-2 text-xs text-gray-400 dark:text-gray-500">(edited ${timeStr})</span>`
          : `<span class="ml-2 text-xs text-gray-400 dark:text-gray-500">(edited ${dateStr}, ${timeStr})</span>`;
      }

      const moodEntryHTML = `
        <div class="bg-white bg-opacity-70 rounded-xl p-5 shadow-sm hover:shadow-md transition-all dark:bg-gray-800 dark:bg-opacity-80">
            <div class="flex justify-between items-start">
                <div class="flex-1 min-w-0"> 
                    <span class="text-2xl">${mood.mood}</span>
                    <span class="ml-3 text-gray-500 dark:text-gray-400">${date}</span> 
                    ${editedLabel}
                </div>
                <div class="flex space-x-2 flex-shrink-0 ml-2"> 
                    <i data-feather="edit-2" class="w-4 h-4 text-gray-400 hover:text-lilac cursor-pointer" onclick="editMood('${mood._id}')"></i>
                    <i data-feather="trash-2" class="w-4 h-4 text-gray-400 hover:text-red-300 cursor-pointer" onclick="deleteMood('${mood._id}')"></i>
                </div>
            </div>
            <p class="mt-2 text-gray-600 dark:text-gray-300 break-words">${mood.note}</p> 
        </div>
      `;
      moodHistoryDiv.innerHTML += moodEntryHTML;
    });
    feather.replace();

    document.getElementById("pageNumber").innerText = `Page: ${currentPage}`;
    document.getElementById("resultCount").innerText = `Showing ${moods.length} results`;
    document.getElementById("prevButton").disabled = (currentPage === 1);
    document.getElementById("nextButton").disabled = (moods.length < limit);

  } catch (error) {
    console.error("Failed to fetch moods:", error);
    moodHistoryDiv.innerHTML = '<p class="text-red-400 text-center">Could not load moods. Is the backend server running?</p>';
  }
}

function nextPage() {
  currentPage++;
  getMoods(document.getElementById("searchInput").value);
}

function prevPage() {
  if (currentPage > 1) currentPage--;
  getMoods(document.getElementById("searchInput").value);
}

// --- DELETE MODAL LOGIC ---

// function opens the modal
function deleteMood(id) {
  deleteTargetId = id; // Store the ID
  const modal = document.getElementById("deleteModal");
  modal.classList.remove("hidden");
  // Render the feather icon inside the modal
  feather.replace();
}

// closes the modal
function closeDeleteModal() {
  deleteTargetId = null;
  const modal = document.getElementById("deleteModal");
  modal.classList.add("hidden");
}

// deleteMood function
async function confirmDelete() {
  if (!deleteTargetId) return; // Failsafe

  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`http://localhost:5000/api/moods/${deleteTargetId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (response.ok) {
      showToast("Mood deleted successfully!", "success");
      // Check if we need to reset the page
      const moodList = document.querySelector(".mood-history").children;
      if (moodList.length === 1 && currentPage > 1) {
        currentPage--;
      }
      getMoods(document.getElementById("searchInput").value); // Refresh list
    } else {
      showToast("Error deleting mood.", "error");
    }
  } catch (error) {
    console.error("Failed to delete mood:", error);
    showToast("Failed to connect to the server.", "error");
  }

  closeDeleteModal(); // Close modal regardless of outcome
}

// --- EDIT MODAL LOGIC ---

let currentEditId = null;

function openEditModal(moodData) {
  document.getElementById("editModal").classList.remove("hidden");
  document.getElementById("editMood").value = moodData.mood;
  document.getElementById("editNote").value = moodData.note;
  currentEditId = moodData._id;
}

function closeModal() {
  document.getElementById("editModal").classList.add("hidden");
}

async function saveEdit() {
  const mood = document.getElementById("editMood").value;
  const note = document.getElementById("editNote").value;
  const token = localStorage.getItem('token');

  if (!token) {
    showToast("Authentication required. Please log in.", "error");
    closeModal();
    window.location.href = 'login.html';
    return;
  }

  try {
    const updateResponse = await fetch(`http://localhost:5000/api/moods/${currentEditId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ mood, note }),
    });

    closeModal();

    if (updateResponse.ok) {
      showToast("Mood updated successfully!", "success");
      getMoods(document.getElementById("searchInput").value); // Refresh with current search
    } else if (updateResponse.status === 401) {
      showToast("Session expired. Please log in again.", "error");
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    } else {
      const errorData = await updateResponse.json();
      showToast(`Error saving edit: ${errorData.error || updateResponse.statusText}`, "error");
    }
  } catch (error) {
    closeModal();
    console.error("Failed to save edit:", error);
    showToast("Failed to connect to the server. Please ensure the backend is running.", "error");
  }
}

async function editMood(id) {
  const token = localStorage.getItem('token');
  if (!token) {
    showToast("You must be logged in to edit a mood.", "error");
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/api/moods/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      openEditModal(data);
    } else if (res.status === 401) {
      showToast("Session expired. Please log in again.", "error");
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    } else {
      showToast("Failed to fetch mood data.", "error");
    }
  } catch (error) {
    console.error("Failed to fetch mood data:", error);
  }
}

function logout(e) {
  e.preventDefault();
  localStorage.removeItem('token');
  if (typeof showToast === 'function') {
    showToast("You have been logged out successfully.", "success");
  } else {
    alert("You have been logged out successfully.");
  }
  setTimeout(() => {
    window.location.href = 'about.html';
  }, 1500);
}