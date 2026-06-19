// Strict Global Engine Configuration Data Matrix
const ROUTINE_SCHEMATICS = {
    1: { label: "Day 1 — Back + Biceps", focus: "Deadlift nucleus · Width focus", rest: false },
    2: { label: "Day 2 — Chest + Triceps", focus: "Bench nucleus · Arm finisher", rest: false },
    3: { label: "Day 3 — Legs", focus: "Squat nucleus · Full legs", rest: false },
    4: { label: "Day 4 — Rest + Walk", focus: "8,000 steps · Recover", rest: true },
    5: { label: "Day 5 — Shoulders + Back", focus: "OHP nucleus · Delt focus", rest: false },
    6: { label: "Day 6 — Arms + Chest", focus: "EZ curl nucleus · Lateral raises", rest: false },
    7: { label: "Day 7 — Rest / LISS", focus: "30 min incline walk optional", rest: true }
};

let activeDisplayCalendarDate = new Date();

window.addEventListener('DOMContentLoaded', () => {
    initializeDataInfrastructure();
    renderUserInterfaceState();
});

function initializeDataInfrastructure() {
    // If tracking parameter data timeline missing, configure defaults instantly
    if (!localStorage.getItem('fitnessTracker_startDate')) {
        const targetTomorrow = new Date();
        targetTomorrow.setDate(targetTomorrow.getDate() + 1);
        localStorage.setItem('fitnessTracker_startDate', normalizeDateString(targetTomorrow));
    }

    // Sync input control display values
    document.getElementById('start-date-picker').value = localStorage.getItem('fitnessTracker_startDate');

    // Safe bootstrap fallback array profiles instantiation
    if (!localStorage.getItem('fitnessTracker_data')) localStorage.setItem('fitnessTracker_data', JSON.stringify({}));
    if (!localStorage.getItem('fitnessTracker_weights')) localStorage.setItem('fitnessTracker_weights', JSON.stringify([]));
}

function normalizeDateString(dateObj) {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function calculateCycleDayPointer(dateString) {
    const originStartStr = localStorage.getItem('fitnessTracker_startDate');
    if (!originStartStr) return null;

    const origin = new Date(originStartStr + 'T00:00:00');
    const current = new Date(dateString + 'T00:00:00');

    const durationDelta = current.getTime() - origin.getTime();
    if (durationDelta < 0) return null; // Date falls prior to program matrix initialization

    const totalDaysElapsed = Math.floor(durationDelta / (1000 * 60 * 60 * 24));
    return (totalDaysElapsed % 7) + 1;
}

function switchTab(targetTabId) {
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));

    document.getElementById(`tab-${targetTabId}`).classList.add('active');
    
    // Manage dynamic tab selection button references highlighting accurately
    const mapping = ['today', 'calendar', 'weight', 'report'];
    const elementIdx = mapping.indexOf(targetTabId);
    if (elementIdx !== -1) {
        document.querySelectorAll('.nav-item')[elementIdx].classList.add('active');
    }

    renderUserInterfaceState();
}

function renderUserInterfaceState() {
    const todayObj = new Date();
    const todayString = normalizeDateString(todayObj);

    // Sync top-tier primary system date banner presentation header
    document.getElementById('today-date-banner').innerText = todayObj.toLocaleDateString(undefined, {
        weekday: 'short', month: 'short', day: 'numeric'
    });

    const storedLogs = JSON.parse(localStorage.getItem('fitnessTracker_data') || '{}');
    const computedCycleIndex = calculateCycleDayPointer(todayString);
    const gymCheckboxNode = document.getElementById('habit-gym');

    if (computedCycleIndex && ROUTINE_SCHEMATICS[computedCycleIndex]) {
        document.getElementById('today-cycle-label').innerText = ROUTINE_SCHEMATICS[computedCycleIndex].label;
        document.getElementById('today-cycle-focus').innerText = ROUTINE_SCHEMATICS[computedCycleIndex].focus;

        if (ROUTINE_SCHEMATICS[computedCycleIndex].rest) {
            gymCheckboxNode.checked = true;
            gymCheckboxNode.disabled = true;
        } else {
            gymCheckboxNode.disabled = false;
            gymCheckboxNode.checked = storedLogs[todayString]?.gym || false;
        }
    } else {
        document.getElementById('today-cycle-label').innerText = "Program Matrix Offline";
        document.getElementById('today-cycle-focus').innerText = "Routine pending schedule launch parameters below.";
        gymCheckboxNode.checked = false;
        gymCheckboxNode.disabled = false;
    }

    // Sync remaining switches tracking properties safely
    document.getElementById('habit-steps').checked = storedLogs[todayString]?.steps || false;
    document.getElementById('habit-diet').checked = storedLogs[todayString]?.diet || false;
    document.getElementById('habit-water').checked = storedLogs[todayString]?.water || false;

    // Orchestrate remaining visual components render updates
    renderStreaksUI();
    renderCalendarUI();
    renderWeightAnalyticsUI();
    renderPerformanceReportsUI();
}

