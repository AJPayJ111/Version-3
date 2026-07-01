// Global Application Context State Variable Cache
let currentUserId = null;
let regressionChartInstance = null;
let volumeTrendChartInstance = null;
let machineVolumeChartInstance = null;
let calorieChartInstance = null;
let workoutOptions = ['Chest Press', 'Lat Pulldown', 'Leg Press', 'Seated Row', 'Shoulder Press', 'Leg Curl', 'Cable Machine'];
let questTemplates = [
    { id: 'steps', title: 'Walk 8k–10k steps', detail: 'Get moving with a brisk walk or a long stroll.' },
    { id: 'mobility', title: 'Mobility flow', detail: 'Do 10–15 minutes of stretching, yoga, or mobility work.' },
    { id: 'cardio', title: 'Cardio session', detail: 'Enjoy a bike, swim, jog, or brisk cardio block.' },
    { id: 'recovery', title: 'Recovery log', detail: 'Log a rest day or recovery session to support performance.' },
    { id: 'gym', title: 'Gym session', detail: 'Complete a strength workout and log it in the dashboard.' }
];

// Core Abstraction Data Layers
function getUsers() {
    const stored = localStorage.getItem('st_users');
    if (stored) {
        const users = JSON.parse(stored);
        if (!users.some(u => u.email === 'ai.info')) {
            users.push({ id: 999, name: 'AI.info', email: 'ai.info', password: 'Ai.Info2026!' });
            localStorage.setItem('st_users', JSON.stringify(users));
        }
        return users;
    }
    return [
        { id: 1, name: 'Demo User', email: 'demo@test.com', password: 'alexisDEAD111!' },
        { id: 999, name: 'AI.info', email: 'ai.info', password: 'Ai.Info2026!' }
    ];
}

function saveUsers(users) {
    localStorage.setItem('st_users', JSON.stringify(users));
}

function getSessions() {
    const stored = localStorage.getItem('st_sessions');
    if (!stored) return [];
    const all = JSON.parse(stored);
    // Explicitly parse currentUserId to numeric to prevent data filtering errors
    return all.filter(s => Number(s.userId) === Number(currentUserId));
}

function saveSessions(sessions) {
    const stored = localStorage.getItem('st_sessions');
    const all = stored ? JSON.parse(stored) : [];
    const others = all.filter(s => Number(s.userId) !== Number(currentUserId));
    const combined = others.concat(sessions);
    localStorage.setItem('st_sessions', JSON.stringify(combined));
}

function getMeals() {
    const stored = localStorage.getItem('st_meals');
    if (!stored) return [];
    const all = JSON.parse(stored);
    return all.filter(m => Number(m.userId) === Number(currentUserId));
}

function saveMeals(meals) {
    const stored = localStorage.getItem('st_meals');
    const all = stored ? JSON.parse(stored) : [];
    const others = all.filter(m => Number(m.userId) !== Number(currentUserId));
    const combined = others.concat(meals);
    localStorage.setItem('st_meals', JSON.stringify(combined));
}

function getScheduleEntries() {
    const stored = localStorage.getItem('st_schedule');
    if (!stored) return [];
    const all = JSON.parse(stored);
    return all.filter(e => Number(e.userId) === Number(currentUserId));
}

function saveScheduleEntries(entries) {
    const stored = localStorage.getItem('st_schedule');
    const all = stored ? JSON.parse(stored) : [];
    const others = all.filter(e => Number(e.userId) !== Number(currentUserId));
    const combined = others.concat(entries);
    localStorage.setItem('st_schedule', JSON.stringify(combined));
}

function getWorkoutOptions() {
    const stored = localStorage.getItem('st_workoutOptions');
    if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length) return parsed;
    }
    return workoutOptions;
}

function getAppPreferences() {
    const stored = localStorage.getItem('st_appPreferences');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (error) {
            return {};
        }
    }
    return {};
}

function saveAppPreferences(prefs) {
    localStorage.setItem('st_appPreferences', JSON.stringify(prefs));
}

function applyThemeColor(color) {
    document.documentElement.style.setProperty('--accent-amber', color);
    const primary = color;
    document.documentElement.style.setProperty('--btn-primary', primary);
    document.documentElement.style.setProperty('--btn-primary-hover', shadeColor(primary, 12));
}

function applyZoom(value) {
    document.documentElement.style.setProperty('--app-zoom', value);
    document.body.style.zoom = value;
}

