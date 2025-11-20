feather.replace();

// --- Chart Variables ---
let pieChart = null;
let lineChart = null;
let barChart = null; // Adding the bar chart variable

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderCharts();
    document.getElementById("applyStatsFilters").addEventListener("click", fetchAndRenderCharts);
    document.getElementById("filterToggle").addEventListener("click", () => {
        const panel = document.getElementById("filterPanel");
        panel.classList.toggle("hidden");
    });
});

// Fetches mood data and renders all charts
async function fetchAndRenderCharts() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const search = document.getElementById("searchInput")?.value || "";
    const from = document.getElementById("fromDate")?.value || "";
    const to = document.getElementById("toDate")?.value || "";
    const messageEl = document.getElementById("statsMessage");

    const url = new URL("http://localhost:5000/api/moods");
    url.searchParams.append("search", search);
    url.searchParams.append("from", from);
    url.searchParams.append("to", to);
    url.searchParams.append("limit", 1000); 

    try {
        const response = await fetch(url, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.status === 401) {
             alert("Session expired. Please log in again.");
             localStorage.removeItem('token');
             window.location.href = 'login.html';
            return;
        }

        const moods = await response.json();
        
        if (moods.length === 0) {
             messageEl.textContent = "No mood data found for these filters.";
             if (pieChart) { pieChart.destroy(); pieChart = null; }
             if (lineChart) { lineChart.destroy(); lineChart = null; }
             if (barChart) { barChart.destroy(); barChart = null; } // Clear bar chart
             document.getElementById("mostCommonMood").textContent = "N/A";
             document.getElementById("bestDay").textContent = "N/A";
             return;
        }
        
        messageEl.textContent = "";

        // Process data
        const { moodCounts, averageScores, weekdays, totalMoods, monthlyData } = processMoodData(moods);

        // Render Charts
        renderPieChart(Object.keys(moodCounts), Object.values(moodCounts));
        renderWeeklyLineChart(averageScores, weekdays);
        renderMonthlyBarChart(monthlyData); // <-- NEWLY ADDED

        // Update Highlight Cards
        updateHighlights(moodCounts, totalMoods, averageScores, weekdays);

    } catch (error) {
        console.error("Failed to fetch mood data:", error);
    }
}

// Processes raw mood data into formats suitable for charts
function processMoodData(moods) {
    const moodCounts = {};
    const dailyScores = new Array(7).fill(0);
    const dailyCounts = new Array(7).fill(0);
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthlyData = {
        labels: [], // e.g., ["Oct", "Nov"]
        datasets: [
            { label: '☀️ Happy', data: [], backgroundColor: '#FFD166' },
            { label: '🌧️ Sad', data: [], backgroundColor: '#6BD6FF' },
            { label: '⚡ Angry', data: [], backgroundColor: '#FF6B6B' },
            { label: '🌤️ Calm', data: [], backgroundColor: '#A5D8FF' },
            { label: '🌈 Excited', data: [], backgroundColor: '#D4BBFC' },
            { label: '🌫️ Confused', data: [], backgroundColor: '#C4C4C4' },
            { label: '🌙 Tired', data: [], backgroundColor: '#95A5A6' }
        ]
    };
    const monthlyMap = new Map(); // e.g., "Oct 2025" -> { "☀️ Happy": 1, "🌧️ Sad": 2 }
    
    const moodScoreMap = {
        "☀️ Happy": 10, "🌈 Excited": 9, "🌤️ Calm": 7,
        "🌫️ Confused": 5, "🌙 Tired": 4, "🌧️ Sad": 2, "⚡ Angry": 1
    };
    
    let totalMoods = moods.length;

    moods.forEach(entry => {
        const entryDate = new Date(entry.date);
        
        // For Pie Chart
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;

        // For Line Chart
        const dayOfWeek = entryDate.getDay();
        const score = moodScoreMap[entry.mood];
        if (score) {
            dailyScores[dayOfWeek] += score;
            dailyCounts[dayOfWeek] += 1;
        }

        // --- For Monthly Bar Chart ---
        const monthYear = entryDate.toLocaleString('default', { month: 'short', year: 'numeric' }); // e.g., "Nov 2025"
        if (!monthlyMap.has(monthYear)) {
            monthlyMap.set(monthYear, {});
        }
        const monthStats = monthlyMap.get(monthYear);
        monthStats[entry.mood] = (monthStats[entry.mood] || 0) + 1;
    });

    const averageScores = dailyScores.map((score, index) =>
        dailyCounts[index] > 0 ? (score / dailyCounts[index]).toFixed(1) : 0
    );
    
    // Convert monthlyMap to chart.js format
    const sortedMonths = Array.from(monthlyMap.keys()).sort((a, b) => new Date(a) - new Date(b));
    monthlyData.labels = sortedMonths;

    monthlyData.datasets.forEach(dataset => {
        dataset.data = sortedMonths.map(month => {
            return monthlyMap.get(month)[dataset.label] || 0;
        });
    });
    
    return { moodCounts, averageScores, weekdays, totalMoods, monthlyData };
}