function saveTodayLogs() {
    const todayStr = normalizeDateString(new Date());
    const dataLogs = JSON.parse(localStorage.getItem('fitnessTracker_data') || '{}');
    const cycleIndex = calculateCycleDayPointer(todayStr);

    const isRestPeriod = cycleIndex && ROUTINE_SCHEMATICS[cycleIndex]?.rest;

    dataLogs[todayStr] = {
        gym: isRestPeriod ? true : document.getElementById('habit-gym').checked,
        steps: document.getElementById('habit-steps').checked,
        diet: document.getElementById('habit-diet').checked,
        water: document.getElementById('habit-water').checked
    };

    localStorage.setItem('fitnessTracker_data', JSON.stringify(dataLogs));
    renderUserInterfaceState();
}

function updateStartDateSetting(newDateString) {
    if (!newDateString) return;
    localStorage.setItem('fitnessTracker_startDate', newDateString);
    renderUserInterfaceState();
}

// Continuity Logic Computations Processing Streams
function evaluateChainCount(habitMetricKey) {
    let continuousStreak = 0;
    let evalCursor = new Date();
    const boundariesLimit = localStorage.getItem('fitnessTracker_startDate');
    if (!boundariesLimit) return 0;

    const dataLogs = JSON.parse(localStorage.getItem('fitnessTracker_data') || '{}');

    function checkSuccessState(targetString) {
        const cycleNum = calculateCycleDayPointer(targetString);
        if (!cycleNum) return false;

        const isRestPhase = ROUTINE_SCHEMATICS[cycleNum]?.rest;
        const record = dataLogs[targetString];

        const gymValid = isRestPhase ? true : (record?.gym || false);
        if (habitMetricKey === 'gym') return gymValid;

        const stepsValid = record?.steps || false;
        if (habitMetricKey === 'steps') return stepsValid;

        const dietValid = record?.diet || false;
        if (habitMetricKey === 'diet') return dietValid;

        const waterValid = record?.water || false;
        if (habitMetricKey === 'water') return waterValid;

        if (habitMetricKey === 'overall') {
            return gymValid && stepsValid && dietValid && waterValid;
        }
        return false;
    }

    let todayStr = normalizeDateString(evalCursor);
    let shiftToPastBaseline = !checkSuccessState(todayStr);

    if (shiftToPastBaseline) {
        // If today is currently incomplete, verify if yesterday was accurate to maintain history chain continuity
        evalCursor.setDate(evalCursor.getDate() - 1);
        let yesterdayStr = normalizeDateString(evalCursor);
        if (!checkSuccessState(yesterdayStr)) return 0; // Continuous chain definitively broken
    }

    while (true) {
        let cursorString = normalizeDateString(evalCursor);
        if (cursorString < boundariesLimit) break;

        if (checkSuccessState(cursorString)) {
            continuousStreak++;
            evalCursor.setDate(evalCursor.getDate() - 1);
        } else {
            break;
        }
    }
    return continuousStreak;
}

function buildStreakTemplateMarkup() {
    return `
        <div class="streak-row-card highlight">
            <div class="streak-row-meta">
                <span class="streak-row-title">Perfect Synergy Chain</span>
                <span class="streak-row-val">${evaluateChainCount('overall')} Day Continuous Streak</span>
            </div>
            <span>🔥</span>
        </div>
        <div class="streak-row-card">
            <div class="streak-row-meta">
                <span class="streak-row-title">Gym Habit Matrix</span>
                <span class="streak-row-val">${evaluateChainCount('gym')} Cycles</span>
            </div>
            <span>🏋️</span>
        </div>
        <div class="streak-row-card">
            <div class="streak-row-meta">
                <span class="streak-row-title">Step Metric Target</span>
                <span class="streak-row-val">${evaluateChainCount('steps')} Days</span>
            </div>
            <span>👣</span>
        </div>
        <div class="streak-row-card">
            <div class="streak-row-meta">
                <span class="streak-row-title">Diet Compliance</span>
                <span class="streak-row-val">${evaluateChainCount('diet')} Days</span>
            </div>
            <span>🥗</span>
        </div>
        <div class="streak-row-card">
            <div class="streak-row-meta">
                <span class="streak-row-title">Water Target Saturation</span>
                <span class="streak-row-val">${evaluateChainCount('water')} Days</span>
            </div>
            <span>💧</span>
        </div>
    `;
}

