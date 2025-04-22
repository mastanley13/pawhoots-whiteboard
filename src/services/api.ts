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

// Get pet owner associations by pet ID
export const getPetOwnerAssociations = async (petId: string, locationId?: string) => {
  try {
    // Pet owner association ID from the associations file
    const petOwnerAssociationId = "67ec210e35f5b25402d79de4";
    const loc = locationId || import.meta.env.VITE_GHL_LOCATION_ID;
    
    // Try a different API endpoint format
    // First, check if this is the right object type
    console.log(`Attempting to get associations for pet ID ${petId}`);
    
    // Option 1: Try the direct association lookup
    try {
      const response = await api.get(`/objects/custom_objects.pets/records/${petId}/associations/${petOwnerAssociationId}/records`, {
        params: {
          locationId: loc,
          limit: 100,
          skip: 0
        }
      });
      
      console.log("Option 1 - Found associations:", response.data);
      const relations = response.data.records || [];
      if (relations.length > 0) {
        return relations;
      }
    } catch (err: any) {
      console.log("Option 1 failed:", err.message);
    }
    
    // Option 2: Try the generic relations endpoint
    try {
      const response = await api.get(`/associations/records/${petId}/relations`, {
        params: {
          locationId: loc,
          limit: 100,
          skip: 0,
          associationId: petOwnerAssociationId
        }
      });
      
      console.log("Option 2 - Found associations:", response.data);
      return response.data.records || response.data.relations || [];
    } catch (err: any) {
      console.log("Option 2 failed:", err.message);
    }
    
    // Option 3: Try the reverse lookup from contacts
    try {
      const response = await api.post(`/contacts/search`, {
        locationId: loc,
        limit: 100,
        filters: [
          {
            field: "customFieldValues.petId",
            operator: "=",
            value: petId
          }
        ]
      });
      
      console.log("Option 3 - Found contacts:", response.data);
      return response.data.contacts || [];
    } catch (err: any) {
      console.log("Option 3 failed:", err.message);
    }
    
    // If none of the above work, return empty array
    console.log("All association lookup attempts failed");
    return [];
  } catch (error: any) {
    console.error(`Error getting pet owner associations for pet ID ${petId}:`, error);
    // Log more details about the error for debugging
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return []; // Return empty array instead of throwing
  }
};

// Get contact details for pet associations
export const getPetOwnerContactDetails = async (petId: string, locationId?: string) => {
  try {
    // First get the associations
    const associations = await getPetOwnerAssociations(petId, locationId);
    
    console.log("Raw association data:", associations);
    
    // If the associations already contain contact data, just return them
    if (associations.length > 0 && (associations[0].email || associations[0].phone || associations[0].firstName)) {
      console.log("Using associations directly as contacts");
      return associations;
    }
    
    // Extract contact IDs from associations - adjust key names based on actual API response
    const contactIds = associations.map((assoc: any) => 
      assoc.recordId || assoc.associatedRecordId || assoc.id
    ).filter(Boolean);
    
    console.log("Extracted contact IDs:", contactIds);
    
    // If we have contact IDs, fetch their details
    if (contactIds.length > 0) {
      // Fetch contact details for each ID
      const contactPromises = contactIds.map((contactId: string) => 
        getContactById(contactId).catch(err => {
          console.error(`Error fetching contact ${contactId}:`, err);
          return null; // Return null for failed requests
        })
      );
      
      // Return all the contact details, filtering out failed requests
      const contacts = await Promise.all(contactPromises);
      return contacts.filter(Boolean);
    }
    
    // As a fallback, try to get the owner contact directly if we have an ownerID
    try {
      // Look for the pet record to see if it has an owner field
      const petResponse = await api.get(`/objects/custom_objects.pets/records/${petId}`, {
        params: {
          locationId: locationId || import.meta.env.VITE_GHL_LOCATION_ID
        }
      });
      
      console.log("Pet record:", petResponse.data);
      const pet = petResponse.data;
      
      // Check if the pet has an owner reference field
      const ownerId = pet.contactId || pet.properties?.owner_id || pet.properties?.contactId;
      if (ownerId) {
        console.log(`Found owner ID ${ownerId} in pet record`);
        const ownerContact = await getContactById(ownerId);
        return [ownerContact].filter(Boolean);
      }
    } catch (err) {
      console.error("Failed to get pet record:", err);
    }
    
    return [];
  } catch (error: any) {
    console.error(`Error getting pet owner contact details for pet ID ${petId}:`, error);
    return []; // Return empty array instead of throwing
  }
};

export default api; 