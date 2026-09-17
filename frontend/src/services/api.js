const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

class ApiService {
  constructor() {
    this.baseUrl = API_BASE;
  }

  getToken() {
    return localStorage.getItem("safar_token");
  }

  getHeaders(includeAuth = true) {
    const headers = { "Content-Type": "application/json" };
    if (includeAuth) {
      const token = this.getToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.auth !== false),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error.message === "Token expired." || error.message === "Invalid token.") {
        localStorage.removeItem("safar_token");
        window.location.href = "/signin";
      }
      throw error;
    }
  }

  
 // Auth
async getMe() {
  return this.request("/auth/me");
}

async sendOTP(name, email, phone) {
  return this.request("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ name, email, phone }),
    auth: false,
  });
}

async verifyOTP(email, otp) {
  return this.request("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
    auth: false,
  });
}

getGoogleAuthUrl() {
  return `${this.baseUrl}/auth/google`;
}
 

  // Trips
  async submitTrip(tripData) {
    return this.request("/trips", {
      method: "POST",
      body: JSON.stringify(tripData),
      auth: false,
    });
  }

  async getMyTrips() {
    return this.request("/trips");
  }

  async getTripById(id) {
    return this.request(`/trips/${id}`);
  }

  // Bookings
  async createBooking(bookingData) {
    return this.request("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  }

  async getMyBookings() {
    return this.request("/bookings/my");
  }

  // User
  async getProfile() {
    return this.request("/users/profile");
  }

  async updateProfile(data) {
    return this.request("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Admin
  async adminLogin(email, password) {
    return this.request("/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      auth: false,
    });
  }

  async getAdminDashboard() {
    const token = localStorage.getItem("safar_admin_token");
    return fetch(`${this.baseUrl}/admin/dashboard`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  }

  async getAdminUsers(params = {}) {
    const token = localStorage.getItem("safar_admin_token");
    const qs = new URLSearchParams(params).toString();
    return fetch(`${this.baseUrl}/admin/users?${qs}`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  }

  async getAdminTrips(params = {}) {
    const token = localStorage.getItem("safar_admin_token");
    const qs = new URLSearchParams(params).toString();
    return fetch(`${this.baseUrl}/admin/trips?${qs}`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  }

  async updateTripStatus(tripId, status) {
    const token = localStorage.getItem("safar_admin_token");
    return fetch(`${this.baseUrl}/admin/trips/${tripId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    }).then((r) => r.json());
  }

  async getAdminBookings(params = {}) {
    const token = localStorage.getItem("safar_admin_token");
    const qs = new URLSearchParams(params).toString();
    return fetch(`${this.baseUrl}/admin/bookings?${qs}`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  }

  async toggleUserStatus(userId) {
    const token = localStorage.getItem("safar_admin_token");
    return fetch(`${this.baseUrl}/admin/users/${userId}/toggle`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  }
}

const api = new ApiService();
export default api;
