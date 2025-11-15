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
    <div className="bg-[#101820]/50 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
      {/* Profile Picture */}
      {profilePicture && (
        <div className="flex justify-center mb-4">
          <img
            src={profilePicture}
            alt={name}
            className="w-20 h-20 rounded-full object-cover border-2 border-[#FEE715]/50"
          />
        </div>
      )}

      {/* Name */}
      <h3 className="text-lg font-semibold text-white mb-3 text-center">
        👤 {name}
      </h3>

      {/* Phone */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-gray-300">
          <span className="text-sm">📱 {phone}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <a
            href={`tel:${phone}`}
            className="flex-1 text-center bg-[#FEE715]/20 hover:bg-[#FEE715]/30 text-[#FEE715] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-[#FEE715]/30"
          >
            📞 Call
          </a>
          {showWhatsApp && (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-green-500/30"
            >
              💬 WhatsApp
            </a>
          )}
        </div>
      </div>

      {/* Email */}
      {email && showEmail && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 text-gray-300 mb-2">
            <span className="text-sm">📧 {email}</span>
          </div>
          <a
            href={`mailto:${email}`}
            className="block text-center bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-blue-500/30"
          >
            ✉️ Email
          </a>
        </div>
      )}
    </div>
  );
}
