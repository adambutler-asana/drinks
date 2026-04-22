import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { subscribeActiveEvents } from '../services/firebase';
import BottomNav from '../components/BottomNav';

export default function EventSelector() {
  const [events, setEvents] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    return subscribeActiveEvents((evts) => {
      if (evts.length === 0) {
        navigate('/menu', { replace: true });
      } else if (evts.length === 1) {
        navigate(`/event/${evts[0].id}`, { replace: true });
      } else {
        setEvents(evts);
      }
    });
  }, [navigate]);

  if (!events) return <div className="loading">Loading...</div>;

  return (
    <div className="page" style={{ background: '#111', color: '#fff', padding: '24px 16px' }}>
      <h1 style={{ fontFamily: "'DIN', sans-serif", fontSize: '1.75rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 24, textAlign: 'center' }}>
        Choose Event
      </h1>
      {events.map((evt) => (
        <Link key={evt.id} to={`/event/${evt.id}`} className="event-card">
          <h2>{evt.name}</h2>
          <div className="event-card-date">
            {evt.date?.toDate ? evt.date.toDate().toLocaleDateString() : ''}
          </div>
        </Link>
      ))}
      <BottomNav />
    </div>
  );
}
