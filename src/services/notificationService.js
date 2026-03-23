import axios from 'axios';

const API_BASE = 'https://b10a11-server-side-noorjahan220.vercel.app';

/**
 * Notification Service
 * Handles email notification preferences and triggers
 * Note: Actual email sending is done on the server side
 */

// Get user notification preferences
export const getNotificationPreferences = async (userEmail) => {
    try {
        const response = await axios.get(`${API_BASE}/notifications/preferences/${userEmail}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching notification preferences:', error);
        // Return default preferences if not found
        return {
            emailOnMatch: true,
            emailOnRecovery: true,
            emailOnVerification: true,
            emailWeeklyDigest: false
        };
    }
};

// Update user notification preferences
export const updateNotificationPreferences = async (userEmail, preferences) => {
    try {
        const response = await axios.put(
            `${API_BASE}/notifications/preferences/${userEmail}`,
            preferences,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating notification preferences:', error);
        throw error;
    }
};

// Trigger notification for item match (when someone claims an item)
export const notifyItemMatch = async (itemId, claimerEmail, ownerEmail) => {
    try {
        const response = await axios.post(
            `${API_BASE}/notifications/item-match`,
            { itemId, claimerEmail, ownerEmail },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error sending match notification:', error);
        throw error;
    }
};

// Trigger notification for item recovery
export const notifyItemRecovery = async (itemId, recoveredByEmail) => {
    try {
        const response = await axios.post(
            `${API_BASE}/notifications/item-recovery`,
            { itemId, recoveredByEmail },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error sending recovery notification:', error);
        throw error;
    }
};

// Trigger notification for item verification status change
export const notifyVerificationStatus = async (itemId, status, ownerEmail) => {
    try {
        const response = await axios.post(
            `${API_BASE}/notifications/verification-status`,
            { itemId, status, ownerEmail },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error sending verification notification:', error);
        throw error;
    }
};

export default {
    getNotificationPreferences,
    updateNotificationPreferences,
    notifyItemMatch,
    notifyItemRecovery,
    notifyVerificationStatus
};
