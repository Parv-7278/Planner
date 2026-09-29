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
      <div className="modal-box" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(139, 92, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#a78bfa'
              }}
            >
              <Users size={18} />
            </div>
            <div>
              <span className="badge badge-violet" style={{ fontSize: '0.68rem', marginBottom: 2 }}>
                Collaborative Planning
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{session.title}</h3>
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
        <div style={{ padding: '24px' }}>
          {/* Share code banner */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 14,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>INVITE CODE</span>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.05em', color: '#fff' }}>
                {session.passcode}
              </div>
            </div>
            <button onClick={handleCopyLink} className="btn btn-secondary btn-sm">
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              {copied ? 'Copied Link' : 'Copy Invite Link'}
            </button>
          </div>

          {/* Active Participants */}
          <div style={{ marginBottom: 20 }}>
            <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Active Participants ({session.participants.length})
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {session.participants.map((name) => (
                <span
                  key={name}
                  style={{
                    background: 'rgba(255, 77, 109, 0.1)',
                    color: '#fff',
                    border: '1px solid rgba(255, 77, 109, 0.25)',
                    padding: '4px 10px',
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
                style={{ height: 36, padding: '0 12px', fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-secondary btn-sm" style={{ height: 36 }}>
                <UserPlus size={14} /> Add
              </button>
            </form>
          </div>

          {/* Live Activity Polls */}
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)' }}>
            Group Votes on Candidate Experiences
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
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
                    padding: '12px 14px',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={exp.images[0]}
                      alt={exp.name}
                      style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }}
                    />
                    <div>
                      <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{exp.name}</h5>
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
                        gap: 4,
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: myChoice === 'up' ? '1px solid #10b981' : '1px solid var(--border-subtle)',
                        background: myChoice === 'up' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.04)',
                        color: myChoice === 'up' ? '#34d399' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                      }}
                    >
                      <ThumbsUp size={14} /> {vote.up}
                    </button>

                    <button
                      onClick={() => handleVote(expId, 'down')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: myChoice === 'down' ? '1px solid #fb7185' : '1px solid var(--border-subtle)',
                        background: myChoice === 'down' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255,255,255,0.04)',
                        color: myChoice === 'down' ? '#fb7185' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.85rem'
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
            style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
          >
            <Sparkles size={16} /> Generate Day from Group Consensus
          </button>
        </div>
      </div>
    </div>
  );
};
