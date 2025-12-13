import React from 'react';
import ScrollVelocity from './ScrollVelocity';

export default function UnderConstructionBanner() {
    return (
        <div className="bg-[#FF6B00] py-4">
            <style>{`
        .parallax {
          position: relative;
          overflow: hidden;
        }

        .scroller {
          display: flex;
          white-space: nowrap;
          text-align: center;
          font-family: 'Bebas Neue', cursive;
          font-size: 1.25rem;
          font-weight: bold;
          letter-spacing: 0.05em;
          filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1));
        }

        .scroller span {
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .scroller {
            font-size: 2rem;
            line-height: 2rem;
          }
        }
      `}</style>
            <ScrollVelocity
                texts={[
                    '   🚧 Site is Under Construction 🚨   ',
                    '  🛠️ Come Back Later 👷  '
                ]}
                velocity={50}
                className="text-white"
            />
        </div>
    );
}
