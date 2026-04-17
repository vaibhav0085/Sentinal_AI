/**
 * Sentinel AI - Settings Logic
 */

// Toggles
const toggles = {
    heuristicScan: document.getElementById('heuristicScan'),
    autoQuarantine: document.getElementById('autoQuarantine'),
    notifications: document.getElementById('notifications')
};

// Model Info Elements
const modelVersionEl = document.getElementById('model-version');
const modelAccuracyEl = document.getElementById('model-accuracy');

function loadSettings() {
    const settings = SentinelState.getSettings();

    // Apply state to inputs
    for (const [key, element] of Object.entries(toggles)) {
        if (element) {
            element.checked = settings[key];
            // Add listener
            element.addEventListener('change', () => {
                settings[key] = element.checked;
                SentinelState.saveSettings(settings);
            });
        }
    }
}

function fetchModelInfo() {
    fetch('/info')
        .then(response => response.json())
        .then(data => {
            modelVersionEl.innerText = data.version;
            modelAccuracyEl.innerText = data.accuracy;
        })
        .catch(err => {
            console.error('Failed to fetch model info', err);
            modelVersionEl.innerText = 'Unknown';
            modelAccuracyEl.innerText = 'N/A';
        });
}

function checkForUpdates() {
    const btn = document.querySelector('.action-button');
    const originalText = btn.innerText;
    btn.innerText = 'Checking...';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerText = 'Model is up to date';
        setTimeout(() => {
            btn.innerText = originalText;
            btn.disabled = false;
        }, 2000);
    }, 1500);
}

window.checkForUpdates = checkForUpdates;

// Init
loadSettings();
fetchModelInfo();
