'use client';

interface ContactCardProps {
  name: string;
  phone: string;
  email?: string;
  showWhatsApp?: boolean;
  showEmail?: boolean;
  profilePicture?: string;
}

export function ContactCard({
  name,
  phone,
  email,
  showWhatsApp = true,
  showEmail = true,
  profilePicture,
}: ContactCardProps) {
  // Format phone number for WhatsApp (remove spaces, dashes, etc.)
  const formatPhoneForWhatsApp = (phoneNum: string) => {
    const cleaned = phoneNum.replace(/\D/g, '');
    // Add country code if not present (assuming Saudi Arabia +966)
    if (!cleaned.startsWith('966')) {
      return `966${cleaned}`;
    }
    return cleaned;
  };

  const whatsappNumber = formatPhoneForWhatsApp(phone);

  return (
    <div className="bg-dark-400/50 rounded-lg p-3 border border-dark-300">
      {/* Profile Picture */}
      {profilePicture && (
        <div className="flex justify-center mb-3">
          <img
            src={profilePicture}
            alt={name}
            className="w-16 h-16 rounded-full object-cover border-2 border-brand-yellow/30"
          />
        </div>
      )}

      {/* Phone */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-gray-300 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span>{phone}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <a
            href={`tel:${phone}`}
            className="flex-1 text-center bg-white/5 hover:bg-white/10 text-gray-300 px-2 py-1.5 rounded text-xs font-medium transition-all border border-white/10 hover:border-white/20"
          >
            Call
          </a>
          {showWhatsApp && (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-white/5 hover:bg-white/10 text-gray-300 px-2 py-1.5 rounded text-xs font-medium transition-all border border-white/10 hover:border-white/20"
            >
              WhatsApp
            </a>
          )}
        </div>
      </div>

      {/* Email */}
      {email && showEmail && (
        <div className="mt-2 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2 text-gray-300 mb-2 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="truncate text-xs">{email}</span>
          </div>
          <a
            href={`mailto:${email}`}
            className="block text-center bg-white/5 hover:bg-white/10 text-gray-300 px-2 py-1.5 rounded text-xs font-medium transition-all border border-white/10 hover:border-white/20"
          >
            Email
          </a>
        </div>
      )}
    </div>
  );
}
