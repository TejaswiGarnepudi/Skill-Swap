import React, { useState, useEffect } from 'react';
import { Users, Filter, Plus, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import GroupCard from '../components/groups/GroupCard';
import SearchBar from '../components/common/SearchBar';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { SKILL_CATEGORIES, DIFFICULTY_LEVELS } from '../utils/constants';

const Groups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [pendingGroupIds, setPendingGroupIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Join modal state
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState('');

  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    skill: '',
    category: SKILL_CATEGORIES[0] || 'General',
    difficulty: 'beginner',
    maxMembers: 15,
    startDate: '',
    endDate: '',
    goals: ''
  });

  const fetchGroupsAndRequests = async () => {
    setLoading(true);
    try {
      const [groupsRes, myRequestsRes] = await Promise.allSettled([
        api.get('/groups'),
        api.get('/groups/my-requests')
      ]);

      if (groupsRes.status === 'fulfilled') {
        const gData = Array.isArray(groupsRes.value.data) ? groupsRes.value.data : groupsRes.value.data?.groups || [];
        setGroups(gData);
      }

      if (myRequestsRes.status === 'fulfilled') {
        const reqList = Array.isArray(myRequestsRes.value.data) ? myRequestsRes.value.data : [];
        const pendingIds = reqList
          .filter(r => r.status === 'pending')
          .map(r => r.group?._id || r.group);
        setPendingGroupIds(pendingIds);
      }
    } catch (error) {
      console.error('Failed to fetch groups', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupsAndRequests();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        ...createForm,
        goals: createForm.goals ? createForm.goals.split(',').map(g => g.trim()).filter(Boolean) : []
      };
      await api.post('/groups', payload);
      setIsCreateModalOpen(false);
      setCreateForm({
        name: '',
        description: '',
        skill: '',
        category: SKILL_CATEGORIES[0] || 'General',
        difficulty: 'beginner',
        maxMembers: 15,
        startDate: '',
        endDate: '',
        goals: ''
      });
      fetchGroupsAndRequests();
    } catch (error) {
      console.error('Failed to create group', error);
    } finally {
      setCreating(false);
    }
  };

  const handleOpenJoinModal = (group) => {
    setSelectedGroup(group);
    setJoinMessage(`Hi! I'd love to join your ${group.name} group.`);
    setRequestSuccess('');
    setIsJoinModalOpen(true);
  };

  const handleSendJoinRequest = async (e) => {
    e.preventDefault();
    if (!selectedGroup) return;
    setSendingRequest(true);
    try {
      await api.post(`/groups/${selectedGroup._id}/join-request`, {
        message: joinMessage
      });
      setRequestSuccess('Join request submitted! The group host will review your request.');
      setPendingGroupIds(prev => [...prev, selectedGroup._id]);
      setTimeout(() => {
        setIsJoinModalOpen(false);
        setRequestSuccess('');
      }, 1500);
    } catch (error) {
      console.error('Failed to send join request', error);
    } finally {
      setSendingRequest(false);
    }
  };

  const filteredGroups = groups.filter(g => {
    const matchesSearch = 
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      g.skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = !difficultyFilter || g.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-plum-900">Learning Groups</h1>
          <p className="text-gray-500 mt-1">Join study circles of peers learning together, or start your own.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus size={18} /> Create Group
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-3xl shadow-card border border-gray-100">
        <div className="flex-grow">
          <SearchBar placeholder="Search groups by topic, skill, or name..." onChange={setSearchTerm} />
        </div>
        <div className="flex gap-2 items-center">
          <select 
            className="rounded-xl border border-gray-200 px-4 py-2.5 bg-white text-sm outline-none focus:ring-2 focus:ring-violet-200"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="">All Levels</option>
            {DIFFICULTY_LEVELS.map(level => (
              <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredGroups.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map(group => (
            <GroupCard 
              key={group._id} 
              group={group} 
              pendingRequestIds={pendingGroupIds}
              onRequestJoin={handleOpenJoinModal}
            />
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={Users}
          title="No groups found"
          description={searchTerm || difficultyFilter ? "Try adjusting your search criteria." : "There are no learning groups yet. Be the first to start a learning circle!"}
          action={
            <Button onClick={() => setIsCreateModalOpen(true)}>Create the First Group</Button>
          }
        />
      )}

      {/* Create Group Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Learning Group"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 mt-2">
          <Input
            label="Group Name"
            required
            value={createForm.name}
            onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
            placeholder="e.g. Full-Stack React Bootcamp"
          />
          <Input
            label="Description"
            isTextarea
            required
            rows={3}
            value={createForm.description}
            onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
            placeholder="What will members learn and build together in this group?"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Skill / Topic"
              required
              value={createForm.skill}
              onChange={(e) => setCreateForm({...createForm, skill: e.target.value})}
              placeholder="e.g. React.js"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-plum-900">Difficulty</label>
              <select 
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 bg-white focus:ring-2 focus:ring-violet-200 outline-none text-sm"
                value={createForm.difficulty}
                onChange={(e) => setCreateForm({...createForm, difficulty: e.target.value})}
              >
                {DIFFICULTY_LEVELS.map(level => (
                  <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={createForm.startDate}
              onChange={(e) => setCreateForm({...createForm, startDate: e.target.value})}
            />
            <Input
              label="Max Members"
              type="number"
              min="2"
              max="100"
              value={createForm.maxMembers}
              onChange={(e) => setCreateForm({...createForm, maxMembers: Number(e.target.value)})}
            />
          </div>
          <Input
            label="Learning Goals (comma separated)"
            value={createForm.goals}
            onChange={(e) => setCreateForm({...createForm, goals: e.target.value})}
            placeholder="Build 3 projects, Master state management, Code review weekly"
          />
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={creating}>Create Group</Button>
          </div>
        </form>
      </Modal>

      {/* Join Request Modal */}
      <Modal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} title={`Request to Join: ${selectedGroup?.name}`}>
        {requestSuccess ? (
          <div className="text-center py-6">
            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
            <h3 className="font-bold text-plum-900 text-lg">{requestSuccess}</h3>
            <p className="text-sm text-gray-500 mt-1">The group host has been notified.</p>
          </div>
        ) : (
          <form onSubmit={handleSendJoinRequest} className="space-y-4 mt-2">
            <p className="text-sm text-gray-600">
              This group requires approval from the creator (<strong className="text-plum-900">{selectedGroup?.creator?.name || 'Group Host'}</strong>).
            </p>
            <Input
              label="Introductory Message"
              isTextarea
              rows={3}
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              placeholder="Tell the host why you'd like to join and what skills you want to learn/share..."
            />
            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsJoinModalOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={sendingRequest}>Submit Join Request</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Groups;