function applyLanguage(lang) {
    const loginPageTitle = document.getElementById('loginPageTitle');
    const loginPageSubtitle = document.getElementById('loginPageSubtitle');
    const loginCardTitle = document.getElementById('loginCardTitle');
    const loginEmailLabel = document.getElementById('loginEmailLabel');
    const loginPasswordLabel = document.getElementById('loginPasswordLabel');
    const loginButton = document.getElementById('loginButton');
    const loginRegisterPrompt = document.getElementById('loginRegisterPrompt');

    const strings = {
        en: {
            title: '📚 AlphaLoad',
            subtitle: 'Log in to securely manage your routines.',
            cardTitle: 'Login',
            emailLabel: 'Email Address',
            passwordLabel: 'Password',
            button: 'Sign In',
            register: 'No account? <a href="#" onclick="showPage(\'page-register\')" style="color:var(--accent-amber);">Register here</a>'
        },
        es: {
            title: '📚 AlphaLoad',
            subtitle: 'Inicia sesión para administrar tus rutinas.',
            cardTitle: 'Iniciar sesión',
            emailLabel: 'Correo electrónico',
            passwordLabel: 'Contraseña',
            button: 'Ingresar',
            register: '¿Sin cuenta? <a href="#" onclick="showPage(\'page-register\')" style="color:var(--accent-amber);">Regístrate aquí</a>'
        },
        fr: {
            title: '📚 AlphaLoad',
            subtitle: 'Connectez-vous pour gérer vos routines.',
            cardTitle: 'Connexion',
            emailLabel: 'Adresse e-mail',
            passwordLabel: 'Mot de passe',
            button: 'Se connecter',
            register: 'Pas de compte ? <a href="#" onclick="showPage(\'page-register\')" style="color:var(--accent-amber);">Inscrivez-vous ici</a>'
        }
    };

    const selected = strings[lang] || strings.en;
    if (loginPageTitle) loginPageTitle.textContent = selected.title;
    if (loginPageSubtitle) loginPageSubtitle.textContent = selected.subtitle;
    if (loginCardTitle) loginCardTitle.textContent = selected.cardTitle;
    if (loginEmailLabel) loginEmailLabel.textContent = selected.emailLabel;
    if (loginPasswordLabel) loginPasswordLabel.textContent = selected.passwordLabel;
    if (loginButton) loginButton.textContent = selected.button;
    if (loginRegisterPrompt) loginRegisterPrompt.innerHTML = selected.register;
}

function loadAppSettings() {
    const prefs = getAppPreferences();
    if (prefs.themeColor) applyThemeColor(prefs.themeColor);
    if (prefs.zoom) applyZoom(prefs.zoom);
    if (prefs.language) {
        applyLanguage(prefs.language);
        const loginLanguage = document.getElementById('loginLanguage');
        if (loginLanguage) loginLanguage.value = prefs.language;
        const settingsLanguage = document.getElementById('settingsLanguage');
        if (settingsLanguage) settingsLanguage.value = prefs.language;
    }
    const themeControl = document.getElementById('themeColorSelect');
    if (themeControl && prefs.themeColor) themeControl.value = prefs.themeColor;
    const zoomInput = document.getElementById('zoomRange');
    if (zoomInput && prefs.zoom) {
        zoomInput.value = prefs.zoom;
        const zoomValue = document.getElementById('zoomValue');
        if (zoomValue) zoomValue.textContent = `${Math.round(prefs.zoom * 100)}%`;
    }
}

function setThemeColor(color) {
    applyThemeColor(color);
    const prefs = getAppPreferences();
    prefs.themeColor = color;
    saveAppPreferences(prefs);
}

function setZoom(value) {
    const zoom = parseFloat(value) || 1;
    applyZoom(zoom);
    const prefs = getAppPreferences();
    prefs.zoom = zoom;
    saveAppPreferences(prefs);
    const zoomValue = document.getElementById('zoomValue');
    if (zoomValue) zoomValue.textContent = `${Math.round(zoom * 100)}%`;
}

function setLanguage(lang) {
    const prefs = getAppPreferences();
    prefs.language = lang;
    saveAppPreferences(prefs);
    applyLanguage(lang);
    const loginLanguage = document.getElementById('loginLanguage');
    if (loginLanguage) loginLanguage.value = lang;
}

function applyLoginLanguage() {
    const loginLanguage = document.getElementById('loginLanguage');
    if (!loginLanguage) return;
    setLanguage(loginLanguage.value);
}

function resetAppPreferences() {
    localStorage.removeItem('st_appPreferences');
    applyThemeColor('#f39c12');
    setZoom(1);
    setLanguage('en');
    const themeControl = document.getElementById('themeColorSelect');
    if (themeControl) themeControl.value = '#f39c12';
    const settingsLanguage = document.getElementById('settingsLanguage');
    if (settingsLanguage) settingsLanguage.value = 'en';
}

