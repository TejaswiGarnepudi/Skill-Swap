import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import MatchCard from '../components/matching/MatchCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Users, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const SkillMatches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    skillToLearn: '',
    skillToTeach: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get('/matching');
        const mData = Array.isArray(res.data) ? res.data : res.data?.matches || [];
        setMatches(mData);
      } catch (error) {
        console.error('Failed to fetch matches', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const handleOpenModal = (match) => {
    setSelectedMatch(match);
    setRequestForm({
      skillToLearn: match.canTeachYou?.[0] || '',
      skillToTeach: match.canLearnFromYou?.[0] || user?.skillsToTeach?.[0]?.name || '',
      message: `Hi ${match.user.name}, I would love to exchange skills with you!`
    });
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleSendSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMatch) return;
    setSending(true);
    try {
      await api.post('/exchanges', {
        to: selectedMatch.user.id || selectedMatch.user._id,
        skillToLearn: requestForm.skillToLearn,
        skillToTeach: requestForm.skillToTeach,
        message: requestForm.message
      });
      setSuccessMsg('Exchange request sent successfully!');
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg('');
      }, 1500);
    } catch (error) {
      console.error('Failed to send exchange request', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-plum-900">Find Your Skill Match</h1>
        <p className="text-gray-500 mt-2">Discover peers whose teaching skills match what you want to learn, and vice versa.</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : matches.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match, idx) => (
            <MatchCard key={idx} match={match} onSendRequest={() => handleOpenModal(match)} />
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={Users}
          title="No skill matches found yet"
          description="Add more skills you want to learn and skills you can teach in your profile to find matches."
        />
      )}

      {/* Exchange Request Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Skill Exchange with ${selectedMatch?.user.name}`}>
        {successMsg ? (
          <div className="text-center py-6">
            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
            <h3 className="font-bold text-plum-900 text-lg">{successMsg}</h3>
            <p className="text-sm text-gray-500 mt-1">They will be notified to accept your request.</p>
          </div>
        ) : (
          <form onSubmit={handleSendSubmit} className="space-y-4 mt-2">
            <Input
              label="Skill I want to learn"
              required
              value={requestForm.skillToLearn}
              onChange={(e) => setRequestForm({ ...requestForm, skillToLearn: e.target.value })}
              placeholder="e.g. React"
            />
            <Input
              label="Skill I can teach in return"
              required
              value={requestForm.skillToTeach}
              onChange={(e) => setRequestForm({ ...requestForm, skillToTeach: e.target.value })}
              placeholder="e.g. Python"
            />
            <Input
              label="Optional Message"
              isTextarea
              rows={3}
              value={requestForm.message}
              onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
              placeholder="Let them know what your goals are..."
            />
            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={sending}>Send Request</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default SkillMatches;
