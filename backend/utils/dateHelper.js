// Date helper utilities

// Format date to ISO string
function toISOString(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString();
}

// Format date to readable string
function formatDate(date, format = 'YYYY-MM-DD') {
    if (!date) return 'N/A';
    const d = new Date(date);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

// Get time ago string
function timeAgo(date) {
    if (!date) return 'N/A';
    const now = new Date();
    const past = new Date(date);
    const diff = now - past;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (years > 0) return `${years}y ago`;
    if (months > 0) return `${months}mo ago`;
    if (weeks > 0) return `${weeks}w ago`;
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
}

// Get age from date of birth
function getAge(dateOfBirth) {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

// Check if date is today
function isToday(date) {
    if (!date) return false;
    const today = new Date();
    const d = new Date(date);
    return d.getFullYear() === today.getFullYear() &&
           d.getMonth() === today.getMonth() &&
           d.getDate() === today.getDate();
}

// Check if date is in the past
function isPast(date) {
    if (!date) return false;
    return new Date(date) < new Date();
}

// Check if date is in the future
function isFuture(date) {
    if (!date) return false;
    return new Date(date) > new Date();
}

// Add days to date
function addDays(date, days) {
    if (!date) return null;
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

// Subtract days from date
function subtractDays(date, days) {
    if (!date) return null;
    return addDays(date, -days);
}

// Get start of day
function startOfDay(date) {
    if (!date) return null;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

// Get end of day
function endOfDay(date) {
    if (!date) return null;
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}

// Get start of week (Monday)
function startOfWeek(date) {
    if (!date) return null;
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

// Get end of week (Sunday)
function endOfWeek(date) {
    if (!date) return null;
    const d = startOfWeek(date);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
}

// Get start of month
function startOfMonth(date) {
    if (!date) return null;
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}

// Get end of month
function endOfMonth(date) {
    if (!date) return null;
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    d.setHours(23, 59, 59, 999);
    return d;
}

// Get days between two dates
function daysBetween(date1, date2) {
    if (!date1 || !date2) return null;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diff = Math.abs(d2 - d1);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Get business days between two dates (excluding weekends)
function businessDaysBetween(date1, date2) {
    if (!date1 || !date2) return null;
    let d1 = new Date(date1);
    let d2 = new Date(date2);
    if (d1 > d2) {
        [d1, d2] = [d2, d1];
    }
    let days = 0;
    while (d1 <= d2) {
        const day = d1.getDay();
        if (day !== 0 && day !== 6) {
            days++;
        }
        d1.setDate(d1.getDate() + 1);
    }
    return days;
}

// Parse date string safely
function parseDate(dateString) {
    if (!dateString) return null;
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? null : d;
}

// Get current timestamp
function getCurrentTimestamp() {
    return new Date().toISOString();
}

// Get date range for query
function getDateRange(startDate, endDate) {
    const start = startDate ? startOfDay(startDate) : null;
    const end = endDate ? endOfDay(endDate) : null;
    return { start, end };
}

// Validate date range
function isValidDateRange(startDate, endDate) {
    if (!startDate || !endDate) return false;
    return new Date(startDate) <= new Date(endDate);
}

module.exports = {
    toISOString,
    formatDate,
    timeAgo,
    getAge,
    isToday,
    isPast,
    isFuture,
    addDays,
    subtractDays,
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    daysBetween,
    businessDaysBetween,
    parseDate,
    getCurrentTimestamp,
    getDateRange,
    isValidDateRange
};