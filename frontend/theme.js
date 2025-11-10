// --- Elements ---
// We will query for elements inside the DOMContentLoaded event
// to ensure they exist when the script runs.

// --- State ---
// Check for saved theme in localStorage, default to 'light'
let currentTheme = localStorage.getItem("theme") || "light";

// --- Functions ---
function applyTheme(theme) {
    const themeIconLight = document.getElementById("theme-icon-light");
    const themeIconDark = document.getElementById("theme-icon-dark");

    if (theme === "dark") {
        // Add 'dark' class to <html>
        document.documentElement.classList.add("dark");
        // Show the 'sun' icon (for switching to light)
        if (themeIconDark) themeIconDark.classList.remove("hidden");
        if (themeIconLight) themeIconLight.classList.add("hidden");
    } else {
        // Remove 'dark' class from <html>
        document.documentElement.classList.remove("dark");
        // Show the 'moon' icon (for switching to dark)
        if (themeIconLight) themeIconLight.classList.remove("hidden");
        if (themeIconDark) themeIconDark.classList.add("hidden");
    }
}

function handleThemeToggle() {
    // Flip the theme
    currentTheme = (currentTheme === "light") ? "dark" : "light";
    // Save new theme to localStorage
    localStorage.setItem("theme", currentTheme);
    // Apply the new theme
    applyTheme(currentTheme);
}

// --- Event Listeners ---
// Apply the theme immediately when the page loads
document.addEventListener("DOMContentLoaded", () => {
    // Apply the initial theme
    applyTheme(currentTheme);
    
    // Find the toggle button *after* the DOM has loaded
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    
    // Attach click listener *only if* the toggle button exists on this page
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", handleThemeToggle);
    }
});
