// UNICBench Leaderboard JavaScript
// Inspired by VenusBench-GD design

document.addEventListener("DOMContentLoaded", function () {
    const tableElement = document.getElementById("leaderboardTable");
    const modalityTabs = document.getElementById("modalityTabs");

    let currentData = {};
    let sortDirection = true; // true: descending, false: ascending
    let currentSortKey = "success_rate";
    let currentModality = "text";

    // Load dataset for specific modality
    function loadDataset(modality) {
        currentModality = modality;
        const jsonPath = `data/leaderboard_data.json`;
        
        fetch(jsonPath)
            .then(response => response.json())
            .then(data => {
                currentData = data[modality] || [];
                sortAndRender(currentSortKey, sortDirection);
            })
            .catch(error => {
                console.error("Failed to fetch data:", error);
                tableElement.innerHTML = `<tr><td class='has-text-danger'>Error loading data. Please make sure data/leaderboard_data.json exists.</td></tr>`;
            });
    }

    // Initial load
    loadDataset(currentModality);

    // Tab switching
    if (modalityTabs) {
        const tabs = modalityTabs.querySelectorAll('li');
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('is-active'));
                // Add active class to clicked tab
                this.classList.add('is-active');
                // Load data for selected modality
                const modality = this.getAttribute('data-modality');
                loadDataset(modality);
            });
        });
    }

    function sortAndRender(key, direction) {
        currentSortKey = key;
        sortDirection = direction;

        const sortedData = [...currentData].sort((a, b) => {
            const aValue = getValue(a, key);
            const bValue = getValue(b, key);
            
            // Handle string comparison for model names
            if (key === "model_name") {
                return direction ? 
                    bValue.localeCompare(aValue) : 
                    aValue.localeCompare(bValue);
            }
            
            // Numeric comparison
            return direction ? bValue - aValue : aValue - bValue;
        });

        renderTable(sortedData);
    }

    function renderTable(data) {
        if (!data || data.length === 0) {
            tableElement.innerHTML = `
                <thead>
                    <tr>
                        <th>No data available</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="has-text-centered has-text-grey">
                            <p class="mt-4 mb-4">
                                <i class="fas fa-inbox fa-3x"></i><br><br>
                                No models have been evaluated yet for this modality.<br>
                                Please run the import script to load data.
                            </p>
                        </td>
                    </tr>
                </tbody>
            `;
            return;
        }

        // Build table header with grouped columns
        let tableHeader = `
            <thead>
                <tr class="header-row-1">
                    <th rowspan="3" class="sortable models-header" data-key="model_name">Model</th>
                    <th rowspan="3" class="sortable success-header" data-key="success_rate">Success (%)</th>
                    <th colspan="3" class="header-group-hit">Hit rate (%)</th>
                    <th colspan="2" class="header-group-overall">Overall</th>
                    <th colspan="2" class="header-group-easy">Easy</th>
                    <th colspan="2" class="header-group-medium">Medium</th>
                    <th colspan="2" class="header-group-hard">Hard</th>
                    <th colspan="2" class="header-group-pattern">Pattern</th>
                    <th colspan="2" class="header-group-reasoning">Reasoning</th>
                    <th colspan="2" class="header-group-semantic">Semantic</th>
                </tr>
                <tr class="header-row-2">
                    <th rowspan="2" class="sortable" data-key="hit_100">@100%↑</th>
                    <th rowspan="2" class="sortable" data-key="hit_90">@90%↑</th>
                    <th rowspan="2" class="sortable" data-key="hit_80">@80%↑</th>
                    <th colspan="2">MAE↓ / MSE↓</th>
                    <th colspan="2">MAE↓ / MSE↓</th>
                    <th colspan="2">MAE↓ / MSE↓</th>
                    <th colspan="2">MAE↓ / MSE↓</th>
                    <th colspan="2">MAE↓ / MSE↓</th>
                    <th colspan="2">MAE↓ / MSE↓</th>
                    <th colspan="2">MAE↓ / MSE↓</th>
                </tr>
                <tr class="header-row-3">
                    <th class="sortable" data-key="overall_mae">MAE</th>
                    <th class="sortable" data-key="overall_mse">MSE</th>
                    <th class="sortable" data-key="easy_mae">MAE</th>
                    <th class="sortable" data-key="easy_mse">MSE</th>
                    <th class="sortable" data-key="medium_mae">MAE</th>
                    <th class="sortable" data-key="medium_mse">MSE</th>
                    <th class="sortable" data-key="hard_mae">MAE</th>
                    <th class="sortable" data-key="hard_mse">MSE</th>
                    <th class="sortable" data-key="pattern_mae">MAE</th>
                    <th class="sortable" data-key="pattern_mse">MSE</th>
                    <th class="sortable" data-key="reasoning_mae">MAE</th>
                    <th class="sortable" data-key="reasoning_mse">MSE</th>
                    <th class="sortable" data-key="semantic_mae">MAE</th>
                    <th class="sortable" data-key="semantic_mse">MSE</th>
                </tr>
            </thead>
        `;

        // Build table body
        let tableBody = data.map((entry, index) => {
            const modelDisplay = entry.model_url && entry.model_url !== '#' 
                ? `<a href="${entry.model_url}" target="_blank" class="model-link">${entry.model_name}</a>` 
                : entry.model_name;

            return `
                <tr>
                    <td class="model-cell">
                        <strong>${modelDisplay}</strong>
                        ${entry.params ? `<span class="model-params">${entry.params}</span>` : ''}
                    </td>
                    <td class="metric-cell success-cell">${formatValue(entry.success_rate, 1)}</td>
                    <td class="metric-cell hit-cell">${formatValue(entry.hit_100, 1)}</td>
                    <td class="metric-cell hit-cell">${formatValue(entry.hit_90, 1)}</td>
                    <td class="metric-cell hit-cell">${formatValue(entry.hit_80, 1)}</td>
                    <td class="metric-cell overall-mae">${formatValue(entry.overall_mae, 1)}</td>
                    <td class="metric-cell overall-mse">${formatMSE(entry.overall_mse)}</td>
                    <td class="metric-cell easy-mae">${formatValue(entry.easy_mae, 1)}</td>
                    <td class="metric-cell easy-mse">${formatMSE(entry.easy_mse)}</td>
                    <td class="metric-cell medium-mae">${formatValue(entry.medium_mae, 1)}</td>
                    <td class="metric-cell medium-mse">${formatMSE(entry.medium_mse)}</td>
                    <td class="metric-cell hard-mae">${formatValue(entry.hard_mae, 1)}</td>
                    <td class="metric-cell hard-mse">${formatMSE(entry.hard_mse)}</td>
                    <td class="metric-cell pattern-mae">${formatValue(entry.pattern_mae, 1)}</td>
                    <td class="metric-cell pattern-mse">${formatMSE(entry.pattern_mse)}</td>
                    <td class="metric-cell reasoning-mae">${formatValue(entry.reasoning_mae, 1)}</td>
                    <td class="metric-cell reasoning-mse">${formatMSE(entry.reasoning_mse)}</td>
                    <td class="metric-cell semantic-mae">${formatValue(entry.semantic_mae, 1)}</td>
                    <td class="metric-cell semantic-mse">${formatMSE(entry.semantic_mse)}</td>
                </tr>
            `;
        }).join("");

        tableElement.innerHTML = tableHeader + `<tbody>${tableBody}</tbody>`;
        addSortingEventListeners();
    }

    function formatValue(value, decimals = 1) {
        if (value === null || value === undefined || value === '-') return '-';
        if (typeof value === 'number') {
            return value.toFixed(decimals);
        }
        return value;
    }

    function formatMSE(value) {
        if (value === null || value === undefined || value === '-') return '-';
        if (typeof value === 'string') return value;
        if (typeof value === 'number') {
            // Format as scientific notation with 1 decimal
            return value.toExponential(1);
        }
        return value;
    }

    function addSortingEventListeners() {
        document.querySelectorAll("th.sortable").forEach(header => {
            const key = header.getAttribute("data-key");
            
            // Remove all sorting indicators
            header.classList.remove("sorted-asc", "sorted-desc");
            
            // Add current sorting indicator
            if (key === currentSortKey) {
                header.classList.add(sortDirection ? "sorted-desc" : "sorted-asc");
            }

            header.style.cursor = "pointer";
            header.addEventListener("click", () => {
                const newDirection = key === currentSortKey ? !sortDirection : true;
                sortAndRender(key, newDirection);
            });
        });
    }

    function getValue(entry, key) {
        if (key === "model_name") return entry.model_name || "";
        if (key === "success_rate") return entry.success_rate || 0;
        if (key === "hit_100") return entry.hit_100 || 0;
        if (key === "hit_90") return entry.hit_90 || 0;
        if (key === "hit_80") return entry.hit_80 || 0;
        if (key === "overall_mae") return entry.overall_mae || 0;
        if (key === "overall_mse") return parseMSE(entry.overall_mse);
        if (key === "easy_mae") return entry.easy_mae || 0;
        if (key === "easy_mse") return parseMSE(entry.easy_mse);
        if (key === "medium_mae") return entry.medium_mae || 0;
        if (key === "medium_mse") return parseMSE(entry.medium_mse);
        if (key === "hard_mae") return entry.hard_mae || 0;
        if (key === "hard_mse") return parseMSE(entry.hard_mse);
        if (key === "pattern_mae") return entry.pattern_mae || 0;
        if (key === "pattern_mse") return parseMSE(entry.pattern_mse);
        if (key === "reasoning_mae") return entry.reasoning_mae || 0;
        if (key === "reasoning_mse") return parseMSE(entry.reasoning_mse);
        if (key === "semantic_mae") return entry.semantic_mae || 0;
        if (key === "semantic_mse") return parseMSE(entry.semantic_mse);
        return 0;
    }

    function parseMSE(mse) {
        if (!mse || mse === '-') return 0;
        if (typeof mse === 'number') return mse;
        if (typeof mse === 'string' && mse.includes('e')) {
            const parts = mse.split('e');
            return parseFloat(parts[0]) * Math.pow(10, parseInt(parts[1]));
        }
        return parseFloat(mse) || 0;
    }
});
