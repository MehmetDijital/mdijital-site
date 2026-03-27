import { ImageResponse } from 'next/og';

export const alt = 'M Dijital | Akıllı Sistemler. İnsan Merkezli Gelecek.';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/jpeg';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120,
          background: '#0B0D10',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#8FAFCB',
          fontWeight: 'bold',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ fontSize: 100, marginBottom: 20 }}>M DIJITAL</div>
        <div style={{ fontSize: 40, color: '#8FAFCB', opacity: 0.9 }}>
          Akıllı Sistemler. İnsan Merkezli Gelecek.
        </div>
        <div style={{ fontSize: 30, color: '#8FAFCB', opacity: 0.7, marginTop: 20 }}>
          Gürültü üretmeyiz. Mimari kurarız.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