function renderStreaksUI() {
    const markupString = buildStreakTemplateMarkup();
    document.getElementById('today-streaks-container').innerHTML = markupString;
    document.getElementById('calendar-streaks-container').innerHTML = markupString;
}

// Calendar UI Rendering Methods
function changeMonth(offsetDirection) {
    activeDisplayCalendarDate.setMonth(activeDisplayCalendarDate.getMonth() + offsetDirection);
    renderCalendarUI();
}

function renderCalendarUI() {
    const matrixGrid = document.getElementById('calendar-grid-container');
    matrixGrid.innerHTML = '';

    const targetYear = activeDisplayCalendarDate.getFullYear();
    const targetMonth = activeDisplayCalendarDate.getMonth();

    document.getElementById('calendar-month-title').innerText = activeDisplayCalendarDate.toLocaleDateString(undefined, {
        month: 'long', year: 'numeric'
    });

    const weekHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    weekHeaders.forEach(dayName => {
        const headingNode = document.createElement('div');
        headingNode.className = 'cal-weekday';
        headingNode.innerText = dayName;
        matrixGrid.appendChild(headingNode);
    });

    const indexFirstDay = new Date(targetYear, targetMonth, 1).getDay();
    const cellPaddingOffset = indexFirstDay === 0 ? 6 : indexFirstDay - 1;
    const boundaryDaysCount = new Date(targetYear, targetMonth + 1, 0).getDate();

    for (let p = 0; p < cellPaddingOffset; p++) {
        matrixGrid.appendChild(document.createElement('div'));
    }

    const dataLogs = JSON.parse(localStorage.getItem('fitnessTracker_data') || '{}');
    const realTimeTodayString = normalizeDateString(new Date());

    for (let dayCursor = 1; dayCursor <= boundaryDaysCount; dayCursor++) {
        const exactDate = new Date(targetYear, targetMonth, dayCursor);
        const cellDateString = normalizeDateString(exactDate);
        const cyclePosition = calculateCycleDayPointer(cellDateString);

        const gridCell = document.createElement('div');
        gridCell.className = 'cal-date-node';

        let innerContentStr = `<div>${dayCursor}</div>`;
        if (cyclePosition) innerContentStr += `<div class="sub-lbl">Day ${cyclePosition}</div>`;
        gridCell.innerHTML = innerContentStr;

        if (cellDateString > realTimeTodayString) {
            gridCell.classList.add('cell-inactive-future');
        } else {
            const entryRecord = dataLogs[cellDateString];
            const isRestScheduled = cyclePosition && ROUTINE_SCHEMATICS[cyclePosition]?.rest;

            if (!entryRecord) {
                gridCell.classList.add('cell-unlogged');
            } else {
                const checkGymFactor = isRestScheduled ? true : entryRecord.gym;
                const scoresCount = (checkGymFactor ? 1 : 0) + (entryRecord.steps ? 1 : 0) + (entryRecord.diet ? 1 : 0) + (entryRecord.water ? 1 : 0);

                if (scoresCount === 4) {
                    gridCell.classList.add('cell-complete-all');
                } else if (scoresCount >= 2) {
                    gridCell.classList.add('cell-complete-partial');
                } else if (isRestScheduled) {
                    gridCell.classList.add('cell-rest-logged');
                } else {
                    gridCell.classList.add('cell-failed-threshold');
                }
            }
        }

        if (cellDateString === realTimeTodayString) {
            gridCell.classList.add('cell-current-active');
        }

        matrixGrid.appendChild(gridCell);
    }
}

// Weight Storage System and Interface Updates
function addWeightLog() {
    const inputField = document.getElementById('weight-input');
    const entryNumericValue = parseFloat(inputField.value);

    if (!entryNumericValue || isNaN(entryNumericValue)) {
        alert("Please output a valid metrics configuration number value.");
        return;
    }

    const collection = JSON.parse(localStorage.getItem('fitnessTracker_weights') || '[]');
    collection.push({
        date: normalizeDateString(new Date()),
        value: entryNumericValue
    });

    localStorage.setItem('fitnessTracker_weights', JSON.stringify(collection));
    inputField.value = '';
    renderUserInterfaceState();
}

