import React, { useState } from 'react';
import {
  X,
  Users,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Sparkles,
  Check,
  Copy,
  UserPlus
} from 'lucide-react';
import { GroupService } from '../services/groupService';
import { MOCK_EXPERIENCES } from '../data/mockExperiences';
import { useApp } from '../context/AppContext';
import { ItineraryEngine } from '../services/itineraryEngine';

interface GroupPlanModalProps {
  onClose: () => void;
}

export const GroupPlanModal: React.FC<GroupPlanModalProps> = ({ onClose }) => {
  const { setActiveDay } = useApp();
  const [session, setSession] = useState(() => GroupService.getSession());
  const [copied, setCopied] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');

  const handleVote = (expId: string, type: 'up' | 'down') => {
    const updated = GroupService.vote(expId, type);
    setSession({ ...updated });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://dayly.app/group/${session.passcode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;
    const updated = GroupService.addParticipant(newFriendName.trim());
    setSession({ ...updated });
    setNewFriendName('');
  };

  const handleGenerateConsensusPlan = () => {
    // Pick the experiences with highest upvotes
    const sortedExp = Object.entries(session.votes)
      .map(([id, val]) => ({
        exp: MOCK_EXPERIENCES.find((e) => e.id === id),
        score: val.up - val.down
      }))
      .filter((item) => item.exp !== undefined)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.exp!);

    const plan = ItineraryEngine.buildPlan({
      date: 'This Weekend',
      startTime: '12:00',
      endTime: '22:00',
      city: 'Delhi NCR',
      area: 'Group Picks',
      numPeople: session.participants.length,
      budgetTotal: 5000,
      ageGroup: 'young_adults',
      mode: 'friends',
      transportMode: 'car',
      tags: ['friends', 'group', 'voted']
    });

    setActiveDay(plan);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 640, borderRadius: 26 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            padding: '22px 26px',
            borderBottom: '1px solid var(--glass-panel-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'rgba(167, 139, 250, 0.20)',
                border: '1px solid rgba(167, 139, 250, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--lavender-electric)'
              }}
            >
              <Users size={18} />
            </div>
            <div>
              <span className="badge badge-violet" style={{ fontSize: '0.70rem', marginBottom: 2 }}>
                Collaborative Planning
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{session.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '26px' }}>
          {/* Share code banner */}
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 16,
              background: 'rgba(11, 16, 32, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 22
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>INVITE CODE</span>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '0.05em', color: '#FFFFFF' }}>
                {session.passcode}
              </div>
            </div>
            <button onClick={handleCopyLink} className="btn btn-secondary btn-sm">
              {copied ? <Check size={14} color="#34D399" /> : <Copy size={14} />}
              {copied ? 'Copied Link' : 'Copy Invite Link'}
            </button>
          </div>

          {/* Active Participants */}
          <div style={{ marginBottom: 22 }}>
            <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Active Participants ({session.participants.length})
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {session.participants.map((name) => (
                <span
                  key={name}
                  style={{
                    background: 'rgba(167, 139, 250, 0.14)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(167, 139, 250, 0.3)',
                    padding: '4px 12px',
                    borderRadius: 99,
                    fontSize: '0.78rem',
                    fontWeight: 600
                  }}
                >
                  {name}
                </span>
              ))}
            </div>

            {/* Quick add friend */}
            <form onSubmit={handleAddFriend} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Add friend name (e.g. Rahul)..."
                value={newFriendName}
                onChange={(e) => setNewFriendName(e.target.value)}
                className="input-field"
                style={{ height: 38, padding: '0 14px', fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-secondary btn-sm" style={{ height: 38 }}>
                <UserPlus size={14} /> Add
              </button>
            </form>
          </div>

          {/* Live Activity Polls */}
          <h4 style={{ fontSize: '0.98rem', fontWeight: 800, marginBottom: 14, color: 'var(--text-secondary)' }}>
            Group Votes on Candidate Experiences
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 26 }}>
            {Object.keys(session.votes).map((expId) => {
              const exp = MOCK_EXPERIENCES.find((e) => e.id === expId);
              if (!exp) return null;
              const vote = session.votes[expId];
              const myChoice = vote.users['Parv (You)'];

              return (
                <div
                  key={expId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: 16,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={exp.images[0]}
                      alt={exp.name}
                      style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    />
                    <div>
                      <h5 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFFFFF' }}>{exp.name}</h5>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {exp.venue.area} • ₹{exp.pricePerPerson}
                      </span>
                    </div>
                  </div>

                  {/* Voting buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => handleVote(expId, 'up')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '6px 12px',
                        borderRadius: 10,
                        border: myChoice === 'up' ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: myChoice === 'up' ? 'rgba(16, 185, 129, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                        color: myChoice === 'up' ? '#34D399' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        boxShadow: myChoice === 'up' ? '0 0 12px rgba(16, 185, 129, 0.25)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <ThumbsUp size={14} /> {vote.up}
                    </button>

                    <button
                      onClick={() => handleVote(expId, 'down')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '6px 12px',
                        borderRadius: 10,
                        border: myChoice === 'down' ? '1px solid #FDA4AF' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: myChoice === 'down' ? 'rgba(244, 63, 94, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                        color: myChoice === 'down' ? '#FDA4AF' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        boxShadow: myChoice === 'down' ? '0 0 12px rgba(244, 63, 94, 0.25)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <ThumbsDown size={14} /> {vote.down}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleGenerateConsensusPlan}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1.02rem' }}
          >
            <Sparkles size={16} /> Generate Day from Group Consensus
          </button>
        </div>
      </div>
    </div>
  );
};
