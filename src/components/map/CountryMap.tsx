'use client';

import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { capitalCoords } from '@/data/capitalCoords';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

export default function CountryMap({ geoName }: { geoName: string }) {
  const data = capitalCoords[geoName];
  if (!data) return null;

  return (
    <div
      className="rounded-xl overflow-hidden border border-white/10 bg-zinc-950 mt-2"
      style={{ pointerEvents: 'none' }}
    >
      <div className="h-44">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 140 }}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup center={[data.lng, data.lat]} zoom={data.zoom}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={!data.noHighlight && geo.properties.name === geoName ? '#4f46e5' : '#27272a'}
                    stroke="#3f3f46"
                    strokeWidth={0.5}
                    tabIndex={-1}
                    style={{ default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }}
                  />
                ))
              }
            </Geographies>
            <Marker coordinates={[data.lng, data.lat]}>
              <circle
                r={4 / data.zoom}
                fill="#fbbf24"
                stroke="#0c0a09"
                strokeWidth={0.8 / data.zoom}
              />
            </Marker>
          </ZoomableGroup>
        </ComposableMap>
      </div>
      <div className="py-1.5 text-center text-xs border-t border-white/5">
        <span className="text-zinc-500">Capital: </span>
        <span className="text-amber-400 font-medium">{data.capital}</span>
      </div>
    </div>
  );
}
