// Main application controller
class CampusNexusApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.setupNavigation();
    }

    checkAuthentication() {
        if (campusData.isAuthenticated()) {
            this.showMainApp();
        } else {
            this.showLoginModal();
        }
    }

    showMainApp() {
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('registerModal').classList.add('hidden');
        document.querySelector('.main-content').classList.remove('hidden');
        document.querySelector('.navbar').classList.remove('hidden');
        this.updateUserInfo();
        this.loadDashboard();
    }

    showLoginModal() {
        document.getElementById('loginModal').classList.remove('hidden');
        document.getElementById('registerModal').classList.add('hidden');
        document.querySelector('.main-content').classList.add('hidden');
        document.querySelector('.navbar').classList.add('hidden');
    }

    showRegisterModal() {
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('registerModal').classList.remove('hidden');
    }

    updateUserInfo() {
        const user = campusData.getCurrentUser();
        if (user) {
            const userInfo = document.getElementById('userInfo');
            if (userInfo) {
                userInfo.textContent = `${user.name} (${user.role})`;
            }
        }
    }

    setupEventListeners() {
        // Authentication forms
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection(link.getAttribute('href').substring(1));
            });
        });

        // Debounced search functionality
        const searchInput = document.getElementById('club-search');
        if (searchInput) {
            const debouncedSearch = campusData.debounce((value) => {
                this.handleSearch(value);
            }, 300);
            
            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }

        // Category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.handleCategoryFilter(e.target.value);
            });
        }

        // Time filter
        const timeFilter = document.getElementById('time-range');
        if (timeFilter) {
            timeFilter.addEventListener('change', () => {
                this.loadAnalytics();
            });
        }

        // Notification system
        this.setupNotificationSystem();
        
        // Cleanup interval
        setInterval(() => {
            campusData.cleanup();
        }, 10 * 60 * 1000); // Every 10 minutes
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const user = campusData.authenticateUser(username, password);
        if (user) {
            this.showMainApp();
            campusAnimations.pulseElement('.stats-grid');
        } else {
            alert('Invalid username or password');
        }
    }

    handleRegister() {
        const formData = {
            name: document.getElementById('regName').value,
            email: document.getElementById('regEmail').value,
            username: document.getElementById('regUsername').value,
            password: document.getElementById('regPassword').value,
            role: document.getElementById('regRole').value
        };

        const result = campusData.registerUser(formData);
        if (result.success) {
            campusData.currentUser = result.user;
            this.showMainApp();
            alert('Account created successfully!');
        } else {
            alert(result.message);
        }
    }

    setupNavigation() {
        const sections = document.querySelectorAll('.section');
        const navLinks = document.querySelectorAll('.nav-link');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    this.updateActiveNav(sectionId);
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(section => observer.observe(section));
    }

    updateActiveNav(sectionId) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }

    showSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;

            switch (sectionId) {
                case 'dashboard':
                    this.loadDashboard();
                    break;
                case 'clubs':
                    this.loadClubs();
                    break;
                case 'analytics':
                    this.loadAnalytics();
                    break;
                case 'operations':
                    this.loadOperations();
                    break;
                case 'events':
                    this.loadEvents();
                    break;
            }
        }
    }

    loadDashboard() {
        this.updateStats();
        campusAnimations.createGalaxy();
    }

    loadClubs() {
        this.displayClubs();
        this.populateClubSelects();
    }

    loadAnalytics() {
        campusAnimations.animateHealthBars();
        this.displayAtRiskStudents();
        this.updateVennDiagram();
        this.createEngagementChart();
        this.createMembershipChart();
        this.displayEngagementStats();
    }

    loadOperations() {
        this.populateClubSelects();
    }

    filterClubs(query) {
        const clubs = document.querySelectorAll('.club-card');
        clubs.forEach(card => {
            const clubName = card.querySelector('.club-name').textContent.toLowerCase();
            const matches = clubName.includes(query.toLowerCase());
            card.style.display = matches ? 'block' : 'none';
        });
    }

    updateStats() {
        const totalStudents = campusData.students.length;
        const totalClubs = campusData.clubs.length;
        const multiClubMembers = campusData.students.filter(student => {
            const clubs = campusData.getStudentClubs(student.id);
            return clubs.length > 1;
        }).length;
        const participationRate = Math.round((campusData.students.filter(student => {
            const clubs = campusData.getStudentClubs(student.id);
            return clubs.length > 0;
        }).length / totalStudents) * 100);

        campusAnimations.animateCounter(document.getElementById('total-students'), totalStudents);
        campusAnimations.animateCounter(document.getElementById('total-clubs'), totalClubs);
        campusAnimations.animateCounter(document.getElementById('multi-club'), multiClubMembers);
        campusAnimations.animateCounter(document.getElementById('participation-rate'), participationRate);
    }

    displayClubs() {
        const grid = document.getElementById('clubs-grid');
        if (!grid) return;

        grid.innerHTML = '';
        const clubs = campusData.getFilteredClubsOptimized();
        
        if (clubs.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h3>No Clubs Found</h3>
                    <p>Try adjusting your search or filter criteria.</p>
                </div>
            `;
            return;
        }

        clubs.forEach(club => {
            const health = campusData.getClubHealth(club.id);
            const members = campusData.getClubMembers(club.id);

            const card = document.createElement('div');
            card.className = 'club-card';
            card.innerHTML = `
                <div class="club-header">
                    <h3 class="club-name">${club.name}</h3>
                    <span class="club-category" style="background: ${club.color}20; color: ${club.color}">${club.category}</span>
                </div>
                <div class="member-count">${members.length} members</div>
                <div class="health-bar">
                    <div class="health-fill" style="width: ${health.health}%; background: ${campusAnimations.getHealthColor(health.health)}"></div>
                </div>
                <div style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-secondary);">
                    Health Score: ${Math.round(health.health)}%
                </div>
            `;
            grid.appendChild(card);
        });
    }

    displayAtRiskStudents() {
        const riskStudents = campusData.getAtRiskStudents();
        const riskList = document.getElementById('risk-list');
        const riskCount = document.getElementById('risk-count');

        if (riskCount) riskCount.textContent = riskStudents.length;
        if (!riskList) return;

        riskList.innerHTML = '';
        riskStudents.forEach(student => {
            const clubs = campusData.getStudentClubs(student.id);
            const item = document.createElement('div');
            item.className = 'risk-item';
            item.innerHTML = `
                <div>
                    <strong>${student.name}</strong>
                    <div style="font-size: 0.9rem; color: var(--text-secondary);">
                        ${student.major} • ${student.year} • ${clubs.length} clubs
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="color: var(--danger); font-weight: 600;">${Math.round(student.engagement)}%</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">engagement</div>
                </div>
            `;
            riskList.appendChild(item);
        });
    }

    updateVennDiagram() {
        if (campusData.clubs.length >= 2) {
            campusAnimations.animateVennDiagram(campusData.clubs[0], campusData.clubs[1]);
        }
    }

    populateClubSelects() {
        const clubA = document.getElementById('club-a');
        const clubB = document.getElementById('club-b');

        if (clubA && clubB) {
            [clubA, clubB].forEach(select => {
                select.innerHTML = '<option value="">Select Club</option>';
                campusData.clubs.forEach(club => {
                    const option = document.createElement('option');
                    option.value = club.id;
                    option.textContent = club.name;
                    select.appendChild(option);
                });
            });
        }
    }

    // New enhanced methods
    setupNotificationSystem() {
        this.displayNotifications();
        // Check for new notifications every 5 seconds
        setInterval(() => {
            this.displayNotifications();
        }, 5000);
    }

    displayNotifications() {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notifications = campusData.getNotifications();
        container.innerHTML = '';

        notifications.forEach(notification => {
            const notificationEl = document.createElement('div');
            notificationEl.className = `notification ${notification.type}`;
            notificationEl.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>${notification.message}</span>
                    <button onclick="app.removeNotification(${notification.id})" style="background: none; border: none; color: var(--text); cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            container.appendChild(notificationEl);
        });
    }

    removeNotification(id) {
        campusData.removeNotification(id);
        this.displayNotifications();
    }

    handleSearch(query) {
        campusData.setFilter('search', query);
        this.displayClubs();
        this.updateFilterTags();
    }

    handleCategoryFilter(category) {
        campusData.setFilter('category', category);
        this.displayClubs();
        this.updateFilterTags();
    }

    updateFilterTags() {
        const container = document.getElementById('active-filters');
        if (!container) return;

        container.innerHTML = '';
        const filters = campusData.filters;

        if (filters.search) {
            this.addFilterTag('Search', filters.search, 'search');
        }
        if (filters.category) {
            this.addFilterTag('Category', filters.category, 'category');
        }
    }

    addFilterTag(label, value, key) {
        const container = document.getElementById('active-filters');
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.innerHTML = `
            <span>${label}: ${value}</span>
            <span class="remove" onclick="app.clearFilter('${key}')">×</span>
        `;
        container.appendChild(tag);
    }

    clearFilter(key) {
        campusData.setFilter(key, '');
        this.displayClubs();
        this.updateFilterTags();
        
        // Reset form elements
        if (key === 'search') {
            document.getElementById('club-search').value = '';
        } else if (key === 'category') {
            document.getElementById('category-filter').value = '';
        }
    }

    loadEvents() {
        this.displayEvents();
    }

    displayEvents() {
        const grid = document.getElementById('events-grid');
        if (!grid) return;

        const events = campusData.getUpcomingEvents();
        grid.innerHTML = '';

        if (events.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <h3>No Upcoming Events</h3>
                    <p>No events are scheduled at the moment.</p>
                </div>
            `;
            return;
        }

        events.forEach(event => {
            const club = campusData.clubs.find(c => c.id === event.clubId);
            const eventDate = new Date(event.date);
            
            const card = document.createElement('div');
            card.className = 'enhanced-card';
            card.innerHTML = `
                <div class="event-header">
                    <h3>${event.title}</h3>
                    <span class="event-type" style="background: ${club?.color}20; color: ${club?.color}">
                        ${event.type}
                    </span>
                </div>
                <p style="color: var(--text-secondary); margin: 0.5rem 0;">${event.description}</p>
                <div class="event-details">
                    <div><i class="fas fa-calendar"></i> ${eventDate.toLocaleDateString()}</div>
                    <div><i class="fas fa-clock"></i> ${event.time}</div>
                    <div><i class="fas fa-map-marker-alt"></i> ${event.location}</div>
                    <div><i class="fas fa-users"></i> ${event.attendees.length}/${event.maxAttendees} attendees</div>
                </div>
                <div class="event-actions">
                    <button class="btn-primary" onclick="app.joinEvent('${event.id}')">
                        <i class="fas fa-plus"></i> Join Event
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    joinEvent(eventId) {
        const event = campusData.events.find(e => e.id === eventId);
        if (event && event.attendees.length < event.maxAttendees) {
            if (!event.attendees.includes(campusData.currentUser.id)) {
                event.attendees.push(campusData.currentUser.id);
                campusData.saveToStorage();
                this.displayEvents();
                campusData.addNotification('Successfully joined the event!', 'success');
            } else {
                campusData.addNotification('You are already registered for this event.', 'warning');
            }
        } else {
            campusData.addNotification('Event is full or not found.', 'error');
        }
    }

    // Chart.js integration
    createEngagementChart() {
        const ctx = document.getElementById('engagement-chart');
        if (!ctx) return;

        const stats = campusData.getEngagementStats();
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['High Engagement', 'Medium Engagement', 'Low Engagement'],
                datasets: [{
                    data: [stats.high, stats.medium, stats.low],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'var(--text)',
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    createMembershipChart() {
        const ctx = document.getElementById('membership-chart');
        if (!ctx) return;

        const growthData = campusData.getClubGrowthTrend();
        const labels = Object.keys(growthData).sort();
        const data = labels.map(date => growthData[date]);

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'New Memberships',
                    data: data,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'var(--text-secondary)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'var(--text-secondary)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'var(--text)'
                        }
                    }
                }
            }
        });
    }

    displayEngagementStats() {
        const container = document.getElementById('engagement-stats');
        if (!container) return;

        const stats = campusData.getEngagementStats();
        container.innerHTML = `
            <div class="analytics-stats">
                <div class="analytics-stat">
                    <h3>${stats.total}</h3>
                    <p>Total Students</p>
                </div>
                <div class="analytics-stat">
                    <h3>${Math.round(stats.average)}%</h3>
                    <p>Average Engagement</p>
                </div>
                <div class="analytics-stat">
                    <h3>${stats.high}</h3>
                    <p>High Engagement</p>
                </div>
                <div class="analytics-stat">
                    <h3>${stats.medium}</h3>
                    <p>Medium Engagement</p>
                </div>
                <div class="analytics-stat">
                    <h3>${stats.low}</h3>
                    <p>Low Engagement</p>
                </div>
            </div>
        `;
    }
}

// Global functions
function showLogin() {
    app.showLoginModal();
}

function showRegister() {
    app.showRegisterModal();
}

function loginAsDemo() {
    const user = campusData.authenticateUser('admin', 'admin123');
    if (user) {
        app.showMainApp();
        campusAnimations.pulseElement('.stats-grid');
    }
}

function logout() {
    campusData.logout();
    app.showLoginModal();
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
}

function addDemoClub() {
    const newClub = campusData.addDemoClub();
    app.displayClubs();
    app.populateClubSelects();
    campusAnimations.pulseElement('.clubs-grid');
}

function performOperation() {
    const operationType = document.getElementById('operation-type').value;
    const clubAId = document.getElementById('club-a').value;
    const clubBId = document.getElementById('club-b').value;

    if (!clubAId || !clubBId) {
        alert('Please select both clubs');
        return;
    }

    const clubA = campusData.clubs.find(c => c.id === clubAId);
    const clubB = campusData.clubs.find(c => c.id === clubBId);

    let result = [];
    switch (operationType) {
        case 'intersection':
            result = campusData.intersection(clubAId, clubBId);
            break;
        case 'union':
            result = campusData.union(clubAId, clubBId);
            break;
        case 'difference':
            result = campusData.difference(clubAId, clubBId);
            break;
        case 'complement':
            result = campusData.complement([clubAId, clubBId]);
            break;
    }

    const resultCount = document.getElementById('result-count');
    const resultList = document.getElementById('operation-result-list');

    if (resultCount) resultCount.textContent = result.length;
    if (resultList) {
        resultList.innerHTML = '';
        result.forEach(student => {
            const item = document.createElement('div');
            item.className = 'risk-item';
            item.innerHTML = `
                <div>
                    <strong>${student.name}</strong>
                    <div style="font-size: 0.9rem; color: var(--text-secondary);">
                        ${student.major} • ${student.year}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="color: var(--primary); font-weight: 600;">${Math.round(student.engagement)}%</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">engagement</div>
                </div>
            `;
            resultList.appendChild(item);
        });
    }

    campusAnimations.animateSetOperation(operationType, clubA, clubB);
}

function refreshData() {
    campusData.generateDemoData();
    campusData.generateDemoEvents();
    app.loadDashboard();
    app.loadClubs();
    app.loadAnalytics();
    app.loadOperations();
    app.loadEvents();
    campusAnimations.pulseElement('.stats-grid');
    campusData.addNotification('Data refreshed successfully!', 'success');
}

function addEvent() {
    const eventData = {
        title: prompt('Event Title:') || 'New Event',
        description: prompt('Event Description:') || 'Join us for this exciting event!',
        clubId: campusData.clubs[0]?.id || 'c1',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        time: '6:00 PM',
        location: 'Main Hall',
        maxAttendees: 50,
        type: 'meeting'
    };
    
    campusData.addEvent(eventData);
    app.loadEvents();
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const themeIcon = document.querySelector('.theme-toggle i');
    if (themeIcon) {
        themeIcon.classList.toggle('fa-moon');
        themeIcon.classList.toggle('fa-sun');
    }
}

function exportData(format = 'json') {
    campusData.exportData(format);
    campusData.addNotification(`Data exported as ${format.toUpperCase()}`, 'success');
}

// Initialize the application
const app = new CampusNexusApp();