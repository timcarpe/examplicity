import { ImageResponse } from 'next/og';

export const alt = 'Examplicity — Make complex ideas click';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#fbfbfd',
          color: '#1d1d1f',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between',
          padding: '64px 72px',
          width: '100%',
        }}
      >
        <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', fontSize: 32, fontWeight: 700, letterSpacing: '-1.5px' }}>
            <span style={{ color: '#5277b8' }}>exam</span>plicity
          </div>
          <div
            style={{
              border: '2px solid #1d1d1f',
              borderRadius: 999,
              display: 'flex',
              fontSize: 20,
              fontWeight: 600,
              padding: '10px 20px',
            }}
          >
            Interactive learning
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', width: 960 }}>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 88, fontWeight: 700, letterSpacing: '-5px', lineHeight: 0.9 }}>
            <span>Make complex</span>
            <span>ideas click.</span>
          </div>
          <div style={{ color: '#6e6e73', display: 'flex', fontSize: 30, lineHeight: 1.25, marginTop: 38 }}>
            IGCSE, AS &amp; A Level exam practice and visual concept labs.
          </div>
        </div>

        <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ background: '#5277b8', borderRadius: 999, display: 'flex', height: 10, width: 180 }} />
          <div style={{ color: '#6e6e73', display: 'flex', fontSize: 22 }}>See it · change it · understand it</div>
        </div>
      </div>
    ),
    size,
  );
}
