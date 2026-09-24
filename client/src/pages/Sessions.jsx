import React, { useState, useEffect } from 'react';
import { Video, Calendar, Clock, Plus, Users } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

const Sessions = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    topic: '',
    date: '',
    time: '',
    duration: 60
  });

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sessions');
      const sData = Array.isArray(res.data) ? res.data : res.data.sessions || [];
      setSessions(sData);
    } catch (error) {
      console.error('Failed to fetch sessions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sessions', form);
      setIsModalOpen(false);
      setForm({ title: '', topic: '', date: '', time: '', duration: 60 });
      fetchSessions();
    } catch (error) {
      console.error('Failed to schedule session', error);
    }
  };

  const handleJoin = async (id) => {
    try {
      await api.post(`/sessions/${id}/join`);
      fetchSessions();
    } catch (error) {
      console.error('Failed to join session', error);
    }
  };

  const now = new Date();
  const filteredSessions = sessions.filter(s => {
    const sDate = s.date ? new Date(s.date) : new Date();
    if (activeTab === 'upcoming') {
      return s.status !== 'completed' && sDate >= new Date(now.setHours(0,0,0,0));
    }
    return s.status === 'completed' || sDate < new Date(now.setHours(0,0,0,0));
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-plum-900">Learning Sessions</h1>
          <p className="text-gray-500 mt-1">Schedule and manage your 1-on-1 and group learning sessions.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Calendar size={18} /> Schedule Session
        </Button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {['upcoming', 'past'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-semibold text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'border-violet-500 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab} Sessions ({sessions.filter(s => {
                const sDate = s.date ? new Date(s.date) : new Date();
                return tab === 'upcoming' 
                  ? s.status !== 'completed' && sDate >= new Date(new Date().setHours(0,0,0,0))
                  : s.status === 'completed' || sDate < new Date(new Date().setHours(0,0,0,0));
              }).length})
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredSessions.length > 0 ? (
        <div className="grid gap-4">
          {filteredSessions.map((session) => {
            const sDate = session.date ? new Date(session.date) : new Date();
            const hostName = session.host?.name || 'Host';
            const isHost = session.host?._id === user?._id || session.host === user?._id;
            const isParticipant = session.participants?.some(p => (p._id || p) === user?._id);

            return (
              <div 
                key={session._id} 
                className="bg-white p-6 rounded-2xl shadow-card border border-gray-100 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center hover:shadow-hover transition-all"
              >
                <div className="flex gap-4 items-start">
                  <div className="w-16 h-16 bg-violet-50 rounded-2xl flex flex-col items-center justify-center text-violet-700 flex-shrink-0 border border-violet-100">
                    <span className="text-xs font-semibold uppercase">{sDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-xl font-bold leading-tight">{sDate.getDate()}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="violet" size="sm">{session.topic || 'General'}</Badge>
                      <Badge variant={session.status === 'completed' ? 'green' : 'coral'} size="sm">
                        {session.status}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-plum-900">{session.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock size={14} className="text-violet-500" /> {session.time || '10:00 AM'} ({session.duration || 60} min)
                      </span>
                      <span>Host: <strong className="text-plum-900">{isHost ? 'You' : hostName}</strong></span>
                      <span className="flex items-center gap-1 text-gray-400">
                        <Users size={14} /> {session.participants?.length || 1} joined
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {session.status !== 'completed' && !isHost && !isParticipant && (
                    <Button onClick={() => handleJoin(session._id)} variant="secondary">
                      Join Session
                    </Button>
                  )}
                  {session.status !== 'completed' && (isHost || isParticipant) && (
                    <a href="https://meet.google.com/new" target="_blank" rel="noreferrer">
                      <Button className="flex items-center gap-2">
                        <Video size={16} /> Open Meeting
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title={`No ${activeTab} sessions`}
          description={activeTab === 'upcoming' ? "You don't have any upcoming learning sessions scheduled." : "You have no past completed sessions."}
          action={
            activeTab === 'upcoming' && (
              <Button onClick={() => setIsModalOpen(true)}>
                Schedule Your First Session
              </Button>
            )
          }
        />
      )}

      {/* Schedule Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule a Learning Session">
        <form onSubmit={handleScheduleSubmit} className="space-y-4 mt-2">
          <Input
            label="Session Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Python Async Crash Course"
          />
          <Input
            label="Topic / Skill"
            required
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            placeholder="e.g. Python"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <Input
              label="Time"
              type="time"
              required
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
          </div>
          <Input
            label="Duration (minutes)"
            type="number"
            min="15"
            max="180"
            required
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
          />
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Schedule</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sessions;
