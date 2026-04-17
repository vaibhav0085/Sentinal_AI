const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const browseBtn = document.getElementById('browse-btn');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const progressPercent = document.getElementById('progress-percent');
const statusText = document.getElementById('scanning-status');
const resultsCard = document.getElementById('results-card');
const resetBtn = document.getElementById('reset-btn');

// UI Elements for Resuls
const statusBadge = document.getElementById('status-badge');
const threatScoreDisplay = document.getElementById('threat-score');
const needle = document.getElementById('needle');
const detailIcon = document.querySelector('.detail-item i');
const detailTitle = document.querySelector('.detail-item h4');
const detailText = document.querySelector('.detail-item p');

// State
let lastScanResult = null;
let currentFileName = '';

// Modal Elements
const detailsModal = document.getElementById('details-modal');
const closeModalBtn = document.querySelector('.close-modal');
const detailsBtn = document.getElementById('details-btn');
const modalBody = document.getElementById('modal-body');

// Drag & Drop Events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    dropZone.classList.add('dragover');
}

function unhighlight() {
    dropZone.classList.remove('dragover');
}

dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// File Input Events
browseBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', function () {
    handleFiles(this.files);
});

function handleFiles(files) {
    if (files.length > 0) {
        uploadFile(files[0]);
    }
}

function uploadFile(file) {
    currentFileName = file.name;

    // Reset UI
    resultsCard.classList.add('hidden');
    progressContainer.classList.remove('hidden');
    progressFill.style.width = '0%';
    progressPercent.innerText = '0%';
    statusText.innerText = `Scanning ${file.name}...`;

    // Simulate Scanning Process
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 5 + 1;
        if (progress > 90) progress = 90; // Hold at 90 until done

        progressFill.style.width = `${progress}%`;
        progressPercent.innerText = `${Math.floor(progress)}%`;
    }, 100);

    const formData = new FormData();
    formData.append('file', file);

    fetch('/scan', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || `Server error: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            clearInterval(interval);
            progressFill.style.width = '100%';
            progressPercent.innerText = '100%';

            setTimeout(() => {
                showResults(data);
            }, 500);
        })
        .catch(error => {
            clearInterval(interval);
            console.error('Error:', error);

            // Show error in the results card instead of getting stuck
            progressContainer.classList.add('hidden');
            resultsCard.classList.remove('hidden');

            // Set error state in UI
            resultsCard.classList.add('danger');
            statusBadge.innerText = 'Error';
            statusBadge.style.color = 'var(--status-danger)';
            statusBadge.style.backgroundColor = 'rgba(255, 71, 87, 0.1)';
            statusBadge.style.borderColor = 'var(--status-danger)';

            threatScoreDisplay.innerText = '?';
            needle.style.transform = 'rotate(-90deg)'; // Reset needle

            detailIcon.className = 'fa-solid fa-circle-exclamation';
            detailTitle.innerText = 'Scan Failed';
            detailText.innerText = error.message || 'An unexpected error occurred during the scan.';

            // Ensure "Analyze Another File" button works so user isn't stuck
            lastScanResult = { error: true, message: error.message };
        });
}

function showResults(data) {
    progressContainer.classList.add('hidden');
    resultsCard.classList.remove('hidden');

    if (data.error) {
        console.error(data.error);

        // Use the same error UI logic as the catch block
        resultsCard.classList.add('danger');
        statusBadge.innerText = 'Error';
        statusBadge.style.color = 'var(--status-danger)';
        statusBadge.style.backgroundColor = 'rgba(255, 71, 87, 0.1)';
        statusBadge.style.borderColor = 'var(--status-danger)';

        threatScoreDisplay.innerText = '?';
        needle.style.transform = 'rotate(-90deg)';

        detailIcon.className = 'fa-solid fa-circle-exclamation';
        detailTitle.innerText = 'Scan Failed';
        detailText.innerText = data.error;

        // Ensure reset works
        lastScanResult = { error: true, message: data.error };
        return;
    }

    // Save to State
    lastScanResult = data;
    const scanRecord = {
        filename: currentFileName,
        threat_score: data.threat_score,
        is_malware: data.is_malware,
        detected_imports: data.detected_imports
    };

    // Save immediately to specific history
    SentinelState.saveScan(scanRecord);

    updateResultUI(data.is_malware, data.threat_score, data.detected_imports);
}

function updateResultUI(isThreat, score, detectedImports) {
    // Animate Needle
    // -90deg is 0, 90deg is 100
    const degrees = (score / 100) * 180 - 90;
    setTimeout(() => {
        needle.style.transform = `rotate(${degrees}deg)`;
    }, 100);

    // Animate Score Counter
    let currentScore = 0;
    const scoreInterval = setInterval(() => {
        if (currentScore < score) {
            currentScore++;
            threatScoreDisplay.innerText = currentScore;
        } else {
            clearInterval(scoreInterval);
        }
    }, 20);

    if (isThreat) {
        resultsCard.classList.add('danger');
        statusBadge.innerText = 'Critical';
        statusBadge.style.color = 'var(--status-danger)';
        statusBadge.style.backgroundColor = 'rgba(255, 71, 87, 0.1)';
        statusBadge.style.borderColor = 'var(--status-danger)';

        detailIcon.className = 'fa-solid fa-triangle-exclamation';
        detailTitle.innerText = 'Malicious Signature Found';
        detailText.innerText = 'Heuristic analysis detected potential ransomware behavior.';
    } else {
        resultsCard.classList.remove('danger');
        statusBadge.innerText = 'Safe';
        statusBadge.style.color = 'var(--status-safe)';
        statusBadge.style.backgroundColor = 'rgba(0, 255, 157, 0.1)';
        statusBadge.style.borderColor = 'var(--status-safe)';

        detailIcon.className = 'fa-solid fa-file-shield';
        detailTitle.innerText = 'No Threats Detected';
        detailText.innerText = 'File is clean and safe to use.';
    }
}

// Modal Logic
if (detailsBtn) {
    detailsBtn.addEventListener('click', () => {
        if (!lastScanResult) return;

        let importsHtml = '';
        if (lastScanResult.detected_imports && lastScanResult.detected_imports.length > 0) {
            importsHtml = '<ul>' + lastScanResult.detected_imports.map(imp => `<li>${imp}</li>`).join('') + '</ul>';
        } else {
            importsHtml = '<p>No suspicious imports detected.</p>';
        }

        modalBody.innerHTML = `
            <h4>File: ${currentFileName}</h4>
            <p><strong>Threat Score:</strong> ${lastScanResult.threat_score}/100</p>
            <p><strong>Status:</strong> ${lastScanResult.is_malware ? 'Critical' : 'Safe'}</p>
            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 1rem 0;">
            <h5>Suspicious Imports Detected:</h5>
            ${importsHtml}
        `;
        detailsModal.classList.add('show');
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        detailsModal.classList.remove('show');
    });
}

window.addEventListener('click', (e) => {
    if (e.target == detailsModal) {
        detailsModal.classList.remove('show');
    }
});

resetBtn.addEventListener('click', () => {
    resultsCard.classList.add('hidden');
    // Dropzone logic resets automatically by visibility
    needle.style.transform = 'rotate(-90deg)';
    threatScoreDisplay.innerText = '0';
    lastScanResult = null;
    currentFileName = '';
});