function renderWeightAnalyticsUI() {
    const historicalEntries = JSON.parse(localStorage.getItem('fitnessTracker_weights') || '[]');
    const containerViewport = document.getElementById('weight-history-container');
    containerViewport.innerHTML = '';

    if (historicalEntries.length === 0) {
        document.getElementById('stat-start').innerText = "--";
        document.getElementById('stat-current').innerText = "--";
        document.getElementById('stat-lost').innerText = "--";
        document.getElementById('stat-lowest').innerText = "--";
        containerViewport.innerHTML = `<div style="color:var(--text-muted);font-size:0.9rem;padding:8px;">No biometric histories committed yet.</div>`;
        return;
    }

    historicalEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    const initialBase = historicalEntries[0].value;
    const currentLatest = historicalEntries[historicalEntries.length - 1].value;
    const netLossDelta = initialBase - currentLatest;
    const absoluteLowest = Math.min(...historicalEntries.map(entry => entry.value));

    document.getElementById('stat-start').innerText = `${initialBase.toFixed(1)} kg`;
    document.getElementById('stat-current').innerText = `${currentLatest.toFixed(1)} kg`;
    document.getElementById('stat-lost').innerText = `${netLossDelta.toFixed(1)} kg`;
    document.getElementById('stat-lowest').innerText = `${absoluteLowest.toFixed(1)} kg`;

    const chronologicalReversed = [...historicalEntries].reverse();

    chronologicalReversed.forEach((item, visualIndex) => {
        const indexTrueHistorical = historicalEntries.findIndex(target => target === item);
        let badgeDeltaHTML = '';

        if (indexTrueHistorical > 0) {
            const priorMassValue = historicalEntries[indexTrueHistorical - 1].value;
            const varianceDelta = item.value - priorMassValue;

            if (varianceDelta < 0) {
                badgeDeltaHTML = `<span class="delta txt-down">${varianceDelta.toFixed(1)} kg</span>`;
            } else if (varianceDelta > 0) {
                badgeDeltaHTML = `<span class="delta txt-up">+${varianceDelta.toFixed(1)} kg</span>`;
            } else {
                badgeDeltaHTML = `<span class="delta" style="color:var(--text-muted)">0.0 kg</span>`;
            }
        } else {
            badgeDeltaHTML = `<span class="delta" style="color:var(--text-muted)">--</span>`;
        }

        const recordRowElement = document.createElement('div');
        recordRowElement.className = 'timeline-row';
        recordRowElement.innerHTML = `
            <span>${new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            <strong>${item.value.toFixed(1)} kg</strong>
            ${badgeDeltaHTML}
        `;
        containerViewport.appendChild(recordRowElement);
    });
}

