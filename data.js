// Demo data generator
class CampusNexusData {
    constructor() {
        this.students = [];
        this.clubs = [];
        this.memberships = [];
        this.users = [];
        this.events = [];
        this.notifications = [];
        this.currentUser = null;
        this.filters = {
            search: '',
            category: '',
            year: '',
            engagement: ''
        };
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.init();
    }

    init() {
        this.loadFromStorage();
        if (this.students.length === 0) {
            this.generateDemoData();
        }
        if (this.users.length === 0) {
            this.generateDemoUsers();
        }
        if (this.events.length === 0) {
            this.generateDemoEvents();
        }
    }

    generateDemoData() {
        // Generate students
        const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Peyton', 'Dakota'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
        const majors = ['Computer Science', 'Biology', 'Business', 'Psychology', 'Engineering', 'Mathematics', 'Physics', 'Chemistry'];
        const years = ['Freshman', 'Sophomore', 'Junior', 'Senior'];

        this.students = Array.from({
            length: 50
        }, (_, i) => ({
            id: `s${i + 1}`,
            name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
            email: `student${i + 1}@university.edu`,
            major: majors[i % majors.length],
            year: years[i % years.length],
            engagement: Math.random() * 100
        }));

        // Generate clubs
        this.clubs = [{
                id: 'c1',
                name: 'Computer Science Club',
                category: 'academic',
                color: '#6366f1'
            },
            {
                id: 'c2',
                name: 'Basketball Team',
                category: 'sports',
                color: '#10b981'
            },
            {
                id: 'c3',
                name: 'Debate Society',
                category: 'academic',
                color: '#8b5cf6'
            },
            {
                id: 'c4',
                name: 'Art Club',
                category: 'arts',
                color: '#f59e0b'
            },
            {
                id: 'c5',
                name: 'Volunteer Corps',
                category: 'service',
                color: '#ef4444'
            },
            {
                id: 'c6',
                name: 'Music Society',
                category: 'arts',
                color: '#06b6d4'
            }
        ];

        // Generate memberships with realistic distribution
        this.memberships = [];
        this.students.forEach(student => {
            const numClubs = Math.floor(Math.random() * 4) + 1; // 1-4 clubs per student
            const clubIndices = this.getRandomIndices(this.clubs.length, numClubs);

            clubIndices.forEach(clubIndex => {
                this.memberships.push({
                    studentId: student.id,
                    clubId: this.clubs[clubIndex].id,
                    role: Math.random() > 0.9 ? 'officer' : 'member',
                    joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
                });
            });
        });

        this.saveToStorage();
    }

    generateDemoUsers() {
        this.users = [{
                id: 'u1',
                username: 'admin',
                email: 'admin@campus.edu',
                password: 'admin123',
                name: 'System Administrator',
                role: 'admin',
                createdAt: new Date()
            },
            {
                id: 'u2',
                username: 'student1',
                email: 'student1@campus.edu',
                password: 'student123',
                name: 'Alex Johnson',
                role: 'student',
                createdAt: new Date()
            },
            {
                id: 'u3',
                username: 'leader1',
                email: 'leader1@campus.edu',
                password: 'leader123',
                name: 'Taylor Smith',
                role: 'club_leader',
                createdAt: new Date()
            }
        ];
        this.saveToStorage();
    }

