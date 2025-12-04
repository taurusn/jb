import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Ready HR - Land Your Next Opportunity';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#101820',
          position: 'relative',
        }}
      >
        {/* Background gradient orb */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            right: '10%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(254, 231, 21, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '120px',
            height: '120px',
            backgroundColor: '#FEE715',
            borderRadius: '24px',
            marginBottom: '40px',
          }}
        >
          <span
            style={{
              fontSize: '72px',
              fontWeight: 700,
              color: '#101820',
            }}
          >
            R
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: '72px',
            fontWeight: 700,
            color: '#FFFFFF',
            marginBottom: '20px',
            textAlign: 'center',
            maxWidth: '900px',
          }}
        >
          Land Your Next{' '}
          <span
            style={{
              color: '#FEE715',
              marginLeft: '20px',
            }}
          >
            Opportunity
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontSize: '32px',
            color: '#9CA3AF',
            textAlign: 'center',
            maxWidth: '800px',
          }}
        >
          One simple application connects you with employers
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
