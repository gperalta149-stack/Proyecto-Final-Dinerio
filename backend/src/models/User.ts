export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    monthly_budget?: number;
    currency?: string;
    language?: string;
    notifications_enabled?: boolean;
    created_at: string;
    updated_at: string;
}

export interface UserSettings {
    currency: string;
    language: string;
    notifications_enabled: boolean;
}