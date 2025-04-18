import api from './api';
import axios from 'axios';

// Type definitions based on the contacts.json schema
export interface ContactSearchParams {
  locationId?: string;
  filters?: Array<{
    field: string;
    operator: string;
    value: string | number | boolean | null;
  }>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface Contact {
  id: string;
  locationId: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  // Add other contact fields as needed
}

export interface ContactSearchResponse {
  contacts: Contact[];
  pagination: {
    start: number;
    limit: number;
    total: number;
    nextPageUrl?: string;
    previousPageUrl?: string;
  };
}

// Dog owner information interface
export interface DogOwnerInfo {
  id: string; // Contact ID
  dogName: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  veterinarian?: string;
  vetPhone?: string;
  medications?: string[];
  feedingSchedule?: string;
  notes?: string;
  tags?: string[];
}

/**
 * Search contacts using advanced filters
 */
export const searchContacts = async (params: ContactSearchParams): Promise<ContactSearchResponse> => {
  try {
    const response = await api.post('/contacts/search', params);
    return response.data;
  } catch (error) {
    console.error('Error searching contacts:', error);
    throw error;
  }
};

/**
 * Search for duplicate contacts
 */
export const getDuplicateContact = async (
  locationId: string, 
  email?: string, 
  phone?: string
): Promise<Contact | null> => {
  try {
    const params: Record<string, string> = { locationId };
    if (email) params.email = email;
    if (phone) params.number = phone;
    
    const response = await api.get('/contacts/search/duplicate', { params });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null; // No duplicate found
    }
    console.error('Error checking for duplicate contact:', error);
    throw error;
  }
};

/**
 * Fetch dog owner information by searching for contact with the dog's name in a custom field
 * or by tag for specific dogs. This is to populate the dog whiteboard.
 */
export const fetchDogOwnerInfo = async (locationId: string): Promise<DogOwnerInfo[]> => {
  try {
    // Search for all contacts instead of filtering by tag
    const searchParams: ContactSearchParams = {
      locationId: locationId, // Using your GoHighLevel location ID
      limit: 50 // Get a reasonable number of dog owners
    };

    const response = await searchContacts(searchParams);
    
    // Transform contact data into dog owner information
    return response.contacts.map(contact => {
      // Extract dog name from custom field or tags - this will depend on your data structure
      // This is a simplified example - you would need to adapt to your actual data
      const dogTag = contact.tags?.find(tag => tag.startsWith('dog-')) || '';
      const dogName = dogTag.replace('dog-', '');
      
      return {
        id: contact.id,
        dogName: dogName || 'Unknown Dog',
        ownerName: contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
        ownerPhone: contact.phone || '',
        ownerEmail: contact.email,
        emergencyContact: '', // You would extract this from custom fields in the actual data
        emergencyPhone: '',
        veterinarian: '',
        vetPhone: '',
        medications: [],
        feedingSchedule: '',
        notes: '',
        tags: contact.tags
      };
    });
  } catch (error) {
    console.error('Error fetching dog owner information:', error);
    throw error;
  }
};

export default {
  searchContacts,
  getDuplicateContact,
  fetchDogOwnerInfo
}; 