// public/js/api.js
class SafeTrackAPI {
    constructor() {
        this.baseURL = 'http://localhost:5001/api';
        this.token = localStorage.getItem('safetrack_token');
    }

    // Set auth token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('safetrack_token', token);
        } else {
            localStorage.removeItem('safetrack_token');
        }
    }

    // Get headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    // Handle response
    async handleResponse(response) {
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        return data;
    }

    // ===== AUTH ENDPOINTS =====
    async register(userData) {
        const response = await fetch(`${this.baseURL}/auth/register`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(userData)
        });
        const data = await this.handleResponse(response);
        if (data.data?.token) {
            this.setToken(data.data.token);
        }
        return data;
    }

    async login(credentials) {
        const response = await fetch(`${this.baseURL}/auth/login`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(credentials)
        });
        const data = await this.handleResponse(response);
        if (data.data?.token) {
            this.setToken(data.data.token);
        }
        return data;
    }

    async logout() {
        this.setToken(null);
        localStorage.removeItem('safetrack_user');
    }

    async getCurrentUser() {
        const response = await fetch(`${this.baseURL}/auth/me`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async verifyEmail(token) {
        const response = await fetch(`${this.baseURL}/auth/verify-email`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ token })
        });
        return this.handleResponse(response);
    }

    async forgotPassword(email) {
        const response = await fetch(`${this.baseURL}/auth/forgot-password`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ email })
        });
        return this.handleResponse(response);
    }

    async resetPassword(token, newPassword) {
        const response = await fetch(`${this.baseURL}/auth/reset-password`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ token, newPassword })
        });
        return this.handleResponse(response);
    }

    // ===== ELDERLY ENDPOINTS =====
    async getElderly(page = 1, limit = 10) {
        const response = await fetch(`${this.baseURL}/elderly?page=${page}&limit=${limit}`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async getElderlyById(id) {
        const response = await fetch(`${this.baseURL}/elderly/${id}`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async createElderly(data) {
        const response = await fetch(`${this.baseURL}/elderly`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async updateElderly(id, data) {
        const response = await fetch(`${this.baseURL}/elderly/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async deleteElderly(id) {
        const response = await fetch(`${this.baseURL}/elderly/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    // ===== SIGHTING ENDPOINTS =====
    async getSightings(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${this.baseURL}/sightings?${query}`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async createSighting(data) {
        const response = await fetch(`${this.baseURL}/sightings`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async confirmSighting(id) {
        const response = await fetch(`${this.baseURL}/sightings/${id}/confirm`, {
            method: 'PUT',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    // ===== REPORT ENDPOINTS =====
    async getReports(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${this.baseURL}/reports?${query}`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async createReport(data) {
        const response = await fetch(`${this.baseURL}/reports`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async markAsFound(id) {
        const response = await fetch(`${this.baseURL}/reports/${id}/found`, {
            method: 'PUT',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    // ===== ADMIN ENDPOINTS =====
    async getUsers(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${this.baseURL}/admin/users?${query}`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    async updateUserRole(id, role) {
        const response = await fetch(`${this.baseURL}/admin/users/${id}/role`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({ role })
        });
        return this.handleResponse(response);
    }

    async getAnalytics() {
        const response = await fetch(`${this.baseURL}/admin/analytics`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }
}

// Initialize API
const api = new SafeTrackAPI();

// Export for use in pages
window.api = api;