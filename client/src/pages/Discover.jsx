import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import SearchBar from '../components/common/SearchBar';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import SkillTag from '../components/common/SkillTag';
import GroupCard from '../components/groups/GroupCard';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { Users, Sparkles, BookOpen, UserPlus, CheckCircle2 } from 'lucide-react';

const Discover = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('people');
  const [searchTerm, setSearchTerm] = useState('');
  const [people, setPeople] = useState([]);
  const [groups, setGroups] = useState([]);
  const [pendingGroupIds, setPendingGroupIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Join request modal state
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, groupsRes, myRequestsRes] = await Promise.allSettled([
        api.get(`/users/search?q=${encodeURIComponent(searchTerm)}`),
        api.get(`/groups?q=${encodeURIComponent(searchTerm)}`),
        api.get('/groups/my-requests')
      ]);

      if (usersRes.status === 'fulfilled') {
        const uList = Array.isArray(usersRes.value.data) ? usersRes.value.data : [];
        // Strictly ensure the current logged-in user's MongoDB _id is excluded
        const filteredPeople = uList.filter(p => p._id !== user?._id);
        setPeople(filteredPeople);
      }

      if (groupsRes.status === 'fulfilled') {
        setGroups(Array.isArray(groupsRes.value.data) ? groupsRes.value.data : []);
      }

      if (myRequestsRes.status === 'fulfilled') {
        const reqList = Array.isArray(myRequestsRes.value.data) ? myRequestsRes.value.data : [];
        const pendingIds = reqList
          .filter(r => r.status === 'pending')
          .map(r => r.group?._id || r.group);
        setPendingGroupIds(pendingIds);
      }
    } catch (error) {
      console.error('Failed to fetch discover data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, user]);

  const handleOpenJoinModal = (group) => {
    setSelectedGroup(group);
    setJoinMessage(`Hi! I'd like to join your learning circle for ${group.skill}.`);
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

  // Extract all unique skills across real people in the database
  const allSkills = Array.from(
    new Set(
      people.flatMap(p => [
        ...(p.skillsToTeach || []).map(s => s.name),
        ...(p.skillsToLearn || []).map(s => s.name)
      ])
    )
  ).filter(Boolean);

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-plum-900 mb-3">Discover Opportunities</h1>
        <p className="text-gray-600 mb-6">Search for skills, find learning partners, or join study groups.</p>
        
        <div className="relative max-w-xl mx-auto">
          <SearchBar 
            placeholder="Search for skills, topics, or names..." 
            onChange={(val) => setSearchTerm(val)} 
            className="bg-white rounded-2xl shadow-soft" 
          />
        </div>
      </div>

      <div className="border-b border-gray-200 flex justify-center">
        <nav className="flex space-x-8">
          {[
            { id: 'people', label: 'Explore People', icon: Users },
            { id: 'groups', label: 'Explore Groups', icon: BookOpen },
            { id: 'skills', label: 'Explore Skills', icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-semibold text-sm flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-violet-500 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* People Tab */}
          {activeTab === 'people' && (
            <div>
              {people.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {people.map((person) => (
                    <div key={person._id} className="bg-white p-6 rounded-2xl shadow-card border border-gray-100 hover:shadow-hover transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar name={person.name} src={person.avatar} size="lg" />
                          <div>
                            <h3 className="font-bold text-plum-900 text-base">{person.name}</h3>
                            <p className="text-xs text-gray-500 line-clamp-1">{person.bio || 'SkillSwap Member'}</p>
                          </div>
                        </div>

                        <div className="space-y-3 mb-6">
                          {person.skillsToTeach?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-violet-700 uppercase tracking-wider mb-1.5">Teaches</p>
                              <div className="flex gap-1.5 flex-wrap">
                                {person.skillsToTeach.map((s, i) => (
                                  <SkillTag key={i} name={s.name} variant="teach" />
                                ))}
                              </div>
                            </div>
                          )}

                          {person.skillsToLearn?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-coral-600 uppercase tracking-wider mb-1.5">Wants to Learn</p>
                              <div className="flex gap-1.5 flex-wrap">
                                {person.skillsToLearn.map((s, i) => (
                                  <SkillTag key={i} name={s.name} variant="learn" />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <Link to={`/profile/${person._id}`} className="w-full">
                        <Button fullWidth variant="secondary">View Profile</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={Users} 
                  title="No other learners found yet" 
                  description={searchTerm ? "Try searching for a different skill or name." : "You're among the first members! When new learners register, they will appear here."} 
                />
              )}
            </div>
          )}

          {/* Groups Tab */}
          {activeTab === 'groups' && (
            <div>
              {groups.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groups.map((group) => (
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
                  icon={BookOpen} 
                  title="No groups found" 
                  description={searchTerm ? "Try searching with different keywords." : "No learning groups available right now. Why not create one?"}
                  action={
                    <Link to="/groups">
                      <Button>Create a Group</Button>
                    </Link>
                  }
                />
              )}
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div>
              {allSkills.length > 0 ? (
                <div className="bg-white p-8 rounded-3xl shadow-card border border-gray-100">
                  <h3 className="text-lg font-bold text-plum-900 mb-4">Skills Offered & Requested in Community</h3>
                  <div className="flex flex-wrap gap-3">
                    {allSkills.map((skill, idx) => (
                      <button 
                        key={idx}
                        onClick={() => {
                          setSearchTerm(skill);
                          setActiveTab('people');
                        }}
                        className="px-4 py-2 rounded-2xl bg-lavender-100 hover:bg-violet-100 text-plum-900 hover:text-violet-700 font-medium text-sm transition-all border border-lavender-200"
                      >
                        ⚡ {skill}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState 
                  icon={Sparkles} 
                  title="No skills listed yet" 
                  description="Add skills to your profile to help populate the community skill directory." 
                />
              )}
            </div>
          )}
        </>
      )}

      {/* Group Join Request Modal */}
      <Modal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} title={`Request to Join: ${selectedGroup?.name}`}>
        {requestSuccess ? (
          <div className="text-center py-6">
            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
            <h3 className="font-bold text-plum-900 text-lg">{requestSuccess}</h3>
            <p className="text-sm text-gray-500 mt-1">You will become a member once approved.</p>
          </div>
        ) : (
          <form onSubmit={handleSendJoinRequest} className="space-y-4 mt-2">
            <p className="text-sm text-gray-600">
              This group requires approval from the creator (<strong className="text-plum-900">{selectedGroup?.creator?.name || 'Group Host'}</strong>).
            </p>
            <Input
              label="Introductory Note"
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

export default Discover;
