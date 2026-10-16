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
    <div className="glass-panel" style={{ padding: '28px', borderRadius: 24 }}>
      {/* Top Bar with Mode Toggles */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24
        }}
      >
        <div>
          <span className="badge badge-violet" style={{ fontSize: '0.72rem', marginBottom: 4 }}>
            Visual Itinerary Map & Routing
          </span>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Day Route Navigation</h3>
        </div>

        {/* Transit Mode Pill Toggle */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            background: 'rgba(11, 16, 32, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '4px',
            borderRadius: 99,
            backdropFilter: 'blur(12px)'
          }}
        >
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
                  padding: '7px 14px',
                  borderRadius: 99,
                  border: active ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid transparent',
                  cursor: 'pointer',
                  fontSize: '0.80rem',
                  fontWeight: 600,
                  background: active ? 'var(--grad-primary)' : 'transparent',
                  color: active ? '#FFFFFF' : 'var(--text-secondary)',
                  boxShadow: active ? '0 2px 10px rgba(139, 92, 246, 0.35)' : 'none',
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
          gap: 14,
          marginBottom: 24,
          padding: '16px 20px',
          background: 'rgba(11, 16, 32, 0.55)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Total Route Distance</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
            {itinerary.totalDistanceKm} km
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Est. Transit Time</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34D399' }}>
            ~{totalTransitMinutes} mins
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Transit Cost Est.</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FCD34D' }}>
            ₹{totalTransitCost}
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>City Transit Mode</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--lavender-electric)', textTransform: 'capitalize' }}>
            {transitMode}
          </div>
        </div>
      </div>

      {/* Simulated Interactive Map Canvas */}
      <div
        style={{
          position: 'relative',
          height: 290,
          borderRadius: 20,
          overflow: 'hidden',
          background: 'radial-gradient(ellipse at center, #172038 0%, #0B1020 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Subtle grid lines background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
            opacity: 0.8
          }}
        />

        {/* Simulated Route SVG path connecting the stops with electric glow */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          <path
            d="M 60 145 Q 240 60 450 170 T 820 130"
            fill="none"
            stroke="url(#routeGrad)"
            strokeWidth="3.5"
            strokeDasharray="6 6"
          />
          <defs>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#67E8F9" />
              <stop offset="50%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#F0ABFC" />
            </linearGradient>
          </defs>
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
                maxWidth: 130
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'var(--grad-primary)',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                  border: '2px solid rgba(255, 255, 255, 0.20)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  marginBottom: 8
                }}
              >
                {idx + 1}
              </div>
              <div
                style={{
                  background: 'rgba(11, 16, 32, 0.85)',
                  backdropFilter: 'blur(10px)',
                  padding: '4px 10px',
                  borderRadius: 10,
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 120
                }}
              >
                {it.experience.name}
              </div>
              <span style={{ fontSize: '0.70rem', color: 'var(--lavender-electric)', fontWeight: 600, marginTop: 2 }}>
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
            background: 'rgba(11, 16, 32, 0.7)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '4px 10px',
            borderRadius: 8
          }}
        >
          <Layers size={13} color="var(--cyan-accent)" />
          <span>Delhi NCR Smart Geo-Route</span>
        </div>
      </div>

      {/* Sequential Route Stop by Stop Breakdown */}
      <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14, color: 'var(--text-secondary)' }}>
        Leg-by-Leg Turn Navigation
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                  padding: '14px 18px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 16,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.80rem',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      boxShadow: '0 0 10px rgba(139, 92, 246, 0.4)'
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <h5 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF' }}>
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
                  style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                >
                  <Navigation size={12} /> Directions
                </a>
              </div>

              {/* Transit between this stop and next stop */}
              {nextLeg && (
                <div
                  style={{
                    margin: '8px 0 8px 42px',
                    padding: '9px 16px',
                    borderRadius: 12,
                    background: 'rgba(167, 139, 250, 0.06)',
                    border: '1px dashed rgba(167, 139, 250, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.80rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Car size={14} color="var(--lavender-electric)" />
                    <span>
                      {nextLeg.distanceKm} km via {transitMode} (~{nextLeg.travelMinutes} mins travel)
                    </span>
                  </div>
                  <span style={{ color: '#34D399', fontWeight: 600 }}>Traffic {nextLeg.trafficStatus}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