// Gets the correct text/grid colors for dark mode
function getChartColors() {
    const theme = localStorage.getItem("theme") || "light";
    if (theme === "dark") {
        return {
            textColor: 'rgba(255, 255, 255, 0.7)',
            gridColor: 'rgba(255, 255, 255, 0.1)'
        };
    }
    return { // Light mode
        textColor: 'rgba(107, 114, 128, 1)',
        gridColor: 'rgba(0, 0, 0, 0.1)'
    };
}

// Renders the Pie Chart
function renderPieChart(labels, data) {
    const colors = getChartColors();
    if (pieChart) pieChart.destroy(); 
    
    const pieCtx = document.getElementById('moodPieChart').getContext('2d');
    pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#FFD166', '#6BD6FF', '#FF6B6B', '#A5D8FF', '#D4BBFC', '#C4C4C4', '#95A5A6'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    position: 'right',
                    labels: { color: colors.textColor }
                } 
            }
        }
    });
}

// Renders the Weekly Line Chart
function renderWeeklyLineChart(averageScores, weekdays) {
    const colors = getChartColors();
    if (lineChart) lineChart.destroy(); 

    const lineCtx = document.getElementById('weeklyLineChart').getContext('2d');
    lineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: weekdays,
            datasets: [{
                label: 'Average Mood Score',
                data: averageScores,
                borderColor: '#D4BBFC',
                backgroundColor: 'rgba(212, 187, 252, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: colors.textColor } }
            },
            scales: { 
                y: { 
                    beginAtZero: true, 
                    max: 10,
                    ticks: { color: colors.textColor },
                    grid: { color: colors.gridColor }
                },
                x: {
                    ticks: { color: colors.textColor },
                    grid: { color: colors.gridColor }
                }
            }
        }
    });
}

// Renders the Monthly Bar Chart
function renderMonthlyBarChart(monthlyData) {
    const colors = getChartColors();
    if (barChart) barChart.destroy();

    const barCtx = document.getElementById('monthlyBarChart').getContext('2d');
    barChart = new Chart(barCtx, {
        type: 'bar',
        data: monthlyData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: colors.textColor } }
            },
            scales: {
                y: {
                    stacked: true, // Stack moods on top of each other
                    ticks: { color: colors.textColor },
                    grid: { color: colors.gridColor }
                },
                x: {
                    stacked: true,
                    ticks: { color: colors.textColor },
                    grid: { color: colors.gridColor }
                }
            }
        }
    });
}


// Updates the "Highlights" cards with dynamic data
function updateHighlights(moodCounts, totalMoods, averageScores, weekdays) {
    // Find most common mood
    let mostCommonMood = 'N/A';
    let maxCount = 0;
    for (const mood in moodCounts) {
        if (moodCounts[mood] > maxCount) {
            maxCount = moodCounts[mood];
            mostCommonMood = mood;
        }
    }
    const percentage = totalMoods > 0 ? ((maxCount / totalMoods) * 100).toFixed(0) : 0;
    document.getElementById("mostCommonMood").textContent = `${mostCommonMood} (${percentage}%)`;

    // Find best day
    const bestDayIndex = averageScores.indexOf(Math.max(...averageScores));
    const bestDay = weekdays[bestDayIndex];
    document.getElementById("bestDay").textContent = bestDay;
}

// Logout Function
function logout(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    if (typeof showToast === 'function') { // Check if showToast exists
        showToast("You have been logged out successfully.", "success");
    } else {
        alert("You have been logged out successfully.");
    }
    setTimeout(() => {
        window.location.href = 'about.html'; 
    }, 1500);
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) { // If toast container isn't on this page, just alert
        alert(message);
        return; 
    }
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
