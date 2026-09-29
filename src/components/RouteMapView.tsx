import React, { useState } from 'react';
import {
  Car,
  Train,
  Footprints,
  Bike,
  Navigation,
  MapPin,
  Clock,
  Compass,
  Layers,
  ExternalLink
} from 'lucide-react';
import { DayItinerary, TravelLeg } from '../types';
import { ItineraryEngine } from '../services/itineraryEngine';
import { useApp } from '../context/AppContext';

interface RouteMapViewProps {
  itinerary: DayItinerary;
}

export const RouteMapView: React.FC<RouteMapViewProps> = ({ itinerary }) => {
  const { setActiveDay } = useApp();
  const [transitMode, setTransitMode] = useState<'car' | 'metro' | 'walking' | 'bike'>('car');

  const handleModeChange = (mode: 'car' | 'metro' | 'walking' | 'bike') => {
    setTransitMode(mode);
    const updatedLegs = ItineraryEngine.generateTravelLegs(itinerary.items, mode);
    setActiveDay({
      ...itinerary,
      travelLegs: updatedLegs,
      totalDistanceKm: Math.round(updatedLegs.reduce((s, l) => s + l.distanceKm, 0) * 10) / 10
    });
  };

  const totalTransitMinutes = itinerary.travelLegs.reduce((s, l) => s + l.travelMinutes, 0);
  const totalTransitCost = itinerary.travelLegs.reduce((s, l) => s + l.estimatedCost, 0);

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {/* Top Bar with Mode Toggles */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 20
        }}
      >
        <div>
          <span className="badge badge-coral" style={{ fontSize: '0.68rem', marginBottom: 4 }}>
            Visual Itinerary Map & Routing
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Day Route Navigation</h3>
        </div>

        {/* Transit Mode Pill Toggle */}
        <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.05)', padding: 4, borderRadius: 99 }}>
          {[
            { id: 'car', icon: Car, label: 'Car / Cab' },
            { id: 'metro', icon: Train, label: 'Delhi Metro' },
            { id: 'bike', icon: Bike, label: 'Bike' },
            { id: 'walking', icon: Footprints, label: 'Walking' }
          ].map((m) => {
            const Icon = m.icon;
            const active = transitMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleModeChange(m.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 99,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: active ? 'var(--coral-500)' : 'transparent',
                  color: active ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={14} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Transit stats summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
          marginBottom: 24,
          padding: '12px 16px',
          background: 'rgba(0,0,0,0.25)',
          borderRadius: 14,
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Route Distance</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
            {itinerary.totalDistanceKm} km
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Est. Transit Time</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>
            ~{totalTransitMinutes} mins
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Transit Cost Est.</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fbbf24' }}>
            ₹{totalTransitCost}
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>City Transit Mode</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#a78bfa', textTransform: 'capitalize' }}>
            {transitMode}
          </div>
        </div>
      </div>

      {/* Simulated Interactive Map Canvas */}
      <div
        style={{
          position: 'relative',
          height: 280,
          borderRadius: 18,
          overflow: 'hidden',
          background: 'radial-gradient(ellipse at center, #1b1e36 0%, #0d0f1f 100%)',
          border: '1px solid var(--border-subtle)',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Subtle grid lines background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
            opacity: 0.8
          }}
        />

        {/* Simulated Route SVG path connecting the stops */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          <path
            d="M 60 140 Q 220 50 420 160 T 780 120"
            fill="none"
            stroke="var(--coral-500)"
            strokeWidth="3"
            strokeDasharray="6 6"
          />
        </svg>

        {/* Nodes plotted horizontally across map canvas */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: '90%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {itinerary.items.map((it, idx) => (
            <div
              key={it.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                maxWidth: 120
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'var(--grad-primary)',
                  boxShadow: '0 0 16px var(--coral-glow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  marginBottom: 8
                }}
              >
                {idx + 1}
              </div>
              <div
                style={{
                  background: 'rgba(10,11,18,0.85)',
                  backdropFilter: 'blur(8px)',
                  padding: '4px 8px',
                  borderRadius: 8,
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 110
                }}
              >
                {it.experience.name}
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--coral-500)', fontWeight: 600 }}>
                {it.startTime}
              </span>
            </div>
          ))}
        </div>

        {/* Map Legend watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            right: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            background: 'rgba(0,0,0,0.6)',
            padding: '3px 8px',
            borderRadius: 6
          }}
        >
          <Layers size={12} />
          <span>Delhi NCR Smart Geo-Route Map</span>
        </div>
      </div>

      {/* Sequential Route Stop by Stop Breakdown */}
      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)' }}>
        Leg-by-Leg Turn Navigation
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {itinerary.items.map((it, idx) => {
          const nextLeg = itinerary.travelLegs[idx];

          return (
            <div key={it.id}>
              {/* Destination stop card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: 'var(--coral-500)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: '#fff'
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                      {it.experience.name}
                    </h5>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {it.experience.venue.address}
                    </div>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    it.experience.venue.name + ' ' + it.experience.venue.address
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                >
                  <Navigation size={12} /> Directions
                </a>
              </div>

              {/* Transit between this stop and next stop */}
              {nextLeg && (
                <div
                  style={{
                    margin: '8px 0 8px 38px',
                    padding: '8px 14px',
                    borderRadius: 10,
                    background: 'rgba(139, 92, 246, 0.08)',
                    border: '1px dashed rgba(139, 92, 246, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Car size={14} color="var(--violet-500)" />
                    <span>
                      {nextLeg.distanceKm} km via {transitMode} (~{nextLeg.travelMinutes} mins travel)
                    </span>
                  </div>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>Traffic {nextLeg.trafficStatus}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