// Performance Analytical Summaries Data Processing
function renderPerformanceReportsUI() {
    const liveTimeObj = new Date();
    const structuralYear = liveTimeObj.getFullYear();
    const structuralMonth = liveTimeObj.getMonth();

    const dataLogs = JSON.parse(localStorage.getItem('fitnessTracker_data') || '{}');
    const massLogs = JSON.parse(localStorage.getItem('fitnessTracker_weights') || '[]');

    let trackingDaysElapsedCount = 0;
    let successfulLogsCapturedCount = 0;
    let perfectDaysAchievedCount = 0;

    let analyticsTotals = { gym: 0, steps: 0, diet: 0, water: 0 };

    const totalDaysInSelectedMonth = new Date(structuralYear, structuralMonth + 1, 0).getDate();
    const terminalLimitDay = liveTimeObj.getDate();

    for (let dayCursor = 1; dayCursor <= totalDaysInSelectedMonth; dayCursor++) {
        const focusDate = new Date(structuralYear, structuralMonth, dayCursor);
        const focusDateStr = normalizeDateString(focusDate);

        if (dayCursor <= terminalLimitDay) {
            trackingDaysElapsedCount++;
        }

        if (dataLogs[focusDateStr]) {
            successfulLogsCapturedCount++;
            const dayRecord = dataLogs[focusDateStr];
            const matrixIndex = calculateCycleDayPointer(focusDateStr);
            const isRestInterval = matrixIndex && ROUTINE_SCHEMATICS[matrixIndex]?.rest;

            const gymTrue = isRestInterval ? true : !!dayRecord.gym;
            const stepsTrue = !!dayRecord.steps;
            const dietTrue = !!dayRecord.diet;
            const waterTrue = !!dayRecord.water;

            if (gymTrue) analyticsTotals.gym++;
            if (stepsTrue) analyticsTotals.steps++;
            if (dietTrue) analyticsTotals.diet++;
            if (waterTrue) analyticsTotals.water++;

            if (gymTrue && stepsTrue && dietTrue && waterTrue) {
                perfectDaysAchievedCount++;
            }
        }
    }

    const normalizerDivisor = trackingDaysElapsedCount || 1;
    const metricsPercentages = {
        gym: Math.round((analyticsTotals.gym / normalizerDivisor) * 100),
        steps: Math.round((analyticsTotals.steps / normalizerDivisor) * 100),
        diet: Math.round((analyticsTotals.diet / normalizerDivisor) * 100),
        water: Math.round((analyticsTotals.water / normalizerDivisor) * 100)
    };

    const aggregatedConsistencyIndex = Math.round((metricsPercentages.gym + metricsPercentages.steps + metricsPercentages.diet + metricsPercentages.water) / 4);

    let finalTierLetter = 'D';
    let summaryVerdictString = 'Consistency threshold requires alignment. Analyze tracking bottlenecks and isolate systemic failures.';

    if (aggregatedConsistencyIndex >= 90) {
        finalTierLetter = 'A';
        summaryVerdictString = 'Exemplary execution tracking profiles. Habit performance accuracy registers elite tier status.';
    } else if (aggregatedConsistencyIndex >= 75) {
        finalTierLetter = 'B';
        summaryVerdictString = 'Strong baseline consistency structural integrity. Maintain momentum to optimize output potential.';
    } else if (aggregatedConsistencyIndex >= 60) {
        finalTierLetter = 'C';
        summaryVerdictString = 'Moderate output adherence verified. Minor system adjustments will resolve optimization variance gaps.';
    }

    const currentMonthBiometricMatches = massLogs.filter(w => {
        const parsingDate = new Date(w.date);
        return parsingDate.getFullYear() === structuralYear && parsingDate.getMonth() === structuralMonth;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    let massChangeTextLabel = "0.0 kg";
    if (currentMonthBiometricMatches.length >= 2) {
        const massDeltaNumeric = currentMonthBiometricMatches[currentMonthBiometricMatches.length - 1].value - currentMonthBiometricMatches[0].value;
        massChangeTextLabel = `${massDeltaNumeric > 0 ? '+' : ''}${massDeltaNumeric.toFixed(1)} kg`;
    }

    document.getElementById('report-grade').innerText = finalTierLetter;
    document.getElementById('report-verdict').innerText = summaryVerdictString;
    document.getElementById('rep-days').innerText = `${successfulLogsCapturedCount} / ${trackingDaysElapsedCount}`;
    document.getElementById('rep-perfect').innerText = perfectDaysAchievedCount;
    document.getElementById('rep-gym').innerText = `${metricsPercentages.gym}%`;
    document.getElementById('rep-steps').innerText = `${metricsPercentages.steps}%`;
    document.getElementById('rep-diet').innerText = `${metricsPercentages.diet}%`;
    document.getElementById('rep-water').innerText = `${metricsPercentages.water}%`;
    document.getElementById('rep-weight').innerText = massChangeTextLabel;
    document.getElementById('rep-consistency').innerText = `${aggregatedConsistencyIndex}%`;

    const summaryBoxContainer = document.getElementById('report-summary-box');
    if (terminalLimitDay === totalDaysInSelectedMonth) {
        let sortedHabitsList = [
            { name: 'Gym Performance Accuracy', value: metricsPercentages.gym },
            { name: 'Step Targets Adherence', value: metricsPercentages.steps },
            { name: 'Diet Optimization Adherence', value: metricsPercentages.diet },
            { name: 'Hydration Tracking Saturation', value: metricsPercentages.water }
        ].sort((a, b) => b.value - a.value);

        summaryBoxContainer.innerHTML = `
            <div class="report-summary-text">
                <strong>Structural Completion Matrix Log:</strong> Operational checks captured ${successfulLogsCapturedCount} data sets 
                across ${trackingDaysElapsedCount} elapsed tracking segments, logging ${perfectDaysAchievedCount} flawless tracking profiles. 
                Your peak architectural habit parameter was <strong>${sortedHabitsList[0].name}</strong> operating at ${sortedHabitsList[0].value}% efficiency. 
                Net physiological mass variance indicators shifted by ${massChangeTextLabel} during this monitoring block window.
            </div>
        `;
    } else {
        summaryBoxContainer.innerHTML = '';
    }
}