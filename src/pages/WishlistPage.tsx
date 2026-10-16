import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Heart, Compass } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_EXPERIENCES } from '../data/mockExperiences';
import { ExperienceCard } from '../components/ExperienceCard';
import { BookingModal } from '../components/BookingModal';
import { Experience } from '../types';

export const WishlistPage: React.FC = () => {
  const { wishlistIds } = useApp();
  const [bookingExp, setBookingExp] = useState<Experience | null>(null);

  const savedExperiences = MOCK_EXPERIENCES.filter((exp) => wishlistIds.includes(exp.id));

  return (
    <div style={{ padding: '40px 0 80px 0' }}>
      <div className="container-dayly">
        <div style={{ marginBottom: 32 }}>
          <span className="badge badge-violet" style={{ marginBottom: 6 }}>
            Saved Collection
          </span>
          <h1 style={{ fontSize: 'clamp(2.1rem, 4.2vw, 3rem)', fontWeight: 900 }}>
            My Wishlist ({savedExperiences.length})
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: 6 }}>
            Places, activities and culinary spots you want to fit into upcoming days.
          </p>
        </div>

        {savedExperiences.length === 0 ? (
          <div
            className="glass-card"
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 24
            }}
          >
            <Heart size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Your wishlist is empty</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 6, maxWidth: 380 }}>
              Browse experiences and tap the heart icon to save activities for your future day plans.
            </p>
            <Link to="/explore" className="btn btn-primary" style={{ marginTop: 22 }}>
              Browse Experiences
            </Link>
          </div>
        ) : (
          <div className="grid-cards">
            {savedExperiences.map((exp) => (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                onBookClick={(e) => setBookingExp(e)}
              />
            ))}
          </div>
        )}

        {bookingExp && (
          <BookingModal experience={bookingExp} onClose={() => setBookingExp(null)} />
        )}
      </div>
    </div>
  );
};
