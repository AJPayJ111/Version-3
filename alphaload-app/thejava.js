// Global Application Context State Variable Cache
let currentUserId = null;
let regressionChartInstance = null;

// Core Abstraction Data Layers
function getUsers() {
    const stored = localStorage.getItem('st_users');
    if (stored) return JSON.parse(stored);
    return [{ id: 1, name: 'Demo User', email: 'demo@test.com', password: 'alexisDEAD111!' }];
}

function saveUsers(users) {
    localStorage.setItem('st_users', JSON.stringify(users));
}

function getSessions() {
    const stored = localStorage.getItem('st_sessions');
    if (!stored) return [];
    const all = JSON.parse(stored);
    return all.filter(s => s.userId == currentUserId);
}

function saveSessions(sessions) {
    const stored = localStorage.getItem('st_sessions');
    const all = stored ? JSON.parse(stored) : [];
    const others = all.filter(s => s.userId != currentUserId);
    const combined = others.concat(sessions);
    localStorage.setItem('st_sessions', JSON.stringify(combined));
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// Interactive Access Controls Authentication Logic
function doLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    if (!email || !password) {
        errorEl.textContent = 'All validation parameters required.';
        errorEl.style.display = 'block';
        return;
    }

    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === password);

    if (!found) {
        errorEl.textContent = 'Access Denied: Invalid security signature credentials.';
        errorEl.style.display = 'block';
        return;
    }

    if (errorEl) errorEl.style.display = 'none';
    currentUserId = found.id;
    localStorage.setItem('st_currentUser', found.id);
    
    showPage('page-dashboard');
    document.getElementById('welcomeMsg').textContent = 'Authenticated: ' + found.name;
    refreshDashboard();
}

function doRegister() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const errorEl = document.getElementById('registerError');

    if (!name || !email || !password) {
        errorEl.textContent = 'All functional registry parameters are required.';
        errorEl.style.display = 'block';
        return;
    }

    const users = getUsers();
    if (users.some(u => u.email === email)) {
        errorEl.textContent = 'Unique Constraint Conflict: Email key space collision.';
        errorEl.style.display = 'block';
        return;
    }

    const newUser = { id: Date.now(), name, email, password };
    users.push(newUser);
    saveUsers(users);

    currentUserId = newUser.id;
    localStorage.setItem('st_currentUser', newUser.id);
    showPage('page-dashboard');
    document.getElementById('welcomeMsg').textContent = 'Registered: ' + newUser.name;
    refreshDashboard();
}

function doLogout() {
    currentUserId = null;
    localStorage.removeItem('st_currentUser');
    showPage('page-login');
}

function addSession() {
    const date = document.getElementById('sessionDate').value;
    const subject = document.getElementById('sessionSubject').value.trim();
    const mins = document.getElementById('sessionMins').value;
    const notes = document.getElementById('sessionNotes').value.trim();
    const errorEl = document.getElementById('sessionError');

    if (!date || !subject || !mins) {
        errorEl.textContent = 'Required metadata fields missing.';
        errorEl.style.display = 'block';
        return;
    }

    if (parseInt(mins) <= 0) {
        errorEl.textContent = 'Domain Constraint Violation: Out of bounds duration scale.';
        errorEl.style.display = 'block';
        return;
    }

    if (errorEl) errorEl.style.display = 'none';
    const session = { id: Date.now(), userId: currentUserId, date, subject, durationMins: parseInt(mins), notes };

    const sessions = getSessions();
    sessions.push(session);
    saveSessions(sessions);

    // Reset fields
    document.getElementById('sessionSubject').value = '';
    document.getElementById('sessionMins').value = '';
    document.getElementById('sessionNotes').value = '';
    
    refreshDashboard();
}

// Client Side Mathematical Modeling Pipeline (Mathematical Equivalents of Scikit-Learn Regression)
function computeLinearRegression(sessions) {
    if (sessions.length < 2) return null;

    // Map chronologically sorted sequences over ordinal vectors to configure trend weights
    const sorted = [...sessions].sort((a,b) => new Date(a.date) - new Date(b.date));
    const X = sorted.map((_, index) => index + 1);
    const y = sorted.map(s => s.durationMins);

    const n = X.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for(let i=0; i<n; i++) {
        sumX += X[i];
        sumY += y[i];
        sumXY += X[i] * y[i];
        sumXX += X[i] * X[i];
    }

    // Slope calculation formula: m = (n*E(xy) - E(x)*E(y)) / (n*E(x^2) - (E(x))^2)
    const slopeNum = (n * sumXY) - (sumX * sumY);
    const slopeDen = (n * sumXX) - (sumX * sumX);
    
    if (slopeDen === 0) return null;
    const slope = slopeNum / slopeDen;
    
    // Intercept formula: b = (E(y) - m*E(x)) / n
    const intercept = (sumY - (slope * sumX)) / n;
    
    // Extrapolate values out one arbitrary vector unit past latest actual execution values
    const nextX = n + 1;
    const projectedNextValue = (slope * nextX) + intercept;

    return {
        labels: X.map(val => `Session ${val}`),
        actuals: y,
        fittedLine: X.map(val => (slope * val) + intercept),
        prediction: { x: `Session ${nextX}`, y: Math.max(0, projectedNextValue) }
    };
}

function renderMLVisualization(regressionData) {
    const ctx = document.getElementById('regressionChart').getContext('2d');
    const displayPanel = document.getElementById('mlModelOutput');

    if (!regressionData) {
        if(regressionChartInstance) regressionChartInstance.destroy();
        displayPanel.textContent = "Insufficient historical entry array sizes to run accurate optimization parameters (Minimum 2 logs required).";
        return;
    }

    displayPanel.textContent = `Trend vector trajectory slope projection: ${regressionData.prediction.y.toFixed(1)} minutes targeted for next cycle index.`;

    if (regressionChartInstance) {
        regressionChartInstance.destroy();
    }

    // Chart plotting initialization matrix maps configuration schemas targeting accessibility color standards
    regressionChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [...regressionData.labels, regressionData.prediction.x],
            datasets: [
                {
                    label: 'Actual Volume (Mins)',
                    data: [...regressionData.actuals, null],
                    borderColor: '#2980b9',
                    backgroundColor: '#2980b9',
                    borderWidth: 0,
                    pointRadius: 6,
                    showLine: false
                },
                {
                    label: 'Calculated Trend Vector Line',
                    data: [...regressionData.fittedLine, regressionData.prediction.y],
                    borderColor: '#f39c12',
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0
                },
                {
                    label: 'Next Data Predictive Index Point',
                    data: [...regressionData.labels.map(() => null), regressionData.prediction.y],
                    borderColor: '#2ecc71',
                    backgroundColor: '#2ecc71',
                    pointStyle: 'triangle',
                    pointRadius: 10,
                    showLine: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Added wrapper dashboard pipeline function to complete code cycle architecture execution
function refreshDashboard() {
    const sessions = getSessions();
    const regressionData = computeLinearRegression(sessions);
    renderMLVisualization(regressionData);
}

// Auto-authenticate on reloads if local key active
window.addEventListener('DOMContentLoaded', () => {
    const storedUid = localStorage.getItem('st_currentUser');
    if (storedUid) {
        currentUserId = parseInt(storedUid);
        const user = getUsers().find(u => u.id === currentUserId);
        if (user) {
            showPage('page-dashboard');
            document.getElementById('welcomeMsg').textContent = 'Welcome back, ' + user.name;
            refreshDashboard();
            return;
        }
    }
    showPage('page-login');
});