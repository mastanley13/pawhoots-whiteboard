import axios from 'axios';

// Create axios instance for GoHighLevel API
const api = axios.create({
  baseURL: 'https://services.leadconnectorhq.com',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_GOHIGHLEVEL_PRIVATE_INTEGRATION_KEY}`,
    'Version': '2021-07-28'
  }
});

// Interface for GoHighLevel contact
export interface GHLContact {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  customFields?: Array<{
    id: string;
    value: string;
  }>;
  pets?: Array<{
    name: string;
    breed: string;
    traits?: string[];
    color?: string;
    medications?: string[];
    feedingSchedule?: string;
    notes?: string;
  }>;
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  dateOfBirth?: string;
  companyName?: string;
  locationId?: string;
  contactType?: string;
  source?: string;
}

// Utility to map GHL contact to Dog type for the whiteboard
export const mapContactToDog = (contact: GHLContact) => {
  // Find dog-related custom fields
  const getDogCustomField = (fieldName: string) => {
    return contact.customFields?.find(field => field.id === fieldName)?.value || '';
  };

  // Default dog trait mapping - can be expanded based on custom fields
  const mapTraits = () => {
    const traits = [];
    
    if (getDogCustomField('dog_jumper') === 'true') traits.push('jumper');
    if (getDogCustomField('dog_vocal') === 'true') traits.push('vocal');
    if (getDogCustomField('dog_protective') === 'true') traits.push('protective');
    if (getDogCustomField('dog_friendly') === 'true') traits.push('friendly');
    if (getDogCustomField('dog_energetic') === 'true') traits.push('high-energy');
    if (getDogCustomField('dog_calm') === 'true') traits.push('calm');
    
    return traits;
  };

  // Get first pet or create default
  const pet = contact.pets?.[0] || { name: contact.firstName || 'Unknown Dog', breed: getDogCustomField('dog_breed') || 'Mixed Breed' };

  return {
    id: contact.id,
    name: pet.name,
    breed: pet.breed || getDogCustomField('dog_breed') || 'Mixed Breed',
    location: { area: null, position: null },
    color: getDogCustomField('dog_color') || 'green',
    traits: mapTraits(),
    lastUpdated: new Date(),
    assignedStaff: null,
    locationHistory: [],
    scheduledMoves: [],
    owner: `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
    ownerPhone: contact.phone,
    emergencyContact: getDogCustomField('emergency_contact_name'),
    emergencyPhone: getDogCustomField('emergency_contact_phone'),
    veterinarian: getDogCustomField('veterinarian_name'),
    vetPhone: getDogCustomField('veterinarian_phone'),
    medications: getDogCustomField('medications') ? [getDogCustomField('medications')] : [],
    feedingSchedule: getDogCustomField('feeding_schedule'),
    notes: getDogCustomField('notes') || pet.notes || ''
  };
};

// Search contacts in GoHighLevel
export const searchContacts = async (query: string = '', locationId?: string) => {
  try {
    const response = await api.post('/contacts/search', {
      query: query,
      locationId: locationId || import.meta.env.VITE_GOHIGHLEVEL_LOCATION_ID,
      limit: 20
    });
    return response.data.contacts || [];
  } catch (error) {
    console.error('Error searching contacts:', error);
    throw error;
  }
};

// Get contact by ID
export const getContactById = async (contactId: string) => {
  try {
    const response = await api.get(`/contacts/${contactId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting contact:', error);
    throw error;
  }
};

// Get all contacts with the 'dog-owner' tag
export const getDogOwners = async (locationId?: string) => {
  try {
    const response = await api.post('/contacts/search', {
      locationId: locationId || import.meta.env.VITE_GOHIGHLEVEL_LOCATION_ID,
      limit: 50
    });
    return response.data.contacts || [];
  } catch (error) {
    console.error('Error getting dog owners:', error);
    throw error;
  }
};

// Search Custom Object Records (e.g., Pets)
export const searchCustomObjectRecords = async (
  objectKey: string, // e.g., "custom_objects.pets"
  locationId: string | undefined,
  filters?: Array<any>, // Accept optional filters array
  limit: number = 10
) => {
  try {
    const requestBody: Record<string, any> = {
        locationId: locationId || import.meta.env.VITE_GHL_LOCATION_ID,
        page: 1,
        pageLimit: limit,
    };

    if (filters && filters.length > 0) {
        requestBody.filters = filters; // Add filters if provided
    }

    console.log("Sending Search Request Body:", JSON.stringify(requestBody, null, 2)); // Log the full request body

    const response = await api.post(`/objects/${objectKey}/records/search`, requestBody);
    // Assuming the API returns records in a 'records' or 'customObjectRecords' property based on new docs
    return response.data.records || response.data.customObjectRecords || [];
  } catch (error) {
    console.error(`Error searching custom object records for ${objectKey}:`, error);
    throw error;
  }
};

export default api; 