function showLoginValidation(message) {
    const overlay = document.getElementById('loginValidationOverlay');
    const messageEl = document.getElementById('loginValidationMessage');
    if (messageEl) messageEl.textContent = message;
    if (overlay) {
        overlay.style.display = 'flex';
        overlay.setAttribute('aria-hidden', 'false');
    }
}

function closeLoginValidation() {
    const overlay = document.getElementById('loginValidationOverlay');
    if (overlay) {
        overlay.style.display = 'none';
        overlay.setAttribute('aria-hidden', 'true');
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
    return /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) && password.length >= 10;
}

function shadeColor(color, percent) {
    const f = parseInt(color.slice(1), 16);
    const t = percent < 0 ? 0 : 255;
    const p = Math.abs(percent) / 100;
    const R = f >> 16;
    const G = (f >> 8) & 0x00ff;
    const B = f & 0x0000ff;
    const newR = Math.round((t - R) * p) + R;
    const newG = Math.round((t - G) * p) + G;
    const newB = Math.round((t - B) * p) + B;
    return `#${(0x1000000 + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
}

function getFriendData() {
    const stored = localStorage.getItem('st_friends');
    if (!stored) return { friends: [], requests: [] };
    return JSON.parse(stored);
}

function saveFriendData(data) {
    localStorage.setItem('st_friends', JSON.stringify(data));
}

function getVideoResources() {
    const stored = localStorage.getItem('st_videoResources');
    if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length) return parsed;
    }
    return [
        {
            id: 'video-1',
            title: 'How to use the leg press safely',
            description: 'Learn foot placement, range of motion, and breathing cues for a beginner-friendly setup.',
            url: 'https://www.youtube.com/results?search_query=leg+press+beginner+guide',
            category: 'Machine'
        },
        {
            id: 'video-2',
            title: 'Lat pulldown form essentials',
            description: 'Follow a simple sequence for posture, grip, and smooth control.',
            url: 'https://www.youtube.com/results?search_query=lat+pulldown+beginner+form',
            category: 'Machine'
        },
        {
            id: 'video-3',
            title: 'Beginner gym checklist',
            description: 'A short primer on warmups, hydration, and how to start a first session with confidence.',
            url: 'https://www.youtube.com/results?search_query=beginner+gym+checklist',
            category: 'Tips'
        }
    ];
}

function saveVideoResources(resources) {
    localStorage.setItem('st_videoResources', JSON.stringify(resources));
}

function getCurrentUserName() {
    const user = getUsers().find(u => Number(u.id) === Number(currentUserId));
    return user ? user.name : 'You';
}

function seedDemoData() {
    const users = getUsers();
    const aiUser = users.find(u => u.email === 'ai.info');
    if (!aiUser) {
        users.push({ id: 999, name: 'AI.info', email: 'ai.info', password: 'Ai.Info2026!' });
        saveUsers(users);
    }

    const existingSessions = getSessions();
    if (!existingSessions.length) {
        const demoSessions = [
            { id: 1001, userId: Number(currentUserId), date: '2026-06-24', subject: 'Leg Press', sets: 3, reps: 10, weight: 120, notes: 'Solid push', volumeScore: 3600, durationMins: 3600 },
            { id: 1002, userId: Number(currentUserId), date: '2026-06-25', subject: 'Walking', sets: 1, reps: 1, weight: 1, notes: '8k steps', volumeScore: 8000, durationMins: 8000 },
            { id: 1003, userId: Number(currentUserId), date: '2026-06-26', subject: 'Mobility', sets: 1, reps: 1, weight: 1, notes: 'Recovery flow', volumeScore: 1200, durationMins: 1200 },
            { id: 1004, userId: Number(currentUserId), date: '2026-06-27', subject: 'Cardio Day', sets: 1, reps: 1, weight: 1, notes: 'Bike ride', volumeScore: 2500, durationMins: 2500 },
            { id: 1005, userId: Number(currentUserId), date: '2026-06-28', subject: 'Chest Press', sets: 3, reps: 8, weight: 100, notes: 'Felt strong', volumeScore: 2400, durationMins: 2400 }
        ];
        saveSessions(demoSessions);
    }

    const existingMeals = getMeals();
    if (!existingMeals.length) {
        const demoMeals = [
            { id: 2001, userId: Number(currentUserId), date: '2026-06-24', name: 'Chicken Rice Bowl', protein: 40, calories: 620, notes: 'Post-workout' },
            { id: 2002, userId: Number(currentUserId), date: '2026-06-25', name: 'Salmon Salad', protein: 35, calories: 540, notes: 'Light lunch' },
            { id: 2003, userId: Number(currentUserId), date: '2026-06-26', name: 'Greek Yogurt Bowl', protein: 25, calories: 320, notes: 'Recovery snack' },
            { id: 2004, userId: Number(currentUserId), date: '2026-06-27', name: 'Turkey Wrap', protein: 30, calories: 480, notes: 'Pre-cardio' }
        ];
        saveMeals(demoMeals);
    }

    const existingSchedule = getScheduleEntries();
    if (!existingSchedule.length) {
        const demoSchedule = [
            { id: 3001, userId: Number(currentUserId), date: '2026-06-24', type: 'Rest Day', notes: 'Recovery' },
            { id: 3002, userId: Number(currentUserId), date: '2026-06-26', type: 'Cardio Day', notes: 'Easy bike ride' }
        ];
        saveScheduleEntries(demoSchedule);
    }

    const friendData = getFriendData();
    if (!friendData.friends.length && !friendData.requests.length) {
        saveFriendData({ friends: [{ id: 999, name: 'AI.info', score: 84 }], requests: [] });
    }
}

function saveWorkoutOptions(options) {
    localStorage.setItem('st_workoutOptions', JSON.stringify(options));
}

function addCustomWorkoutOption() {
    const input = document.getElementById('customWorkoutName');
    const select = document.getElementById('sessionSubject');
    const name = (input.value || '').trim();
    if (!name) return;

    const options = getWorkoutOptions();
    if (!options.includes(name)) {
        options.push(name);
        saveWorkoutOptions(options);
        renderWorkoutOptions();
    }

    if (select) {
        select.value = name;
    }
    input.value = '';
}

function renderWorkoutOptions() {
    const select = document.getElementById('sessionSubject');
    if (!select) return;
    const options = getWorkoutOptions();
    const currentValue = select.value;
    select.innerHTML = '<option value="">Select a machine</option>';
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        select.appendChild(opt);
    });
    if (currentValue && options.includes(currentValue)) {
        select.value = currentValue;
    }
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');
}

// Authentication Logic
function doLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    if (!email || !password) {
        errorEl.textContent = 'Email and password are required.';
        errorEl.style.display = 'block';
        return;
    }

    if (!isValidEmail(email)) {
        showLoginValidation('Your email must be in a valid format like name@domain.com.');
        return;
    }

    if (!isStrongPassword(password)) {
        showLoginValidation('Your password must be at least 10 characters long and include uppercase letters, lowercase letters, numbers, and symbols.');
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
        errorEl.textContent = 'Name, email, and password are required.';
        errorEl.style.display = 'block';
        return;
    }

    if (!isValidEmail(email)) {
        showLoginValidation('Please enter a valid email address for your new account.');
        return;
    }

    if (!isStrongPassword(password)) {
        showLoginValidation('Your password must be at least 10 characters and include uppercase letters, lowercase letters, numbers, and symbols.');
        return;
    }

    const users = getUsers();
    if (users.some(u => u.email === email)) {
        errorEl.textContent = 'This email is already registered.';
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
    sessionStorage.removeItem('adminUnlocked');
    showPage('page-login');
}

function addSession() {
    const date = document.getElementById('sessionDate').value;
    const subject = document.getElementById('sessionSubject').value.trim();
    const sets = document.getElementById('sessionSets').value;
    const reps = document.getElementById('sessionReps').value;
    const weight = document.getElementById('sessionWeight').value;
    const extra = document.getElementById('sessionExtra').value.trim();
    const errorEl = document.getElementById('sessionError');

    if (!date || !subject || !sets || !reps || !weight) {
        errorEl.textContent = 'Required workout fields are missing.';
        errorEl.style.display = 'block';
        return;
    }

    const parsedSets = parseInt(sets, 10);
    const parsedReps = parseInt(reps, 10);
    const parsedWeight = parseFloat(weight);

    if (parsedSets <= 0 || parsedReps <= 0 || parsedWeight <= 0) {
        errorEl.textContent = 'Sets, reps, and weight must all be greater than zero.';
        errorEl.style.display = 'block';
        return;
    }

    if (errorEl) errorEl.style.display = 'none';

    const volumeScore = parsedSets * parsedReps * parsedWeight;
    const session = {
        id: Date.now(),
        userId: Number(currentUserId),
        date,
        subject,
        sets: parsedSets,
        reps: parsedReps,
        weight: parsedWeight,
        notes: extra,
        volumeScore,
        durationMins: volumeScore
    };

    const sessions = getSessions();
    sessions.push(session);
    saveSessions(sessions);

    // Reset input fields
    document.getElementById('sessionDate').value = '';
    document.getElementById('sessionSubject').value = '';
    document.getElementById('sessionSets').value = '';
    document.getElementById('sessionReps').value = '';
    document.getElementById('sessionWeight').value = '';
    document.getElementById('sessionExtra').value = '';
    
    refreshDashboard();
}

function getSessionTrainingVolume(session) {
    const sets = Number(session.sets ?? 0);
    const reps = Number(session.reps ?? 0);
    const weight = Number(session.weight ?? 0);

    if (sets > 0 && reps > 0 && weight > 0) {
        return sets * reps * weight;
    }

    return Number(session.volumeScore ?? session.durationMins ?? 0);
}

function addMeal() {
    const date = document.getElementById('mealDate').value;
    const name = document.getElementById('mealName').value.trim();
    const protein = document.getElementById('mealProtein').value;
    const calories = document.getElementById('mealCalories').value;
    const notes = document.getElementById('mealNotes').value.trim();
    const errorEl = document.getElementById('mealError');

    if (!date || !name || !protein || !calories) {
        errorEl.textContent = 'Meal date, name, protein, and calories are required.';
        errorEl.style.display = 'block';
        return;
    }

    if (errorEl) errorEl.style.display = 'none';

    const meal = {
        id: Date.now(),
        userId: Number(currentUserId),
        date,
        name,
        protein: parseInt(protein, 10),
        calories: parseInt(calories, 10),
        notes
    };

    const meals = getMeals();
    meals.push(meal);
    saveMeals(meals);

    document.getElementById('mealDate').value = '';
    document.getElementById('mealName').value = '';
    document.getElementById('mealProtein').value = '';
    document.getElementById('mealCalories').value = '';
    document.getElementById('mealNotes').value = '';

    refreshDashboard();
}

function addScheduleEntry() {
    const date = document.getElementById('scheduleDate').value;
    const type = document.getElementById('scheduleType').value;
    const notes = document.getElementById('scheduleNotes').value.trim();
    const errorEl = document.getElementById('scheduleError');

    if (!date || !type) {
        errorEl.textContent = 'A date and schedule type are required.';
        errorEl.style.display = 'block';
        return;
    }

    if (errorEl) errorEl.style.display = 'none';

    const entry = {
        id: Date.now(),
        userId: Number(currentUserId),
        date,
        type,
        notes
    };

    const entries = getScheduleEntries();
    entries.push(entry);
    saveScheduleEntries(entries);

    document.getElementById('scheduleDate').value = '';
    document.getElementById('scheduleType').value = 'Rest Day';
    document.getElementById('scheduleNotes').value = '';

    refreshDashboard();
}

function openAdminUnlock() {
    const overlay = document.getElementById('adminUnlockOverlay');
    const errorEl = document.getElementById('adminPasswordError');
    if (overlay) {
        overlay.style.display = 'flex';
        overlay.setAttribute('aria-hidden', 'false');
    }
    if (errorEl) {
        errorEl.style.display = 'none';
    }
    const input = document.getElementById('adminPasswordInput');
    if (input) {
        input.value = '';
        input.focus();
    }
}

function closeAdminUnlock() {
    const overlay = document.getElementById('adminUnlockOverlay');
    if (overlay) {
        overlay.style.display = 'none';
        overlay.setAttribute('aria-hidden', 'true');
    }
}

function validateAdminPassword() {
    const input = document.getElementById('adminPasswordInput');
    const errorEl = document.getElementById('adminPasswordError');
    if (!input || !errorEl) return;

    if (input.value !== 'AJPayJ111') {
        errorEl.textContent = 'Invalid password. Please try again.';
        errorEl.style.display = 'block';
        return;
    }

    sessionStorage.setItem('adminUnlocked', '1');
    window.location.href = 'admin.html';
}

function deleteWorkout(sessionId) {
    if (!confirm('Remove this workout log?')) return;
    const sessions = getSessions().filter(session => Number(session.id) !== Number(sessionId));
    saveSessions(sessions);
    refreshDashboard();
}

function deleteScheduleEntry(entryId) {
    if (!confirm('Remove this rest/cardio entry?')) return;
    const entries = getScheduleEntries().filter(entry => Number(entry.id) !== Number(entryId));
    saveScheduleEntries(entries);
    refreshDashboard();
}

// Client Side Mathematical Modeling Pipeline (Equivalent to Scikit-Learn Linear Regression)
function computeLinearRegression(sessions) {
    if (sessions.length < 2) return null;

    // Map chronologically sorted sequences over ordinal vectors
    const sorted = [...sessions].sort((a,b) => new Date(a.date) - new Date(b.date));
    const X = sorted.map((_, index) => index + 1);
    const y = sorted.map(s => getSessionTrainingVolume(s));

    const n = X.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for(let i=0; i<n; i++) {
        sumX += X[i];
        sumY += y[i];
        sumXY += X[i] * y[i];
        sumXX += X[i] * X[i];
    }

    // Mathematical Slope formula calculation
    const slopeNum = (n * sumXY) - (sumX * sumY);
    const slopeDen = (n * sumXX) - (sumX * sumX);
    
    if (slopeDen === 0) return null;
    const slope = slopeNum / slopeDen;
    
    // Intercept formula
    const intercept = (sumY - (slope * sumX)) / n;
    
    // Extrapolate prediction point
    const nextX = n + 1;
    const projectedNextValue = (slope * nextX) + intercept;

    return {
        labels: X.map(val => `Log ${val}`),
        actuals: y,
        fittedLine: X.map(val => (slope * val) + intercept),
        prediction: { x: `Log ${nextX}`, y: Math.max(0, projectedNextValue) }
    };
}

function updateSummaryStats(sessions) {
    const totalEl = document.getElementById('statTotal');
    const hoursEl = document.getElementById('statHours');
    const subjectsEl = document.getElementById('statSubjects');

    if (!totalEl || !hoursEl || !subjectsEl) return;

    const totalVolume = sessions.reduce((sum, s) => sum + getSessionTrainingVolume(s), 0);
    const uniqueSubjects = new Set(sessions.map(s => s.subject)).size;

    totalEl.textContent = sessions.length;
    hoursEl.textContent = `${totalVolume.toFixed(0)} pts`;
    subjectsEl.textContent = uniqueSubjects;
}

function renderSessionTable(sessions) {
    const container = document.getElementById('sessionsContainer');
    if (!container) return;

    if (!sessions.length) {
        container.innerHTML = '<p style="color:var(--text-muted); font-size:14px;">No logs parsed within local client cache arrays.</p>';
        return;
    }

    const rows = sessions
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(session => `
            <tr>
                <td>${session.date}</td>
                <td>${session.subject}</td>
                <td>${session.sets || '-'} x ${session.reps || '-'} @ ${session.weight ? `${session.weight}` : '-'}</td>
                <td>${session.notes || '—'}</td>
                <td><button class="btn btn-danger" style="margin-top:0; padding:6px 10px; font-size:12px;" onclick="deleteWorkout(${session.id})">Delete</button></td>
            </tr>
        `)
        .join('');

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Machine</th>
                    <th>Sets/Reps/Weight</th>
                    <th>Extra</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

function renderMLVisualization(regressionData) {
    const chartCanvas = document.getElementById('regressionChart');
    const displayPanel = document.getElementById('mlModelOutput');
    
    if (!chartCanvas || !displayPanel) return; // Prevent crashes if elements aren't loaded

    if (!regressionData) {
        if(regressionChartInstance) regressionChartInstance.destroy();
        displayPanel.textContent = "Insufficient historical entry array sizes to run accurate optimizations. (Minimum 2 logs required).";
        return;
    }

    displayPanel.textContent = `Trend vector trajectory slope projection: ${regressionData.prediction.y.toFixed(1)} minutes targeted for next cycle index.`;

    if (regressionChartInstance) {
        regressionChartInstance.destroy();
    }

    if (typeof Chart === 'undefined') {
        if (chartCanvas.style) chartCanvas.style.display = 'none';
        displayPanel.textContent += ' Chart rendering library is unavailable right now.';
        return;
    }

    if (chartCanvas.style) chartCanvas.style.display = 'block';
    const ctx = chartCanvas.getContext('2d');
    
    // Configured targeting strict accessibility color standards
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
                    showLine: false // Keeps actual data points plotted as independent dots
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

function showDashboardView(view) {
    const dashboardView = document.getElementById('dashboardView');
    const analyticsView = document.getElementById('analyticsView');
    const guidanceView = document.getElementById('guidanceView');

    if (!dashboardView || !analyticsView || !guidanceView) return;

    dashboardView.style.display = 'none';
    analyticsView.style.display = 'none';
    guidanceView.style.display = 'none';

    if (view === 'analytics') {
        analyticsView.style.display = 'block';
    } else if (view === 'guidance') {
        guidanceView.style.display = 'block';
    } else {
        dashboardView.style.display = 'block';
    }
}

function jumpToSection(sectionId) {
    showDashboardView('dashboard');
    window.setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 80);
}

function renderAnalyticsTables(sessions) {
    const container = document.getElementById('analyticsTableContainer');
    if (!container) return;

    if (!sessions.length) {
        container.innerHTML = '<p style="color:var(--text-muted); font-size:14px;">No analytics data yet.</p>';
        return;
    }

    const totals = sessions.reduce((acc, session) => {
        const machine = session.subject || 'Unknown';
        const volume = getSessionTrainingVolume(session);
        acc[machine] = (acc[machine] || 0) + volume;
        return acc;
    }, {});

    const rows = Object.entries(totals)
        .sort((a, b) => b[1] - a[1])
        .map(([machine, volume]) => `
            <tr>
                <td>${machine}</td>
                <td>${Math.round(volume)}</td>
            </tr>
        `)
        .join('');

    container.innerHTML = `
        <table>
            <thead>
                <tr><th>Machine</th><th>Volume</th></tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

function renderAdditionalCharts(sessions) {
    const sorted = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = sorted.map(session => session.date);
    const volumes = sorted.map(session => getSessionTrainingVolume(session));

    const volumeCtx = document.getElementById('volumeTrendChart')?.getContext('2d');
    const machineCtx = document.getElementById('machineVolumeChart')?.getContext('2d');
    const calorieCtx = document.getElementById('calorieChart')?.getContext('2d');

    if (volumeCtx) {
        if (volumeTrendChartInstance) volumeTrendChartInstance.destroy();
        volumeTrendChartInstance = new Chart(volumeCtx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Training Volume',
                    data: volumes,
                    backgroundColor: '#2980b9'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
        });
    }

    const machineTotals = sorted.reduce((acc, session) => {
        const name = session.subject || 'Unknown';
        acc[name] = (acc[name] || 0) + getSessionTrainingVolume(session);
        return acc;
    }, {});

    if (machineCtx) {
        if (machineVolumeChartInstance) machineVolumeChartInstance.destroy();
        machineVolumeChartInstance = new Chart(machineCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(machineTotals),
                datasets: [{
                    data: Object.values(machineTotals),
                    backgroundColor: ['#2980b9', '#f39c12', '#2ecc71', '#9b59b6', '#e74c3c', '#1abc9c']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    const meals = getMeals();
    const calorieLabels = meals.length ? [...new Set(meals.map(meal => meal.date))].sort() : [];
    const calorieData = calorieLabels.map(date => meals.filter(meal => meal.date === date).reduce((sum, meal) => sum + (meal.calories || 0), 0));

    if (calorieCtx) {
        if (calorieChartInstance) calorieChartInstance.destroy();
        calorieChartInstance = new Chart(calorieCtx, {
            type: 'line',
            data: {
                labels: calorieLabels,
                datasets: [{
                    label: 'Calories',
                    data: calorieData,
                    borderColor: '#f39c12',
                    backgroundColor: '#f39c12',
                    fill: false,
                    tension: 0.2
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
        });
    }
}

function renderMealTable(meals) {
    const container = document.getElementById('mealTableContainer');
    if (!container) return;

    if (!meals.length) {
        container.innerHTML = '<p style="color:var(--text-muted); font-size:14px;">No meals logged yet.</p>';
        return;
    }

    const rows = meals
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(meal => `
            <tr>
                <td>${meal.date}</td>
                <td>${meal.name}</td>
                <td>${meal.protein}g</td>
                <td>${meal.calories}</td>
                <td>${meal.notes || '—'}</td>
            </tr>
        `)
        .join('');

    container.innerHTML = `
        <table>
            <thead>
                <tr><th>Date</th><th>Meal</th><th>Protein</th><th>Calories</th><th>Notes</th></tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

function renderCalendar(entries) {
    const container = document.getElementById('calendarContainer');
    if (!container) return;

    if (!entries.length) {
        container.innerHTML = '<p style="color:var(--text-muted); font-size:14px;">No rest or cardio days logged yet.</p>';
        return;
    }

    const rows = entries
        .slice()
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(entry => `
            <tr>
                <td>${entry.date}</td>
                <td>${entry.type}</td>
                <td>${entry.notes || '—'}</td>
                <td><button class="btn btn-danger" style="margin-top:0; padding:6px 10px; font-size:12px;" onclick="deleteScheduleEntry(${entry.id})">Delete</button></td>
            </tr>
        `)
        .join('');

    container.innerHTML = `
        <table>
            <thead>
                <tr><th>Date</th><th>Type</th><th>Notes</th><th>Action</th></tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

function renderQuestList() {
    const container = document.getElementById('questListContainer');
    if (!container) return;

    const streak = Math.min(10, Math.max(2, Math.round(getSessions().length / 2)));
    document.getElementById('streakValue').textContent = streak;

    const items = questTemplates.map((quest, index) => {
        const done = index < 2 || (index === 2 && getScheduleEntries().some(e => e.type === 'Cardio Day')) || (index === 3 && getScheduleEntries().some(e => e.type === 'Rest Day')) || (index === 4 && getSessions().length > 0);
        return `<div class="quest-item ${done ? 'done' : ''}"><strong>${quest.title}</strong><div>${quest.detail}</div></div>`;
    }).join('');

    container.innerHTML = items;
}

function renderGuidanceView() {
    const container = document.getElementById('guidanceVideoList');
    if (!container) return;

    const resources = getVideoResources();
    if (!resources.length) {
        container.innerHTML = '<p style="color:var(--text-muted); font-size:14px;">No video guides added yet.</p>';
        return;
    }

    container.innerHTML = resources.map(resource => `
        <div class="resource-item">
            <div style="display:flex; justify-content:space-between; gap:12px; align-items:center; flex-wrap:wrap;">
                <div>
                    <strong>${resource.title}</strong>
                    <div style="color:var(--text-muted); font-size:13px; margin-top:4px;">${resource.description}</div>
                </div>
                <span class="tag">${resource.category || 'Guide'}</span>
            </div>
            <a class="resource-link" href="${resource.url}" target="_blank" rel="noopener noreferrer">Watch video</a>
        </div>
    `).join('');
}

function renderFriends() {
    const requestsContainer = document.getElementById('friendRequestsContainer');
    const leaderboardContainer = document.getElementById('leaderboardContainer');
    if (!requestsContainer || !leaderboardContainer) return;

    const data = getFriendData();
    const friends = data.friends || [];
    const requests = data.requests || [];

    requestsContainer.innerHTML = requests.length ? requests.map(req => `<div class="friend-card">${req.name} <button class="btn btn-primary" style="margin-top:0;" onclick="acceptFriend('${req.name}')">Accept</button></div>`).join('') : '<p style="color:var(--text-muted); font-size:14px;">No pending requests.</p>';

    const leaderboardRows = friends
        .slice()
        .sort((a, b) => b.score - a.score)
        .map((friend, index) => `<tr><td>${index + 1}</td><td>${friend.name}</td><td>${friend.score}</td></tr>`)
        .join('');

    leaderboardContainer.innerHTML = `
        <table>
            <thead><tr><th>#</th><th>Friend</th><th>Score</th></tr></thead>
            <tbody>${leaderboardRows}</tbody>
        </table>
    `;
}

function sendFriendRequestFromInput() {
    const input = document.getElementById('friendTarget');
    const name = (input.value || '').trim();
    if (!name) return;
    const data = getFriendData();
    data.requests = data.requests || [];
    if (!data.requests.some(req => req.name === name)) {
        data.requests.push({ name, from: getCurrentUserName() });
        saveFriendData(data);
        renderFriends();
    }
    input.value = '';
}

function acceptFriend(name) {
    const data = getFriendData();
    data.requests = (data.requests || []).filter(req => req.name !== name);
    if (!data.friends.some(friend => friend.name === name)) {
        data.friends.push({ name, score: 82 });
    }
    saveFriendData(data);
    renderFriends();
}

function refreshDashboard() {
    const sessions = getSessions();
    const meals = getMeals();
    const scheduleEntries = getScheduleEntries();
    updateSummaryStats(sessions);
    renderSessionTable(sessions);
    const regressionData = computeLinearRegression(sessions);
    renderMLVisualization(regressionData);
    renderAnalyticsTables(sessions);
    renderAdditionalCharts(sessions);
    renderMealTable(meals);
    renderCalendar(scheduleEntries);
    renderQuestList();
    renderFriends();
    renderGuidanceView();
}

// Auto-authenticate window loader pipeline
window.addEventListener('DOMContentLoaded', () => {
    renderWorkoutOptions();
    loadAppSettings();
    const storedUid = localStorage.getItem('st_currentUser');
    if (storedUid) {
        currentUserId = parseInt(storedUid);
        const user = getUsers().find(u => u.id === currentUserId);
        if (user) {
            showPage('page-dashboard');
            const welcome = document.getElementById('welcomeMsg');
            if (welcome) welcome.textContent = 'Welcome back, ' + user.name;
            seedDemoData();
            refreshDashboard();
            return;
        }
    }
    showPage('page-login');
});