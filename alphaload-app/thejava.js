// Global Application Context State Variable Cache
let currentUserId = null;
let regressionChartInstance = null;

}

function getSessions() {
    const stored = localStorage.getItem('st_sessions');
    if (!stored) return [];
    const all = JSON.parse(stored);

}

function saveSessions(sessions) {
    const stored = localStorage.getItem('st_sessions');
    const all = stored ? JSON.parse(stored) : [];

    const combined = others.concat(sessions);
    localStorage.setItem('st_sessions', JSON.stringify(combined));
}


        return;
    }

    const users = getUsers();

        return;
    }

    const users = getUsers();

}

function doLogout() {
    currentUserId = null;

}

function addSession() {
    const date = document.getElementById('sessionDate').value;
    const subject = document.getElementById('sessionSubject').value.trim();

        errorEl.style.display = 'block';
        return;
    }


        errorEl.style.display = 'block';
        return;
    }

    if (errorEl) errorEl.style.display = 'none';

    const sessions = getSessions();
    sessions.push(session);
    saveSessions(sessions);


    
    refreshDashboard();
}


    const n = X.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for(let i=0; i<n; i++) {
        sumX += X[i];
        sumY += y[i];
        sumXY += X[i] * y[i];
        sumXX += X[i] * X[i];
    }


    const slopeNum = (n * sumXY) - (sumX * sumY);
    const slopeDen = (n * sumXX) - (sumX * sumX);
    
    if (slopeDen === 0) return null;
    const slope = slopeNum / slopeDen;
    

    const nextX = n + 1;
    const projectedNextValue = (slope * nextX) + intercept;

    return {

        return;
    }

    displayPanel.textContent = `Trend vector trajectory slope projection: ${regressionData.prediction.y.toFixed(1)} minutes targeted for next cycle index.`;

    if (regressionChartInstance) {
        regressionChartInstance.destroy();
    }


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


    const storedUid = localStorage.getItem('st_currentUser');
    if (storedUid) {
        currentUserId = parseInt(storedUid);
        const user = getUsers().find(u => u.id === currentUserId);
        if (user) {
            showPage('page-dashboard');

            refreshDashboard();
            return;
        }
    }
    showPage('page-login');
});