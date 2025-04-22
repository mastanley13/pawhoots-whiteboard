import React from 'react';
import { OwnerContact } from './DogDetailsModal'; // Reuse the OwnerContact interface

interface ContactDetailsModalProps {
  contact: OwnerContact;
  onClose: () => void;
}

export const ContactDetailsModal: React.FC<ContactDetailsModalProps> = ({ 
  contact, 
  onClose 
}) => {
  if (!contact) return null; // Don't render if no contact is provided

  const displayName = contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.companyName || 'Unnamed Contact';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-60"> {/* Ensure higher z-index */}
      <div className="bg-white rounded-lg p-5 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-[#005596]">{displayName}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700"
            aria-label="Close contact details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {/* Email */}
          {contact.email && (
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline font-medium break-all">
                {contact.email}
              </a>
            </div>
          )}

          {/* Phone */}
          {contact.phone && (
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline font-medium">
                {contact.phone}
              </a>
            </div>
          )}
          
          {/* Address */}
          {contact.address?.line1 && (
             <div>
               <p className="text-sm text-gray-500">Address</p>
               <p className="font-medium">
                 {contact.address.line1}
                 {contact.address.city && `, ${contact.address.city}`}
                 {contact.address.state && `, ${contact.address.state}`}
                 {contact.address.postalCode && ` ${contact.address.postalCode}`}
               </p>
             </div>
           )}

          {/* Fallback if no details */}
          {!contact.email && !contact.phone && !contact.address?.line1 && (
            <p className="text-gray-500 italic">No contact details available.</p>
          )}
        </div>
      </div>
    </div>
  );
}; 