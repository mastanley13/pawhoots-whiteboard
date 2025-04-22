import axios from 'axios';
import { Dog } from '../types/types'; // Import Dog type

// Create axios instance for GoHighLevel API
const api = axios.create({
  baseURL: 'https://services.leadconnectorhq.com',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_GOHIGHLEVEL_PRIVATE_INTEGRATION_KEY}`,
    // Use the correct API version for Calendars and Objects/Associations if different
    // Version '2021-07-28' might be okay for Objects/Associations, check Calendars spec
    // According to calendars.json, it uses '2021-04-15'. We might need separate instances or dynamic headers.
    // For now, let's assume 2021-07-28 works for all, but this is a potential issue.
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

// Interface for GHL Calendar Event (based on calendars.json)
export interface GhlCalendarEvent {
  id: string;
  title: string;
  calendarId: string;
  locationId: string;
  contactId?: string; // Optional, as events might not always have a contact
  appointmentStatus: string; // e.g., "confirmed", "cancelled"
  assignedUserId?: string;
  startTime: string; // ISO string format e.g., "2023-09-25T16:00:00+05:30"
  endTime: string; // ISO string format
  // Add other relevant fields from the spec if needed
  [key: string]: any; // Allow other properties
}

// Interface for GHL Pet Record (based on previous usage and expected data)
export interface GhlPetRecord {
  id: string;
  properties: {
    [key: string]: any; // Use specific keys if known e.g., name: string, breed: string
  };
  // Add other potential top-level fields if needed
  profileImage?: string;
  avatarUrl?: string;
  profileUrl?: string;
  imageUrl?: string;
  photoUrl?: string;
  customFields?: Array<{ id?: string; name?: string; value?: string; [key: string]: any; }>;
  attachments?: Array<{ id?: string; url?: string; name?: string; mimeType?: string; [key: string]: any; }>;
  // ... other fields
}

// --- NEW: Interface for GHL Vaccine Record ---
export interface GhlVaccineRecord {
  id: string;
  properties: {
    // Use short keys based on the example API response
    type?: string; // Corresponds to 'custom_objects.vaccine_records.type'
    status?: string; // Corresponds to 'custom_objects.vaccine_records.status '
    vaccine_date?: string; // Corresponds to 'custom_objects.vaccine_records.vaccine_date'
    expiration_date?: string; // Corresponds to 'custom_objects.vaccine_records.expiration_date'
    [key: string]: any; // Allow other properties from GHL
  };
  // Include other potential top-level fields from the record object if needed
  createdAt?: string;
  updatedAt?: string;
  // ... other fields like createdBy, lastUpdatedBy, etc.
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
export const getPetOwnerAssociations = async (petId: string, locationId?: string): Promise<string[]> => {
  try {
    const petOwnerAssociationId = "67ec210e35f5b25402d79de4"; // From associations file: contact <-> custom_objects.pets
    const loc = locationId || import.meta.env.VITE_GHL_LOCATION_ID;
    if (!loc) {
      console.error("Location ID is missing.");
      return [];
    }

    console.log(`Attempting to get relations for record ID (pet ID) ${petId} using association ${petOwnerAssociationId}`);

    // Use the correct endpoint based on the associations.json spec
    // GET /associations/relations/{recordId}?locationId={loc}&associationIds=[...]&limit=100&skip=0
    const response = await api.get(`/associations/relations/${petId}`, {
      params: {
        locationId: loc,
        limit: 100, // Adjust limit as needed
        skip: 0,
        // Pass associationId in an array as per the spec
        associationIds: [petOwnerAssociationId] 
      }
    });

    console.log("Relations API response:", response.data);
    
    // The response structure might vary, adjust based on actual GHL response
    // Assuming response.data.relations is the array of relation objects
    const relations = response.data.relations || response.data.records || []; 
    
    if (!Array.isArray(relations)) {
        console.error("Unexpected relations response format:", relations);
        return [];
    }

    // Extract the contact IDs from the relations
    // Each relation should link the petId (recordId used in query) to a contactId
    const contactIds = relations.map((relation: any) => {
      // Check which record ID in the relation is NOT the petId we queried with
      if (relation.firstRecordId === petId) {
        return relation.secondRecordId;
      } else if (relation.secondRecordId === petId) {
        return relation.firstRecordId;
      }
      return null; // Should not happen if the association is correct
    }).filter(Boolean); // Filter out any nulls

    console.log(`Found contact IDs associated with pet ${petId}:`, contactIds);
    return contactIds;

  } catch (error: any) {
    console.error(`Error getting relations for pet ID ${petId}:`, error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error message:', error.message);
    }
    return []; // Return empty array on error
  }
};

// Get contact details for pet associations
export const getPetOwnerContactDetails = async (petId: string, locationId?: string) => {
  try {
    // Get the associated contact IDs
    const contactIds = await getPetOwnerAssociations(petId, locationId);

    console.log("Received contact IDs:", contactIds);

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
      const validContacts = contacts.filter(Boolean);
      console.log(`Successfully fetched ${validContacts.length} contact details`);
      return validContacts;
    }

    // Fallback: If no associations found, try to get the pet record directly
    // This part remains the same as the previous fallback logic
    console.log("No associated contact IDs found, attempting fallback to check pet record owner field.");
    try {
      const loc = locationId || import.meta.env.VITE_GHL_LOCATION_ID;
      const petResponse = await api.get(`/objects/custom_objects.pets/records/${petId}`, {
        params: { locationId: loc }
      });

      console.log("Pet record:", petResponse.data);
      // Ensure petResponse.data.record exists before accessing properties
      const petRecord = petResponse.data.record || petResponse.data; 
      const ownerId = petRecord?.contactId || petRecord?.properties?.owner_id || petRecord?.properties?.contactId;
      
      if (ownerId) {
        console.log(`Found owner ID ${ownerId} in pet record fallback`);
        const ownerContact = await getContactById(ownerId);
        return [ownerContact].filter(Boolean);
      } else {
         console.log("No owner ID found in pet record fallback.");
      }
    } catch (err) {
      console.error("Failed fallback attempt to get pet record owner:", err);
    }

    return []; // Return empty if no associations and no direct owner found
  } catch (error: any) {
    console.error(`Error getting pet owner contact details for pet ID ${petId}:`, error);
    return []; // Return empty array instead of throwing
  }
};

// --- NEW: Get Calendar Events ---
export const getCalendarEvents = async (
  calendarId: string,
  startTimeMillis: number,
  endTimeMillis: number,
  locationId?: string
): Promise<GhlCalendarEvent[]> => {
  const loc = locationId || import.meta.env.VITE_GHL_LOCATION_ID;
  if (!loc) {
    console.error("Location ID is missing for getCalendarEvents.");
    return [];
  }

  try {
    console.log(`Fetching events for calendar ${calendarId} from ${new Date(startTimeMillis)} to ${new Date(endTimeMillis)}`);
    // Use GET /calendars/events endpoint from calendars.json spec
    // NOTE: The Version header might need to be '2021-04-15' for this endpoint.
    // If issues arise, consider creating a separate axios instance for calendar API or adjusting headers dynamically.
    const response = await api.get('/calendars/events', {
      params: {
        locationId: loc,
        calendarId: calendarId,
        startTime: startTimeMillis.toString(), // API expects string milliseconds
        endTime: endTimeMillis.toString() // API expects string milliseconds
      },
      // Example of overriding headers for a specific request if needed:
      // headers: { 'Version': '2021-04-15' }
    });

    console.log(`API response for calendar ${calendarId}:`, response.data);
    return response.data.events || []; // Adjust based on actual response structure
  } catch (error: any) {
    console.error(`Error fetching calendar events for calendar ${calendarId}:`, error);
     if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error message:', error.message);
    }
    return []; // Return empty array on error
  }
};

// Get associated Pet IDs from a Contact ID
// (Refined from getPetOwnerAssociations to clarify input/output)
export const getAssociatedPetIds = async (contactId: string, locationId?: string): Promise<string[]> => {
  try {
    const contactPetAssociationId = "67ec210e35f5b25402d79de4"; // contact <-> custom_objects.pets
    const loc = locationId || import.meta.env.VITE_GHL_LOCATION_ID;
    if (!loc) {
      console.error("Location ID is missing for getAssociatedPetIds.");
      return [];
    }

    console.log(`Attempting to get pet relations for contact ID ${contactId} using association ${contactPetAssociationId}`);

    // Use GET /associations/relations/{recordId} endpoint
    const response = await api.get(`/associations/relations/${contactId}`, {
      params: {
        locationId: loc,
        limit: 100,
        skip: 0,
        associationIds: [contactPetAssociationId]
      }
    });

    console.log("Relations API response for contact:", response.data);
    const relations = response.data.relations || response.data.records || [];

    if (!Array.isArray(relations)) {
      console.error("Unexpected relations response format:", relations);
      return [];
    }

    // Extract the pet IDs from the relations
    // Each relation links the contactId (input recordId) to a petId
    const petIds = relations.map((relation: any) => {
      // The other ID in the relation pair is the pet ID
      if (relation.firstRecordId === contactId) {
        return relation.secondRecordId;
      } else if (relation.secondRecordId === contactId) {
        return relation.firstRecordId;
      }
      return null;
    }).filter(Boolean); // Filter out any nulls

    console.log(`Found pet IDs associated with contact ${contactId}:`, petIds);
    return petIds;

  } catch (error: any) {
    console.error(`Error getting relations for contact ID ${contactId}:`, error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error message:', error.message);
    }
    return []; // Return empty array on error
  }
};

// --- NEW: Get Pet Record Details by ID ---
const PET_OBJECT_KEY = "custom_objects.pets"; // Define constant

export const getPetRecordById = async (petId: string, locationId?: string): Promise<GhlPetRecord | null> => {
    const loc = locationId || import.meta.env.VITE_GHL_LOCATION_ID;
    if (!loc) {
      console.error("Location ID is missing for getPetRecordById.");
      return null;
    }

    try {
        console.log(`Fetching pet record details for ID: ${petId} in location: ${loc}`);
        // Endpoint: GET /objects/{objectKey}/records/{recordId}
        const response = await api.get(`/objects/${PET_OBJECT_KEY}/records/${petId}`, {
            params: { locationId: loc }
        });

        console.log("Pet Record API Response:", response.data);
        // Adjust based on the actual structure, might be nested under 'record' or similar
        return response.data.record || response.data || null;

    } catch (error: any) {
        console.error(`Error fetching pet record ${petId}:`, error);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
          // Handle 404 Not Found specifically if needed
          if (error.response.status === 404) {
            console.warn(`Pet record with ID ${petId} not found.`);
            return null;
          }
        } else {
          console.error('Error message:', error.message);
        }
        return null; // Return null on error
    }
};

// --- NEW: Get Associated Vaccine Record Details for a Pet ---
const VACCINE_RECORD_OBJECT_KEY = "custom_objects.vaccine_records";
const PET_VACCINE_ASSOCIATION_ID = "67ffe69c0812c47e40553e11"; // From associations file: custom_objects.pets <-> custom_objects.vaccine_records

export const getPetVaccineRecords = async (petId: string, locationId?: string): Promise<GhlVaccineRecord[]> => {
  const loc = locationId || import.meta.env.VITE_GHL_LOCATION_ID;
  if (!loc) {
    console.error("Location ID is missing for getPetVaccineRecords.");
    return [];
  }
  if (!petId) {
    console.error("Pet ID is missing for getPetVaccineRecords.");
    return [];
  }

  try {
    // 1. Get associated Vaccine Record IDs
    console.log(`Fetching vaccine relations for pet ID ${petId} using association ${PET_VACCINE_ASSOCIATION_ID}`);
    const relationsResponse = await api.get(`/associations/relations/${petId}`, {
      params: {
        locationId: loc,
        limit: 100, // Assuming max 100 vaccine records per pet
        skip: 0,
        associationIds: [PET_VACCINE_ASSOCIATION_ID]
      }
    });

    console.log("Vaccine Relations API response:", relationsResponse.data);
    const relations = relationsResponse.data.relations || relationsResponse.data.records || [];

    if (!Array.isArray(relations)) {
      console.error("Unexpected vaccine relations response format:", relations);
      return [];
    }

    const vaccineRecordIds = relations.map((relation: any) => {
      if (relation.firstRecordId === petId) {
        return relation.secondRecordId;
      } else if (relation.secondRecordId === petId) {
        return relation.firstRecordId;
      }
      return null;
    }).filter(Boolean);

    console.log(`Found vaccine record IDs associated with pet ${petId}:`, vaccineRecordIds);

    if (vaccineRecordIds.length === 0) {
      return []; // No associated vaccine records found
    }

    // 2. Fetch details for each Vaccine Record ID
    const vaccineRecordPromises = vaccineRecordIds.map(async (recordId: string): Promise<GhlVaccineRecord | null> => {
      try {
        console.log(`Fetching vaccine record details for ID: ${recordId} in location: ${loc}`);
        const response = await api.get(`/objects/${VACCINE_RECORD_OBJECT_KEY}/records/${recordId}`, {
          params: { locationId: loc }
        });
        console.log(`Vaccine Record API Response for ${recordId}:`, response.data);
        // Adjust based on the actual structure, might be nested under 'record'
        const recordData = response.data.record || response.data;
        if (recordData && recordData.id) {
          // Ensure properties exist, default to empty object if not
          return {
            id: recordData.id,
            properties: recordData.properties || {},
            ...recordData // Include any other top-level fields returned
          };
        }
        console.warn(`Vaccine record data missing or invalid for ID ${recordId}:`, recordData);
        return null;
      } catch (error: any) {
        console.error(`Error fetching vaccine record ${recordId}:`, error);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
          if (error.response.status === 404) {
            console.warn(`Vaccine record with ID ${recordId} not found.`);
          }
        } else {
          console.error('Error message:', error.message);
        }
        return null; // Return null for failed requests
      }
    });

    const vaccineRecords = await Promise.all(vaccineRecordPromises);
    const validVaccineRecords = vaccineRecords.filter(Boolean) as GhlVaccineRecord[]; // Filter out nulls and assert type

    console.log(`Successfully fetched ${validVaccineRecords.length} vaccine record details for pet ${petId}`);
    return validVaccineRecords;

  } catch (error: any) {
    console.error(`Error getting vaccine records for pet ID ${petId}:`, error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error message:', error.message);
    }
    return []; // Return empty array on error
  }
};

// --- NEW: Utility to map GHL Pet Record to Dog Type ---
export const mapGhlPetToDog = (petRecord: GhlPetRecord): Dog => {
  if (!petRecord || !petRecord.id) {
    // Handle invalid input, perhaps throw an error or return a default structure
    console.error("Invalid petRecord provided to mapGhlPetToDog:", petRecord);
    // Returning a default/error structure might be better than throwing
    // FIX: Add missing properties and use valid default color
    return {
        id: 'error-invalid-pet-record',
        name: 'Error Invalid Pet',
        breed: 'Unknown',
        color: null, // FIX: Use null or a valid DogColor
        traits: [], // Add default traits
        assignedStaff: null, // Add default assignedStaff
        location: { area: null, position: null },
        lastUpdated: new Date(),
        locationHistory: [],
        scheduledMoves: [],
        // Add other required fields with default/null values if necessary
    };
  }

  // FIX: Define isValidDate in the outer scope of mapGhlPetToDog
  const isValidDate = (dateStr: string | null | undefined): boolean => {
    if (!dateStr) return false;
    // Check if it's a string and if it parses to a valid date
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  // Helper to safely get properties, checking both short key and full key
  const getProperty = (fullKey: string): any => {
    const shortKey = fullKey.split('.').pop() || '';
    // Prioritize direct property access if available, then check within 'properties' object
    return petRecord[shortKey as keyof GhlPetRecord] // Check top level first (unlikely but possible)
        ?? petRecord.properties?.[shortKey]
        ?? petRecord.properties?.[fullKey]
        ?? null; // Return null if not found
  };

   // Helper to extract profile image URL (similar to logic in EmployeeResourcesPage)
   const extractProfileImage = (): string | undefined => {
     const profileImageFilename =
       getProperty('custom_objects.pets.profile_picture') ||
       getProperty('profile_picture') ||
       getProperty('custom_objects.pets.profileImage') ||
       getProperty('custom_objects.pets.profile_image') ||
       getProperty('custom_objects.pets.image') ||
       getProperty('custom_objects.pets.photo');

     console.log(`mapGhlPetToDog: Raw profile image data: ${profileImageFilename}`);

     if (profileImageFilename && typeof profileImageFilename === 'string') {
       if (profileImageFilename.startsWith('http')) return profileImageFilename;
       // Construct URL if it's just a filename/path
       const baseUrl = 'https://storage.googleapis.com/msgsndr/'; // Base GHL storage URL might vary
       // Remove potential leading slashes from filename
       const cleanFilename = profileImageFilename.startsWith('/') ? profileImageFilename.substring(1) : profileImageFilename;
       // Check if the filename already contains the bucket path
       if (cleanFilename.includes('/media/')) {
         // Assuming it's relative to the base URL structure
         return `${baseUrl}${cleanFilename}`;
       } else {
          // Fallback: Construct a plausible path (may need adjustment based on actual storage)
          // Example: Using VITE_GHL_LOCATION_ID might be part of the path
           const locationId = import.meta.env.VITE_GHL_LOCATION_ID || 'unknown_location';
          return `${baseUrl}${locationId}/media/${encodeURIComponent(cleanFilename)}`;
       }
     }

     // Check top-level record fields
     const recordImage = petRecord.profileImage || petRecord.avatarUrl || petRecord.profileUrl || petRecord.imageUrl || petRecord.photoUrl;
     if (recordImage) {
       console.log(`mapGhlPetToDog: Found profile image URL in record: ${recordImage}`);
       return recordImage;
     }

      // Check custom fields array
      if (petRecord.customFields && Array.isArray(petRecord.customFields)) {
         const imageField = petRecord.customFields.find((field: any) =>
           field.name?.toLowerCase().includes('profile') ||
           field.name?.toLowerCase().includes('image') ||
           field.name?.toLowerCase().includes('photo') ||
           field.name?.toLowerCase().includes('avatar')
         );
         if (imageField?.value) {
           console.log(`mapGhlPetToDog: Found profile image URL in custom fields: ${imageField.value}`);
           if (imageField.value.startsWith('http')) return imageField.value;
           // Construct URL logic here if needed (similar to above)
         }
       }

      // Check attachments array
      if (petRecord.attachments && Array.isArray(petRecord.attachments)) {
        const imageAttachment = petRecord.attachments.find(attachment =>
          attachment.mimeType?.startsWith('image/') ||
          attachment.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        );
        if (imageAttachment?.url) {
           console.log(`mapGhlPetToDog: Found profile image URL in attachments: ${imageAttachment.url}`);
           return imageAttachment.url;
         }
       }

     console.log(`mapGhlPetToDog: No profile image found for pet ${petRecord.id}`);
     return undefined; // Explicitly return undefined if no image found
   };

    // --- Get Vaccination Dates ---
    const rabiesDate = getProperty('custom_objects.pets.rabies_vaccination') || getProperty('rabies_vaccination');
    const dhppDate = getProperty('custom_objects.pets.dhpp_vaccination') || getProperty('dhpp_vaccination');
    const bordetellaDate = getProperty('custom_objects.pets.bordetella_vaccination') || getProperty('bordetella_vaccination');

    // --- Determine Vaccination Status ---
    const determineVaccinationStatus = (): 'Current' | 'Expired' | 'Incomplete' | 'Unknown' => {
        const now = new Date();
        // isValidDate is now defined in the outer scope
        const isExpired = (dateStr: string | null | undefined): boolean => {
            if (!isValidDate(dateStr)) return false; // Treat invalid dates as not expired for this check
            return new Date(dateStr!) < now;
        };

        const hasRabies = isValidDate(rabiesDate);
        const hasDhpp = isValidDate(dhppDate);
        const hasBordetella = isValidDate(bordetellaDate);

        if (!hasRabies && !hasDhpp && !hasBordetella) return 'Unknown';
        if (isExpired(rabiesDate) || isExpired(dhppDate) || isExpired(bordetellaDate)) return 'Expired';
        if (hasRabies && hasDhpp && hasBordetella) return 'Current';

        return 'Incomplete';
    };


    // --- Extract Traits ---
    // This is a placeholder - adapt if traits are stored differently in GHL
    const extractTraits = (): string[] => {
        const traits: string[] = [];
        // Example: Check boolean custom fields for traits
        if (getProperty('custom_objects.pets.is_friendly') === 'true' || getProperty('is_friendly') === true) traits.push('friendly');
        if (getProperty('custom_objects.pets.is_vocal') === 'true' || getProperty('is_vocal') === true) traits.push('vocal');
        if (getProperty('custom_objects.pets.high_energy') === 'true' || getProperty('high_energy') === true) traits.push('high-energy');
        // Add more trait checks based on your custom fields
        return traits;
    };

    // --- Map to Dog Object ---
    const dog: Dog = {
        id: petRecord.id, // Use the GHL Pet Record ID
        name: getProperty('custom_objects.pets.name') || getProperty('name') || 'Unnamed Pet',
        breed: getProperty('custom_objects.pets.breed') || getProperty('breed') || 'Unknown Breed',
        color: getProperty('custom_objects.pets.animal_color') || getProperty('animal_color') || 'grey', // Default color
        traits: extractTraits(),
        assignedStaff: null, // Default
        location: { area: null, position: null }, // Default starting location (Pool)
        lastUpdated: new Date(),
        locationHistory: [],
        scheduledMoves: [],
        owner: undefined, // Will be fetched separately if needed
        ownerPhone: undefined, // Will be fetched separately if needed
        emergencyContact: getProperty('custom_objects.pets.emergency_contact_name'),
        emergencyPhone: getProperty('custom_objects.pets.emergency_contact_phone'),
        veterinarian: getProperty('custom_objects.pets.veterinarian_name'),
        vetPhone: getProperty('custom_objects.pets.veterinarian_phone'),
        medications: (getProperty('custom_objects.pets.medications') || '').split(',').map((m: string) => m.trim()).filter(Boolean), // Example parsing
        feedingSchedule: getProperty('custom_objects.pets.feeding_schedule'),
        notes: getProperty('custom_objects.pets.notes') || getProperty('custom_objects.pets.special_notes'),
        // Specific fields from pet record
        animalSize: getProperty('custom_objects.pets.animal_size'),
        hairLength: getProperty('custom_objects.pets.hair_length'),
        hairThickness: getProperty('custom_objects.pets.hair_thickness'),
        expectedGroomingTime: getProperty('custom_objects.pets.expected_grooming_time'),
        specialNotes: getProperty('custom_objects.pets.special_notes') || getProperty('notes'), // Combine notes fields if necessary
        // Vaccination Info
        rabiesVaccination: isValidDate(rabiesDate) ? rabiesDate : undefined,
        dhppVaccination: isValidDate(dhppDate) ? dhppDate : undefined,
        bordetellaVaccination: isValidDate(bordetellaDate) ? bordetellaDate : undefined,
        vaccinationStatus: determineVaccinationStatus(),
        // Profile Image
        profileImage: extractProfileImage(),
    };

    console.log(`Mapped GHL Pet ${petRecord.id} to Dog:`, dog);
    return dog;
};

export default api; 