    generateDemoEvents() {
        const eventTypes = ['Meeting', 'Workshop', 'Social', 'Competition', 'Seminar', 'Fundraiser'];
        const locations = ['Main Hall', 'Library', 'Gymnasium', 'Auditorium', 'Cafeteria', 'Outdoor Field'];
        
        this.events = [];
        this.clubs.forEach((club, index) => {
            const numEvents = Math.floor(Math.random() * 3) + 1; // 1-3 events per club
            for (let i = 0; i < numEvents; i++) {
                const eventDate = new Date();
                eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 30) + 1);
                
                this.events.push({
                    id: `e${this.events.length + 1}`,
                    title: `${eventTypes[Math.floor(Math.random() * eventTypes.length)]} - ${club.name}`,
                    description: `Join us for an exciting ${eventTypes[Math.floor(Math.random() * eventTypes.length)].toLowerCase()} event!`,
                    clubId: club.id,
                    date: eventDate,
                    time: `${Math.floor(Math.random() * 12) + 1}:${Math.random() > 0.5 ? '00' : '30'} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
                    location: locations[Math.floor(Math.random() * locations.length)],
                    maxAttendees: Math.floor(Math.random() * 50) + 20,
                    attendees: [],
                    type: eventTypes[Math.floor(Math.random() * eventTypes.length)].toLowerCase(),
                    status: 'upcoming'
                });
            }
        });
        this.saveToStorage();
    }

    getRandomIndices(max, count) {
        const indices = new Set();
        while (indices.size < count) {
            indices.add(Math.floor(Math.random() * max));
        }
        return Array.from(indices);
    }

    // Set operations
    intersection(clubA, clubB) {
        const clubAMembers = this.getClubMembers(clubA);
        const clubBMembers = this.getClubMembers(clubB);
        return clubAMembers.filter(student =>
            clubBMembers.some(s => s.id === student.id)
        );
    }

    union(clubA, clubB) {
        const clubAMembers = this.getClubMembers(clubA);
        const clubBMembers = this.getClubMembers(clubB);
        const allMembers = [...clubAMembers, ...clubBMembers];
        return this.removeDuplicates(allMembers);
    }

    difference(clubA, clubB) {
        const clubAMembers = this.getClubMembers(clubA);
        const clubBMembers = this.getClubMembers(clubB);
        return clubAMembers.filter(student =>
            !clubBMembers.some(s => s.id === student.id)
        );
    }

    complement(clubIds) {
        if (clubIds.length === 0) {
            // Students not in any club
            const allClubMembers = new Set();
            this.memberships.forEach(m => allClubMembers.add(m.studentId));
            return this.students.filter(student => !allClubMembers.has(student.id));
        }

        const excludedMembers = new Set();
        clubIds.forEach(clubId => {
            this.getClubMembers(clubId).forEach(student => excludedMembers.add(student.id));
        });

        return this.students.filter(student => !excludedMembers.has(student.id));
    }

    getClubMembers(clubId) {
        const memberIds = this.memberships
            .filter(m => m.clubId === clubId)
            .map(m => m.studentId);

        return this.students.filter(student => memberIds.includes(student.id));
    }

    getStudentClubs(studentId) {
        return this.memberships
            .filter(m => m.studentId === studentId)
            .map(m => this.clubs.find(c => c.id === m.clubId));
    }

    getClubHealth(clubId) {
        const members = this.getClubMembers(clubId);
        const totalStudents = this.students.length;
        const engagement = members.reduce((sum, student) => sum + student.engagement, 0) / members.length;

        return {
            memberCount: members.length,
            engagement: engagement,
            health: Math.min((members.length / 20) * 40 + (engagement / 100) * 60, 100) // Weighted score
        };
    }

    getAtRiskStudents(threshold = 30) {
        return this.students.filter(student => {
            const clubs = this.getStudentClubs(student.id);
            return clubs.length === 0 || student.engagement < threshold;
        });
    }

    removeDuplicates(array) {
        const seen = new Set();
        return array.filter(item => {
            const duplicate = seen.has(item.id);
            seen.add(item.id);
            return !duplicate;
        });
    }

    // Authentication methods with validation
    authenticateUser(username, password) {
        try {
            if (!username || !password) {
                throw new Error('Username and password are required');
            }

            const user = this.users.find(u =>
                (u.username === username || u.email === username) && u.password === password
            );
            
            if (user) {
                this.currentUser = user;
                this.saveToStorage();
                this.addNotification('Login successful!', 'success');
                return user;
            }
            
            this.addNotification('Invalid credentials', 'error');
            return null;
        } catch (error) {
            this.addNotification(error.message, 'error');
            return null;
        }
    }

    registerUser(userData) {
        try {
            // Validation
            const requiredFields = ['name', 'email', 'username', 'password', 'role'];
            for (const field of requiredFields) {
                if (!userData[field]) {
                    throw new Error(`${field} is required`);
                }
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email)) {
                throw new Error('Invalid email format');
            }

            // Password strength
            if (userData.password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            const existingUser = this.users.find(u =>
                u.username === userData.username || u.email === userData.email
            );

            if (existingUser) {
                throw new Error('Username or email already exists');
            }

            const newUser = {
                id: `u${this.users.length + 1}`,
                ...userData,
                createdAt: new Date()
            };

            this.users.push(newUser);
            this.saveToStorage();
            this.addNotification('Account created successfully!', 'success');
            
            return {
                success: true,
                user: newUser
            };
        } catch (error) {
            this.addNotification(error.message, 'error');
            return {
                success: false,
                message: error.message
            };
        }
    }

    logout() {
        this.currentUser = null;
        this.saveToStorage();
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // Storage methods
    saveToStorage() {
        localStorage.setItem('campusNexusData', JSON.stringify({
            students: this.students,
            clubs: this.clubs,
            memberships: this.memberships,
            users: this.users,
            events: this.events,
            notifications: this.notifications,
            filters: this.filters,
            currentUser: this.currentUser
        }));
    }

    loadFromStorage() {
        const data = localStorage.getItem('campusNexusData');
        if (data) {
            const parsed = JSON.parse(data);
            this.students = parsed.students || [];
            this.clubs = parsed.clubs || [];
            this.memberships = parsed.memberships || [];
            this.users = parsed.users || [];
            this.events = parsed.events || [];
            this.notifications = parsed.notifications || [];
            this.filters = parsed.filters || { search: '', category: '', year: '', engagement: '' };
            this.currentUser = parsed.currentUser || null;
        }
    }

    addDemoClub() {
        const newClub = {
            id: `c${this.clubs.length + 1}`,
            name: `New Club ${this.clubs.length + 1}`,
            category: ['academic', 'sports', 'arts', 'service'][Math.floor(Math.random() * 4)],
            color: `#${Math.floor(Math.random()*16777215).toString(16)}`
        };
        this.clubs.push(newClub);
        this.saveToStorage();
        return newClub;
    }

    // Event management
    addEvent(eventData) {
        const newEvent = {
            id: `e${this.events.length + 1}`,
            ...eventData,
            attendees: [],
            status: 'upcoming',
            createdAt: new Date()
        };
        this.events.push(newEvent);
        this.saveToStorage();
        this.addNotification('Event created successfully!', 'success');
        return newEvent;
    }

    getEventsByClub(clubId) {
        return this.events.filter(event => event.clubId === clubId);
    }

    getUpcomingEvents() {
        const now = new Date();
        return this.events.filter(event => event.date > now).sort((a, b) => a.date - b.date);
    }

    // Notification system
    addNotification(message, type = 'info', duration = 5000) {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date(),
            duration
        };
        this.notifications.push(notification);
        this.saveToStorage();
        
        // Auto-remove notification after duration
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, duration);
        
        return notification;
    }

    removeNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.saveToStorage();
    }

    getNotifications() {
        return this.notifications;
    }

    // Enhanced filtering
    setFilter(key, value) {
        this.filters[key] = value;
        this.saveToStorage();
    }

    getFilteredClubs() {
        return this.clubs.filter(club => {
            const matchesSearch = !this.filters.search || 
                club.name.toLowerCase().includes(this.filters.search.toLowerCase());
            const matchesCategory = !this.filters.category || 
                club.category === this.filters.category;
            return matchesSearch && matchesCategory;
        });
    }

    getFilteredStudents() {
        return this.students.filter(student => {
            const matchesSearch = !this.filters.search || 
                student.name.toLowerCase().includes(this.filters.search.toLowerCase()) ||
                student.major.toLowerCase().includes(this.filters.search.toLowerCase());
            const matchesYear = !this.filters.year || student.year === this.filters.year;
            const matchesEngagement = !this.filters.engagement || 
                (this.filters.engagement === 'high' && student.engagement > 70) ||
                (this.filters.engagement === 'medium' && student.engagement >= 40 && student.engagement <= 70) ||
                (this.filters.engagement === 'low' && student.engagement < 40);
            return matchesSearch && matchesYear && matchesEngagement;
        });
    }

    // Data export
    exportData(format = 'json') {
        const data = {
            students: this.students,
            clubs: this.clubs,
            memberships: this.memberships,
            events: this.events,
            exportDate: new Date().toISOString()
        };

        if (format === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `campus-nexus-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } else if (format === 'csv') {
            this.exportToCSV(data);
        }
    }

    exportToCSV(data) {
        const csvContent = this.convertToCSV(data.students);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        
        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header];
                return typeof value === 'string' ? `"${value}"` : value;
            });
            csvRows.push(values.join(','));
        }
        
        return csvRows.join('\n');
    }

    // Analytics enhancements
    getEngagementStats() {
        const totalStudents = this.students.length;
        const highEngagement = this.students.filter(s => s.engagement > 70).length;
        const mediumEngagement = this.students.filter(s => s.engagement >= 40 && s.engagement <= 70).length;
        const lowEngagement = this.students.filter(s => s.engagement < 40).length;

        return {
            total: totalStudents,
            high: highEngagement,
            medium: mediumEngagement,
            low: lowEngagement,
            average: this.students.reduce((sum, s) => sum + s.engagement, 0) / totalStudents
        };
    }

    getClubGrowthTrend() {
        const now = new Date();
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        return this.memberships
            .filter(m => new Date(m.joinDate) >= last30Days)
            .reduce((acc, membership) => {
                const date = new Date(membership.joinDate).toISOString().split('T')[0];
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {});
    }

    // Performance optimizations
    getCachedData(key, computeFunction) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        const data = computeFunction();
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
        return data;
    }

    clearCache() {
        this.cache.clear();
    }

    // Debounced search
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Lazy loading for large datasets
    getPaginatedStudents(page = 1, pageSize = 20) {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return {
            data: this.students.slice(start, end),
            total: this.students.length,
            page,
            pageSize,
            totalPages: Math.ceil(this.students.length / pageSize)
        };
    }

    // Optimized filtering with caching
    getFilteredClubsOptimized() {
        const cacheKey = `clubs_${JSON.stringify(this.filters)}`;
        return this.getCachedData(cacheKey, () => {
            return this.clubs.filter(club => {
                const matchesSearch = !this.filters.search || 
                    club.name.toLowerCase().includes(this.filters.search.toLowerCase());
                const matchesCategory = !this.filters.category || 
                    club.category === this.filters.category;
                return matchesSearch && matchesCategory;
            });
        });
    }

    // Data validation
    validateStudent(student) {
        const errors = [];
        if (!student.name || student.name.trim().length === 0) {
            errors.push('Name is required');
        }
        if (!student.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
            errors.push('Valid email is required');
        }
        if (student.engagement < 0 || student.engagement > 100) {
            errors.push('Engagement must be between 0 and 100');
        }
        return errors;
    }

    validateClub(club) {
        const errors = [];
        if (!club.name || club.name.trim().length === 0) {
            errors.push('Club name is required');
        }
        if (!club.category || !['academic', 'sports', 'arts', 'service'].includes(club.category)) {
            errors.push('Valid category is required');
        }
        return errors;
    }

    // Error handling wrapper
    safeExecute(operation, errorMessage = 'An error occurred') {
        try {
            return operation();
        } catch (error) {
            console.error(errorMessage, error);
            this.addNotification(errorMessage, 'error');
            return null;
        }
    }

    // Memory management
    cleanup() {
        // Remove old notifications
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        this.notifications = this.notifications.filter(n => n.timestamp > oneDayAgo);
        
        // Clear old cache entries
        for (const [key, value] of this.cache.entries()) {
            if (Date.now() - value.timestamp > this.cacheTimeout) {
                this.cache.delete(key);
            }
        }
        
        this.saveToStorage();
    }
}

// Global instance
const campusData = new CampusNexusData();