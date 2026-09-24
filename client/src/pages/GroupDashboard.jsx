import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import SkillTag from '../components/common/SkillTag';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { 
  MessageSquare, 
  CheckSquare, 
  BookOpen, 
  Link as LinkIcon, 
  Users, 
  UserCheck, 
  Plus, 
  Send, 
  Check, 
  X, 
  Clock,
  UserPlus,
  Trash2,
  Calendar,
  Video,
  Target
} from 'lucide-react';

const GroupDashboard = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Pending join requests for this group (if creator)
  const [pendingRequests, setPendingRequests] = useState([]);
  const [processingReqId, setProcessingReqId] = useState(null);

  // Group Sessions
  const [groupSessions, setGroupSessions] = useState([]);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [schedulingSession, setSchedulingSession] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    title: '',
    topic: '',
    date: '',
    time: '',
    duration: 60
  });

  // Goal modal for host
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');
  const [savingGoal, setSavingGoal] = useState(false);

  // Join modal for visitors
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [submittingJoin, setSubmittingJoin] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Task & Resource modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [resTitle, setResTitle] = useState('');
  const [resUrl, setResUrl] = useState('');
  const chatEndRef = useRef(null);

  const fetchGroupData = async () => {
    try {
      const res = await api.get(`/groups/${id}`);
      setGroup(res.data);
      setSessionForm(prev => ({ ...prev, topic: res.data.skill || '' }));

      const isHost = (res.data.creator?._id || res.data.creator) === user?._id;
      if (isHost) {
        // Fetch pending join requests for the group creator
        const reqRes = await api.get(`/groups/${id}/requests`);
        setPendingRequests(Array.isArray(reqRes.data) ? reqRes.data : []);
      } else {
        // Check if current visitor has sent a join request
        const myReqs = await api.get('/groups/my-requests');
        const reqList = Array.isArray(myReqs.data) ? myReqs.data : [];
        const isPending = reqList.some(r => (r.group?._id || r.group) === id && r.status === 'pending');
        setHasPendingRequest(isPending);
      }
    } catch (error) {
      console.error('Failed to fetch group data', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupSessions = async () => {
    try {
      const res = await api.get(`/sessions/group/${id}`);
      setGroupSessions(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch group sessions', error);
    }
  };

  useEffect(() => {
    fetchGroupData();
    fetchGroupSessions();
  }, [id, user]);

  // Load message history if member
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/groups/${id}/messages`);
        setMessages(Array.isArray(res.data) ? res.data : []);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'auto' }), 100);
      } catch (error) {
        console.error('Failed to load messages', error);
      }
    };
    if (id && group) {
      const isMember = group.members?.some(m => (m.user?._id || m.user || m) === user?._id);
      if (isMember) fetchMessages();
    }
  }, [id, group, user]);

  // Socket room connection
  useEffect(() => {
    if (socket && group) {
      socket.emit('join-group', id);

      const handleNewMessage = (message) => {
        if (message.group === id || message.group?._id === id) {
          setMessages((prev) => [...prev, message]);
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }
      };

      socket.on('new-message', handleNewMessage);

      return () => {
        socket.emit('leave-group', id);
        socket.off('new-message', handleNewMessage);
      };
    }
  }, [socket, group, id]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('group-message', {
      groupId: id,
      content: newMessage.trim(),
      type: 'message'
    });

    setNewMessage('');
  };

  const handleSendJoinRequest = async (e) => {
    e.preventDefault();
    setSubmittingJoin(true);
    try {
      await api.post(`/groups/${id}/join-request`, { message: joinMessage });
      setHasPendingRequest(true);
      setIsJoinModalOpen(false);
    } catch (error) {
      console.error('Failed to request join', error);
    } finally {
      setSubmittingJoin(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setProcessingReqId(requestId);
    try {
      await api.put(`/groups/requests/${requestId}/accept`);
      setPendingRequests(prev => prev.filter(r => r._id !== requestId));
      fetchGroupData();
    } catch (error) {
      console.error('Failed to accept request', error);
    } finally {
      setProcessingReqId(null);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setProcessingReqId(requestId);
    try {
      await api.put(`/groups/requests/${requestId}/reject`);
      setPendingRequests(prev => prev.filter(r => r._id !== requestId));
    } catch (error) {
      console.error('Failed to reject request', error);
    } finally {
      setProcessingReqId(null);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await api.post(`/groups/${id}/leave`);
      fetchGroupData();
    } catch (error) {
      console.error('Failed to leave group', error);
    }
  };

  const handleDeleteGroup = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/groups/${id}`);
      navigate('/groups');
    } catch (error) {
      console.error('Failed to delete group', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Add learning goal (Host only)
  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    setSavingGoal(true);
    try {
      const res = await api.post(`/groups/${id}/goals`, { goal: newGoalText.trim() });
      setGroup(res.data);
      setNewGoalText('');
      setIsGoalModalOpen(false);
    } catch (error) {
      console.error('Failed to add goal', error);
    } finally {
      setSavingGoal(false);
    }
  };

  // Delete learning goal (Host only)
  const handleDeleteGoal = async (goalIndex) => {
    try {
      const res = await api.delete(`/groups/${id}/goals/${goalIndex}`);
      setGroup(res.data);
    } catch (error) {
      console.error('Failed to delete goal', error);
    }
  };

  // Create session for group (Host only)
  const handleScheduleGroupSession = async (e) => {
    e.preventDefault();
    setSchedulingSession(true);
    try {
      await api.post('/sessions', {
        ...sessionForm,
        group: id
      });
      setIsSessionModalOpen(false);
      setSessionForm({
        title: '',
        topic: group?.skill || '',
        date: '',
        time: '',
        duration: 60
      });
      fetchGroupSessions();
    } catch (error) {
      console.error('Failed to schedule session', error);
    } finally {
      setSchedulingSession(false);
    }
  };

  const handleToggleTask = async (taskIndex) => {
    try {
      await api.put(`/groups/${id}/tasks/${taskIndex}`);
      fetchGroupData();
    } catch (error) {
      console.error('Failed to toggle task', error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/groups/${id}/tasks`, { title: taskTitle, description: taskDesc });
      setIsTaskModalOpen(false);
      setTaskTitle('');
      setTaskDesc('');
      fetchGroupData();
    } catch (error) {
      console.error('Failed to add task', error);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/groups/${id}/resources`, { title: resTitle, url: resUrl, type: 'link' });
      setIsResourceModalOpen(false);
      setResTitle('');
      setResUrl('');
      fetchGroupData();
    } catch (error) {
      console.error('Failed to add resource', error);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!group) return <div className="text-center py-12 text-gray-500">Group not found.</div>;

  const isMember = group.members?.some(m => (m.user?._id || m.user || m) === user?._id);
  const isCreator = (group.creator?._id || group.creator) === user?._id;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'sessions', label: `Sessions (${groupSessions.length})`, icon: Calendar },
    { id: 'discussion', label: 'Discussion', icon: MessageSquare, badge: isMember ? null : 'Members Only' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'resources', label: 'Resources', icon: LinkIcon },
    { id: 'members', label: `Members (${group.members?.length || 1})`, icon: Users },
    ...(isCreator ? [{ id: 'requests', label: `Join Requests (${pendingRequests.length})`, icon: UserCheck, count: pendingRequests.length }] : [])
  ];

  return (
    <div className="space-y-6">
      {/* Group Header */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-card border border-gray-100 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="violet">{group.skill}</Badge>
              <Badge variant="coral" className="capitalize">{group.difficulty || 'beginner'}</Badge>
              <Badge variant="yellow">{group.category || 'General'}</Badge>
            </div>
            <h1 className="text-3xl font-bold text-plum-900 mb-2">{group.name}</h1>
            <p className="text-gray-500 max-w-2xl text-sm leading-relaxed">{group.description}</p>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <div className="text-xs text-gray-500 bg-lavender-50 px-4 py-2 rounded-xl font-medium border border-lavender-200">
              <span className="font-bold text-plum-900">{group.members?.length || 1}</span> / {group.maxMembers || 20} members
            </div>
            
            {isCreator ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-violet-700 bg-violet-100 font-bold px-3 py-2 rounded-xl flex items-center gap-1">
                  ⭐ Group Host
                </span>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="text-xs flex items-center gap-1.5 px-3 py-2"
                >
                  <Trash2 size={14} /> Delete Group
                </Button>
              </div>
            ) : isMember ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-green-700 bg-green-100 font-semibold px-3 py-1.5 rounded-xl">
                  ✓ Member
                </span>
                <Button variant="ghost" onClick={handleLeaveGroup} className="text-xs text-red-500 hover:text-red-700 py-1 px-2">
                  Leave
                </Button>
              </div>
            ) : hasPendingRequest ? (
              <div className="flex items-center gap-1.5 py-2 px-3 bg-yellow-50 text-yellow-700 rounded-xl text-xs font-semibold border border-yellow-200">
                <Clock size={14} /> Join Request Pending
              </div>
            ) : (
              <Button onClick={() => setIsJoinModalOpen(true)} className="flex items-center gap-1.5">
                <UserPlus size={16} /> Request to Join Group
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-violet-500 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {tab.count > 0 && (
                  <span className="bg-coral-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content Area */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card min-h-[450px]">
        
        {/* 1. Overview Tab (With Host Add Goals Feature) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-plum-900 flex items-center gap-2">
                  <Target size={20} className="text-violet-600" />
                  Specific Learning Goals
                </h3>
                {isCreator && (
                  <Button size="sm" onClick={() => setIsGoalModalOpen(true)} className="flex items-center gap-1 text-xs">
                    <Plus size={14} /> Add Goal
                  </Button>
                )}
              </div>

              {group.goals?.length > 0 ? (
                <div className="space-y-2.5">
                  {group.goals.map((goal, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-lavender-50/60 rounded-2xl border border-lavender-100">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-violet-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-plum-900">{goal}</span>
                      </div>
                      {isCreator && (
                        <button
                          onClick={() => handleDeleteGoal(idx)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg"
                          title="Remove Goal"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-lavender-50/40 rounded-2xl text-center">
                  <p className="text-sm text-gray-500 mb-2">No specific learning goals defined for this group yet.</p>
                  {isCreator && (
                    <Button size="sm" variant="secondary" onClick={() => setIsGoalModalOpen(true)}>
                      + Define First Learning Goal
                    </Button>
                  )}
                </div>
              )}
            </div>

            {group.roadmap?.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-bold text-plum-900 mb-4">Curriculum Roadmap</h3>
                <div className="space-y-3">
                  {group.roadmap.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-3 bg-lavender-50/60 rounded-xl">
                      <span className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                        D{item.day || idx + 1}
                      </span>
                      <div>
                        <h4 className="font-semibold text-sm text-plum-900">{item.title}</h4>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Group Sessions Tab (With Host Create Session Feature) */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-plum-900">Group Study Sessions</h3>
                <p className="text-xs text-gray-500 mt-0.5">Live meetings and study classes for this group</p>
              </div>
              {isCreator && (
                <Button size="sm" onClick={() => setIsSessionModalOpen(true)} className="flex items-center gap-1.5 text-xs">
                  <Plus size={14} /> Schedule Group Session
                </Button>
              )}
            </div>

            {groupSessions.length > 0 ? (
              <div className="grid gap-4">
                {groupSessions.map((session) => {
                  const sDate = session.date ? new Date(session.date) : new Date();
                  const isHost = (session.host?._id || session.host) === user?._id;
                  return (
                    <div key={session._id} className="p-5 bg-lavender-50/40 rounded-2xl border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex gap-4 items-start">
                        <div className="w-14 h-14 bg-violet-100 text-violet-700 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 font-bold">
                          <span className="text-[10px] uppercase font-semibold">{sDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                          <span className="text-lg leading-tight">{sDate.getDate()}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="violet" size="sm">{session.topic}</Badge>
                            <Badge variant={session.status === 'completed' ? 'green' : 'coral'} size="sm">
                              {session.status}
                            </Badge>
                          </div>
                          <h4 className="font-bold text-plum-900 text-base">{session.title}</h4>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                            <span className="flex items-center gap-1 font-medium">
                              <Clock size={12} className="text-violet-600" /> {session.time || '10:00 AM'} ({session.duration} min)
                            </span>
                            <span>Host: <strong>{isHost ? 'You' : session.host?.name || 'Group Host'}</strong></span>
                            <span>{session.participants?.length || 1} members attending</span>
                          </p>
                        </div>
                      </div>

                      <div>
                        {session.status !== 'completed' && (
                          <a href="https://meet.google.com/new" target="_blank" rel="noreferrer">
                            <Button size="sm" className="flex items-center gap-1.5 text-xs">
                              <Video size={14} /> Open Meeting
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <Calendar size={36} className="mx-auto mb-2 text-violet-300" />
                <p className="text-sm font-medium">No sessions scheduled for this group yet.</p>
                {isCreator && (
                  <Button size="sm" onClick={() => setIsSessionModalOpen(true)} className="mt-3">
                    Schedule Your First Group Session
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. Join Requests Tab (Creator / Admin Only) */}
        {activeTab === 'requests' && isCreator && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-plum-900">Pending Join Requests</h3>
              <span className="text-xs text-gray-400">Review learner profiles before approving membership</span>
            </div>

            {pendingRequests.length > 0 ? (
              <div className="grid gap-4">
                {pendingRequests.map((req) => {
                  const requester = req.requester || {};
                  return (
                    <div key={req._id} className="p-5 rounded-2xl border border-gray-100 bg-lavender-50/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex gap-4 items-start">
                        <Avatar name={requester.name} src={requester.avatar} size="lg" />
                        <div>
                          <h4 className="font-bold text-plum-900 text-base">{requester.name}</h4>
                          <p className="text-xs text-gray-500 mb-2">{requester.bio || 'Learner'}</p>
                          
                          {req.message && (
                            <p className="text-xs text-gray-700 bg-white p-2.5 rounded-xl border border-gray-100 mb-2 italic">
                              "{req.message}"
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2 text-xs">
                            {requester.skillsToTeach?.length > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="font-semibold text-violet-700">Teaches:</span>
                                {requester.skillsToTeach.slice(0, 2).map((s, i) => (
                                  <SkillTag key={i} name={s.name} variant="teach" />
                                ))}
                              </div>
                            )}
                            {requester.skillsToLearn?.length > 0 && (
                              <div className="flex items-center gap-1 ml-2">
                                <span className="font-semibold text-coral-600">Learns:</span>
                                {requester.skillsToLearn.slice(0, 2).map((s, i) => (
                                  <SkillTag key={i} name={s.name} variant="learn" />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={processingReqId === req._id}
                          onClick={() => handleRejectRequest(req._id)}
                          className="text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                          <X size={16} /> Decline
                        </Button>
                        <Button
                          size="sm"
                          isLoading={processingReqId === req._id}
                          onClick={() => handleAcceptRequest(req._id)}
                          className="flex items-center gap-1"
                        >
                          <Check size={16} /> Approve & Add
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <UserCheck size={36} className="mx-auto mb-2 text-violet-300" />
                <p className="text-sm font-medium">No pending join requests.</p>
                <p className="text-xs">When learners request to join your group, they will appear here.</p>
              </div>
            )}
          </div>
        )}

        {/* 4. Discussion Tab */}
        {activeTab === 'discussion' && (
          isMember ? (
            <div className="flex flex-col h-[500px]">
              <div className="flex-grow overflow-y-auto space-y-4 p-4 bg-lavender-50/40 rounded-2xl mb-4">
                {messages.length > 0 ? (
                  messages.map((msg, idx) => {
                    const isMine = (msg.sender?._id || msg.sender) === user?._id;
                    const senderName = msg.sender?.name || 'Learner';
                    return (
                      <div key={msg._id || idx} className={`flex gap-3 items-end ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isMine && <Avatar name={senderName} src={msg.sender?.avatar} size="sm" />}
                        <div className={`max-w-[70%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                          {!isMine && <span className="text-xs text-gray-400 mb-1 ml-1">{senderName}</span>}
                          <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMine ? 'bg-violet-500 text-white rounded-br-xs' : 'bg-white text-plum-900 shadow-sm border border-gray-100 rounded-bl-xs'}`}>
                            {msg.content}
                          </div>
                          <span className="text-[10px] text-gray-400 mt-1 px-1">
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-20 text-gray-400">
                    <MessageSquare size={36} className="mx-auto mb-2 text-violet-300" />
                    <p className="text-sm font-medium">No messages yet in this group.</p>
                    <p className="text-xs">Say hello to your fellow learners!</p>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ask a question or share something with the group..."
                  className="flex-grow rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-violet-200 focus:border-violet-500 outline-none text-sm"
                />
                <Button type="submit" disabled={!newMessage.trim()}>
                  <Send size={16} />
                </Button>
              </form>
            </div>
          ) : (
            <div className="text-center py-16">
              <MessageSquare size={36} className="mx-auto mb-3 text-gray-300" />
              <h3 className="text-lg font-bold text-plum-900 mb-1">Group Chat is for Members</h3>
              <p className="text-sm text-gray-500 mb-4">Request to join this group to take part in discussions and collaborate.</p>
              {!hasPendingRequest && (
                <Button onClick={() => setIsJoinModalOpen(true)}>Request to Join</Button>
              )}
            </div>
          )
        )}

        {/* 5. Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-plum-900">Group Tasks & Milestones</h3>
              {isMember && (
                <Button size="sm" onClick={() => setIsTaskModalOpen(true)} className="flex items-center gap-1">
                  <Plus size={14} /> Add Task
                </Button>
              )}
            </div>

            {group.tasks?.length > 0 ? (
              <div className="space-y-2">
                {group.tasks.map((task, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-lavender-50/60 rounded-xl border border-lavender-100">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        disabled={!isMember}
                        onChange={() => handleToggleTask(idx)}
                        className="w-5 h-5 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
                      />
                      <div>
                        <h4 className={`text-sm font-semibold ${task.completed ? 'line-through text-gray-400' : 'text-plum-900'}`}>
                          {task.title}
                        </h4>
                        {task.description && <p className="text-xs text-gray-500">{task.description}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No tasks added yet.</p>
            )}
          </div>
        )}

        {/* 6. Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-plum-900">Shared Study Resources</h3>
              {isMember && (
                <Button size="sm" onClick={() => setIsResourceModalOpen(true)} className="flex items-center gap-1">
                  <Plus size={14} /> Add Resource
                </Button>
              )}
            </div>

            {group.resources?.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {group.resources.map((res, idx) => (
                  <a key={idx} href={res.url} target="_blank" rel="noreferrer" className="block p-4 rounded-xl border border-gray-100 bg-lavender-50/50 hover:bg-violet-50 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg text-violet-600 shadow-xs">
                        <LinkIcon size={16} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-plum-900 line-clamp-1">{res.title}</h4>
                        <p className="text-xs text-gray-400 truncate mt-1">{res.url}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No shared resources yet.</p>
            )}
          </div>
        )}

        {/* 7. Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-plum-900 mb-4">Active Members ({group.members?.length || 1})</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {group.creator && (
                <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-violet-100 bg-violet-50/30">
                  <Avatar src={group.creator?.avatar} name={group.creator?.name || 'Host'} />
                  <div>
                    <p className="font-bold text-sm text-plum-900">{group.creator?.name}</p>
                    <Badge size="sm" variant="violet">Group Host</Badge>
                  </div>
                </div>
              )}
              {group.members?.filter(m => (m.user?._id || m.user) !== (group.creator?._id || group.creator)).map((m, idx) => {
                const memberUser = m.user || {};
                return (
                  <div key={idx} className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-100 bg-white">
                    <Avatar src={memberUser.avatar} name={memberUser.name || 'Member'} />
                    <div>
                      <p className="font-medium text-sm text-plum-900">{memberUser.name || 'Member'}</p>
                      <span className="text-xs text-gray-400">Learner</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Host Add Goal Modal */}
      <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Add Specific Learning Goal">
        <form onSubmit={handleAddGoal} className="space-y-4 mt-2">
          <Input
            label="Learning Goal / Milestone"
            required
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            placeholder="e.g. Build and deploy a real-time fullstack application"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsGoalModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={savingGoal}>Add Goal</Button>
          </div>
        </form>
      </Modal>

      {/* Host Schedule Session Modal */}
      <Modal isOpen={isSessionModalOpen} onClose={() => setIsSessionModalOpen(false)} title="Schedule Group Session">
        <form onSubmit={handleScheduleGroupSession} className="space-y-4 mt-2">
          <Input
            label="Session Title"
            required
            value={sessionForm.title}
            onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
            placeholder="e.g. Live Code Review & Debugging"
          />
          <Input
            label="Topic / Focus"
            required
            value={sessionForm.topic}
            onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })}
            placeholder="e.g. React & State Management"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              required
              value={sessionForm.date}
              onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
            />
            <Input
              label="Time"
              type="time"
              required
              value={sessionForm.time}
              onChange={(e) => setSessionForm({ ...sessionForm, time: e.target.value })}
            />
          </div>
          <Input
            label="Duration (minutes)"
            type="number"
            min="15"
            max="180"
            required
            value={sessionForm.duration}
            onChange={(e) => setSessionForm({ ...sessionForm, duration: Number(e.target.value) })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsSessionModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={schedulingSession}>Schedule & Notify Members</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Group Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Learning Group">
        <div className="space-y-4 mt-2">
          <p className="text-sm text-gray-600">
            Are you sure you want to permanently delete <strong className="text-plum-900">"{group.name}"</strong>?
          </p>
          <div className="p-3.5 bg-red-50 text-red-700 rounded-xl text-xs border border-red-100">
            ⚠️ This action is permanent. All group discussions, task milestones, and shared resources will be removed, and all members will be unassigned.
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteGroup} isLoading={isDeleting} className="flex items-center gap-1">
              <Trash2 size={16} /> Yes, Delete Group
            </Button>
          </div>
        </div>
      </Modal>

      {/* Join Request Modal */}
      <Modal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} title={`Request to Join: ${group.name}`}>
        <form onSubmit={handleSendJoinRequest} className="space-y-4 mt-2">
          <p className="text-sm text-gray-600">
            Send an introductory note to the group creator (<strong className="text-plum-900">{group.creator?.name || 'Host'}</strong>).
          </p>
          <Input
            label="Introductory Note"
            isTextarea
            rows={3}
            value={joinMessage}
            onChange={(e) => setJoinMessage(e.target.value)}
            placeholder="Tell the host what you hope to learn or contribute..."
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsJoinModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={submittingJoin}>Send Request</Button>
          </div>
        </form>
      </Modal>

      {/* Task Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Add Group Task">
        <form onSubmit={handleAddTask} className="space-y-4 mt-2">
          <Input label="Task Title" required value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="e.g. Build weather app component" />
          <Input label="Description (optional)" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} placeholder="Task details and deliverables" />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
            <Button type="submit">Add Task</Button>
          </div>
        </form>
      </Modal>

      {/* Resource Modal */}
      <Modal isOpen={isResourceModalOpen} onClose={() => setIsResourceModalOpen(false)} title="Share a Resource">
        <form onSubmit={handleAddResource} className="space-y-4 mt-2">
          <Input label="Resource Title" required value={resTitle} onChange={(e) => setResTitle(e.target.value)} placeholder="e.g. React Patterns Cheat Sheet" />
          <Input label="URL Link" type="url" required value={resUrl} onChange={(e) => setResUrl(e.target.value)} placeholder="https://..." />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsResourceModalOpen(false)}>Cancel</Button>
            <Button type="submit">Share Resource</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GroupDashboard;
