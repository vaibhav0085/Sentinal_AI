/**
 * Sentinel AI - Quarantine Logic
 */

const container = document.getElementById('quarantine-container');

function renderQuarantine() {
    const history = SentinelState.getHistory();
    // Filter for Critical items (is_malware = true)
    const threats = history.filter(item => item.is_malware === true);

    container.innerHTML = '';

    if (threats.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #00ff9d;">No active threats in quarantine. System is secure.</p>';
        return;
    }

    threats.forEach(item => {
        const card = document.createElement('div');
        card.className = 'quarantine-card';

        const date = new Date(item.timestamp).toLocaleDateString();

        card.innerHTML = `
            <div class="q-header">
                <span class="q-title"><i class="fa-solid fa-bug"></i> ${item.filename}</span>
                <span class="q-score">Score: ${item.threat_score}</span>
            </div>
            <div class="q-meta">
                Detected: ${date}<br>
                Imports Flagged: ${item.detected_imports ? item.detected_imports.length : 0}
            </div>
            <div class="q-actions">
                <button class="btn-delete" onclick="deleteItem('${item.id}')">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
                <button class="btn-false-pos" onclick="markFalsePositive('${item.id}')">
                    <i class="fa-solid fa-check"></i> False Positive
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function deleteItem(id) {
    if (confirm('Permanently delete this record?')) {
        SentinelState.deleteItem(id);
        renderQuarantine();
    }
}

function markFalsePositive(id) {
    if (confirm('Mark this file as Safe? It will be moved to History as a safe file.')) {
        SentinelState.updateStatus(id, 'Safe');
        renderQuarantine();
    }
}

// Global scope
window.deleteItem = deleteItem;
window.markFalsePositive = markFalsePositive;

renderQuarantine();
