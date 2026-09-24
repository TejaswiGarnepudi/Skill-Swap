import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import api from '../api/axios';
import EmptyState from '../components/common/EmptyState';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { MessageSquare, Send, Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Messages = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Fetch groups user is a member of
  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        const res = await api.get('/groups');
        const allGroups = Array.isArray(res.data) ? res.data : res.data?.groups || [];
        const myGroups = allGroups.filter(g => 
          g.members?.some(m => (m.user?._id || m.user || m) === user?._id) ||
          (g.creator?._id || g.creator) === user?._id
        );
        setGroups(myGroups);
        if (myGroups.length > 0) {
          setSelectedGroup(myGroups[0]);
        }
      } catch (error) {
        console.error('Failed to load user groups', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserGroups();
  }, [user]);

  // Load message history when group changes
  useEffect(() => {
    if (!selectedGroup) return;

    const fetchMessages = async () => {
      setMessagesLoading(true);
      try {
        const res = await api.get(`/groups/${selectedGroup._id}/messages`);
        setMessages(Array.isArray(res.data) ? res.data : []);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'auto' }), 100);
      } catch (error) {
        console.error('Failed to load messages', error);
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();
  }, [selectedGroup]);

  // Socket listener for incoming messages
  useEffect(() => {
    if (!socket || !selectedGroup) return;

    socket.emit('join-group', selectedGroup._id);

    const handleNewMessage = (msg) => {
      if (msg.group === selectedGroup._id || msg.group?._id === selectedGroup._id) {
        setMessages((prev) => [...prev, msg]);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    };

    socket.on('new-message', handleNewMessage);

    return () => {
      socket.emit('leave-group', selectedGroup._id);
      socket.off('new-message', handleNewMessage);
    };
  }, [socket, selectedGroup]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !selectedGroup) return;

    socket.emit('group-message', {
      groupId: selectedGroup._id,
      content: newMessage.trim(),
      type: 'message'
    });

    setNewMessage('');
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col md:flex-row bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-soft">
      {/* Sidebar / Groups List */}
      <div className="w-full md:w-80 border-r border-gray-100 flex flex-col bg-gray-50/40">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-bold text-plum-900 flex items-center gap-2">
            <MessageSquare size={18} className="text-violet-600" />
            Group Chats
          </h2>
          <span className="text-xs bg-violet-100 text-violet-700 font-semibold px-2 py-0.5 rounded-full">
            {groups.length}
          </span>
        </div>

        <div className="flex-grow overflow-y-auto p-2 space-y-1">
          {groups.length > 0 ? (
            groups.map((group) => {
              const isSelected = selectedGroup?._id === group._id;
              return (
                <button
                  key={group._id}
                  onClick={() => setSelectedGroup(group)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all flex items-center gap-3 ${
                    isSelected 
                      ? 'bg-violet-50 border border-violet-200 text-violet-900 shadow-sm' 
                      : 'hover:bg-lavender-100/60 text-plum-900'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 font-bold flex items-center justify-center flex-shrink-0 text-sm">
                    {group.name.charAt(0)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="font-semibold text-sm truncate">{group.name}</h4>
                    </div>
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                      <Users size={12} /> {group.skill} • {group.members?.length || 1} members
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-500 mb-3">You haven't joined any groups yet.</p>
              <Link to="/groups">
                <Button size="sm" variant="secondary">Browse Groups</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-grow flex flex-col bg-white">
        {selectedGroup ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500 text-white font-bold flex items-center justify-center">
                  {selectedGroup.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-plum-900 text-base">{selectedGroup.name}</h3>
                  <p className="text-xs text-gray-400">Skill Circle: {selectedGroup.skill}</p>
                </div>
              </div>
              <Link to={`/groups/${selectedGroup._id}`}>
                <Button size="sm" variant="ghost">Group Dashboard →</Button>
              </Link>
            </div>

            {/* Message Feed */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-lavender-50/20">
              {messagesLoading ? (
                <LoadingSpinner />
              ) : messages.length > 0 ? (
                messages.map((msg) => {
                  const isMe = (msg.sender?._id || msg.sender) === user?._id;
                  const senderName = msg.sender?.name || 'Learner';
                  return (
                    <div key={msg._id} className={`flex gap-3 items-end ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isMe && <Avatar name={senderName} src={msg.sender?.avatar} size="sm" />}
                      <div className={`max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        {!isMe && <span className="text-xs text-gray-400 mb-1 ml-1">{senderName}</span>}
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm ${
                            isMe
                              ? 'bg-violet-500 text-white rounded-br-xs'
                              : 'bg-white text-plum-900 shadow-sm border border-gray-100 rounded-bl-xs'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <Sparkles size={32} className="mx-auto mb-2 text-violet-300" />
                  <p className="text-sm font-medium">No messages yet in this group.</p>
                  <p className="text-xs">Start the conversation and say hello!</p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2 bg-white">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message #${selectedGroup.name}...`}
                className="flex-grow px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-500 text-sm"
              />
              <Button type="submit" disabled={!newMessage.trim()} className="px-5">
                <Send size={16} />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center p-8 bg-lavender-50/30">
            <EmptyState
              icon={MessageSquare}
              title="No group selected"
              description="Select a group from the sidebar to chat with peers in real-time."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
