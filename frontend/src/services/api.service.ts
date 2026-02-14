const BASE_URL = 'http://localhost:8080/api';
const API_URL = `${BASE_URL}/auth`;
const OTP_URL = `${BASE_URL}/otp`;

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface UpdateUserData {
    name?: string;
    email?: string;
}

export interface OTPVerifyData {
    email: string;
    otp: string;
}

export interface OTPResendData {
    email: string;
}

export interface RegisterResponse {
    message: string;
    userId: string;
    email: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: 'user' | 'admin';
        walletBalance: number;
    };
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    walletBalance: number;
    frozenBalance: number;
    profilePhoto?: string;
    createdAt: string;
}

class ApiService {
    sendAutoPurchaseNotification: any;
    private getAuthHeaders(token?: string): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        const authToken = token || localStorage.getItem('authToken');
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        return headers;
    }

    // Register new user (CREATE) - Now returns RegisterResponse
    async register(data: RegisterData): Promise<RegisterResponse> {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Registration failed');
        }

        return result;
    }

    // Verify OTP
    async verifyOTP(data: OTPVerifyData): Promise<AuthResponse> {
        const response = await fetch(`${OTP_URL}/verify-otp`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'OTP verification failed');
        }

        return result;
    }

    // Resend OTP
    async resendOTP(data: OTPResendData): Promise<{ message: string }> {
        const response = await fetch(`${OTP_URL}/resend-otp`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to resend OTP');
        }

        return result;
    }

    // Login user
    async login(data: LoginData): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Login failed');
        }

        return result;
    }

    // Create order (backend API call)
    async createOrder(orderData: {
        items: any[];
        totalAmount: number;
        shippingAddress: any;
        paymentMethod: string;
    }, token: string): Promise<{
        order: any;
        newWalletBalance?: number;
        scratchCard?: {
            id: string;
            orderAmount: number;
            expiresAt: string;
        } | null;
    }> {
        const response = await fetch(`${BASE_URL}/orders`, {
            method: 'POST',
            headers: this.getAuthHeaders(token),
            body: JSON.stringify(orderData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Order creation failed');
        }

        return result;
    }

    // Get order history (READ)
    async getCurrentUser(token: string): Promise<{ user: User }> {
        const response = await fetch(`${API_URL}/me`, {
            headers: this.getAuthHeaders(token),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to get user');
        }

        return result;
    }

    // Get user by ID (READ)
    async getUserById(id: string, token: string): Promise<{ user: User }> {
        const response = await fetch(`${API_URL}/users/${id}`, {
            headers: this.getAuthHeaders(token),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to get user');
        }

        return result;
    }

    // Get all users (READ)
    async getAllUsers(token: string): Promise<{ users: User[]; total: number }> {
        const response = await fetch(`${API_URL}/users`, {
            headers: this.getAuthHeaders(token),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to get users');
        }

        return result;
    }

    // Update user (UPDATE)
    async updateUser(id: string, data: UpdateUserData, token: string): Promise<{ message: string; user: User }> {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(token),
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to update user');
        }

        return result;
    }

    // Delete user (DELETE)
    async deleteUser(id: string, token: string): Promise<{ message: string }> {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(token),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to delete user');
        }

        return result;
    }

    // Get login history
    async getLoginHistory(token: string): Promise<{ history: any[]; total: number }> {
        const response = await fetch(`${API_URL}/login-history`, {
            headers: this.getAuthHeaders(token),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to get login history');
        }

        return result;
    }

    // --- Wallet Methods ---

    async getWallet(token: string): Promise<{ balance: number; frozenBalance: number; transactions: any[] }> {
        const response = await fetch(`${BASE_URL}/wallet`, {
            headers: this.getAuthHeaders(token),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to get wallet');
        }

        return result;
    }

    async addFunds(amount: number, token: string): Promise<{ message: string; balance: number; transaction: any }> {
        const response = await fetch(`${BASE_URL}/wallet/add-funds`, {
            method: 'POST',
            headers: this.getAuthHeaders(token),
            body: JSON.stringify({ amount }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to add funds');
        }

        return result;
    }

    async transferFunds(recipientEmail: string, amount: number, token: string): Promise<{ message: string; balance: number; transaction: any }> {
        const response = await fetch(`${BASE_URL}/wallet/transfer`, {
            method: 'POST',
            headers: this.getAuthHeaders(token),
            body: JSON.stringify({ recipientEmail, amount }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Transfer failed');
        }

        return result;
    }

    // --- Admin Methods ---

    async getAllTransactions(token: string): Promise<{ transactions: any[]; total: number }> {
        const response = await fetch(`${BASE_URL}/admin/transactions`, {
            headers: this.getAuthHeaders(token),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to get transactions');
        }

        return result;
    }

    async getSystemStats(token: string): Promise<{ totalUsers: number; totalTransactions: number; totalFunds: number }> {
        const response = await fetch(`${BASE_URL}/admin/stats`, {
            headers: this.getAuthHeaders(token),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to get system stats');
        }

        return result;
    }

    // Upload profile photo
    async uploadProfilePhoto(profilePhoto: string, token: string): Promise<{ profilePhoto: string }> {
        const response = await fetch(`${BASE_URL}/user/profile-photo`, {
            method: 'POST',
            headers: this.getAuthHeaders(token),
            body: JSON.stringify({ profilePhoto }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to upload profile photo');
        }

        return result;
    }

    // Delete profile photo
    async deleteProfilePhoto(token: string): Promise<{ message: string }> {
        const response = await fetch(`${BASE_URL}/user/profile-photo`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(token),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to delete profile photo');
        }

        return result;
    }
    // --- Season Methods ---
    async getSeasons(token: string): Promise<any[]> {
        const response = await fetch(`${BASE_URL}/seasons`, {
            headers: this.getAuthHeaders(token),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to fetch seasons');
        return result;
    }

    async createSeason(data: any, token: string): Promise<any> {
        const response = await fetch(`${BASE_URL}/seasons`, {
            method: 'POST',
            headers: this.getAuthHeaders(token),
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to create season');
        return result;
    }

    async toggleSeason(id: string, token: string): Promise<any> {
        const response = await fetch(`${BASE_URL}/seasons/${id}/toggle`, {
            method: 'PATCH',
            headers: this.getAuthHeaders(token),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to toggle season');
        return result;
    }

    async deleteSeason(id: string, token: string): Promise<any> {
        const response = await fetch(`${BASE_URL}/seasons/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(token),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to delete season');
        return result;
    }

    async updateSeason(id: string, data: any, token: string): Promise<any> {
        const response = await fetch(`${BASE_URL}/seasons/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(token),
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to update season');
        return result;
    }


    // --- Festival Methods ---
    async getFestivals(token: string): Promise<any[]> {
        const response = await fetch(`${BASE_URL}/festivals`, {
            headers: this.getAuthHeaders(token),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to fetch festivals');
        return result;
    }

    async createFestival(data: any, token: string): Promise<any> {
        const response = await fetch(`${BASE_URL}/festivals`, {
            method: 'POST',
            headers: this.getAuthHeaders(token),
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to create festival');
        return result;
    }

    async toggleFestival(id: string, token: string): Promise<any> {
        const response = await fetch(`${BASE_URL}/festivals/${id}/toggle`, {
            method: 'PATCH',
            headers: this.getAuthHeaders(token),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to toggle festival');
        return result;
    }

    async deleteFestival(id: string, token: string): Promise<any> {
        const response = await fetch(`${BASE_URL}/festivals/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(token),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to delete festival');
        return result;
    }

    async updateFestival(id: string, data: any, token: string): Promise<any> {
        const response = await fetch(`${BASE_URL}/festivals/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(token),
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to update festival');
        return result;
    }

    // --- Public Season/Festival Methods (no auth) ---
    async getActiveSeasons(): Promise<any[]> {
        const response = await fetch(`${BASE_URL}/seasons/active`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to fetch active seasons');
        return result;
    }

    async getActiveFestivals(): Promise<any[]> {
        const response = await fetch(`${BASE_URL}/festivals/active`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to fetch active festivals');
        return result;
    }

    async getProductsBySeason(seasonName: string): Promise<any> {
        const response = await fetch(`${BASE_URL}/products/season/${encodeURIComponent(seasonName)}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to fetch season products');
        return result;
    }

    async getProductsByFestival(festivalName: string): Promise<any> {
        const response = await fetch(`${BASE_URL}/products/festival/${encodeURIComponent(festivalName)}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to fetch festival products');
        return result;
    }
    // --- Auto Purchase Methods ---
    async getAutoPurchases(token: string): Promise<any[]> {
        const response = await fetch(`${BASE_URL}/auto-purchase`, {
            headers: this.getAuthHeaders(token),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to fetch auto-purchases');
        return result;
    }

    async addAutoPurchase(data: any, token: string): Promise<any> {
        const response = await fetch(`${BASE_URL}/auto-purchase`, {
            method: 'POST',
            headers: this.getAuthHeaders(token),
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to add auto-purchase');
        return result;
    }

    async removeAutoPurchase(id: string, token: string): Promise<any> {
        const response = await fetch(`${BASE_URL}/auto-purchase/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(token),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to remove auto-purchase');
        return result;
    }

    async updateTargetPrice(id: string, targetPrice: number, token: string): Promise<any> {
        const response = await fetch(`${BASE_URL}/auto-purchase/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(token),
            body: JSON.stringify({ targetPrice }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to update target price');
        return result;
    }

    async getAutoPurchaseHistory(token: string): Promise<any[]> {
        const response = await fetch(`${BASE_URL}/auto-purchase/history`, {
            headers: this.getAuthHeaders(token),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to fetch history');
        return result;
    }

    async getPriceChangeLogs(): Promise<any[]> {
        const response = await fetch(`${BASE_URL}/auto-purchase/price-logs`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to fetch price logs');
        return result;
    }
}

export const apiService = new ApiService();
export default apiService;
