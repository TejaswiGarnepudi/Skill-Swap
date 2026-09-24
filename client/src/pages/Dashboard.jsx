import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { BookOpen, Users, Star, Clock, ArrowRight } from 'lucide-react';
import MatchCard from '../components/matching/MatchCard';
import ProgressBar from '../components/common/ProgressBar';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [groups, setGroups] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [matchesRes, groupsRes, sessionsRes] = await Promise.allSettled([
          api.get('/matching'),
          api.get('/groups'),
          api.get('/sessions')
        ]);
        
        if (matchesRes.status === 'fulfilled') {
          const mData = Array.isArray(matchesRes.value.data) ? matchesRes.value.data : matchesRes.value.data?.matches || [];
          setMatches(mData.slice(0, 3));
        }
        if (groupsRes.status === 'fulfilled') {
          const allGroups = Array.isArray(groupsRes.value.data) ? groupsRes.value.data : groupsRes.value.data?.groups || [];
          const userGroups = allGroups.filter(g => 
            g.members?.some(m => (m.user?._id || m.user || m) === user?._id) ||
            (g.creator?._id || g.creator) === user?._id
          );
          setGroups(userGroups.slice(0, 2));
        }
        if (sessionsRes.status === 'fulfilled') {
          const sData = Array.isArray(sessionsRes.value.data) ? sessionsRes.value.data : sessionsRes.value.data?.sessions || [];
          setSessions(sData.slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return <LoadingSpinner fullPage />;

  const firstName = user?.name ? user.name.split(' ')[0] : 'Learner';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-plum-900">{getGreeting()}, {firstName} 👋</h1>
        <p className="text-gray-500 mt-2">Here's what's happening with your learning journey today.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-plum-900">{user?.skillsToTeach?.length || 0}</p>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Teaching</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-coral-100 text-coral-600 rounded-xl flex items-center justify-center">
            <Star size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-plum-900">{user?.skillsToLearn?.length || 0}</p>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Learning</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
            <div className="font-bold text-xl">+</div>
          </div>
          <div>
            <p className="text-2xl font-bold text-plum-900">{user?.skillCredits ?? 5}</p>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Credits</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-plum-900">{groups.length}</p>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Groups</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Top Matches */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-plum-900">Recommended Matches</h2>
              <Link to="/matches" className="text-sm font-medium text-violet-600 hover:text-violet-700 flex items-center">
                View all <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
            
            {matches.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {matches.slice(0, 2).map((match, idx) => (
                  <MatchCard key={idx} match={match} onSendRequest={() => {}} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center">
                <p className="text-gray-500 mb-4">Complete your profile to get personalized match recommendations.</p>
                <Link to="/edit-profile">
                  <Button variant="secondary">Add Skills</Button>
                </Link>
              </div>
            )}
          </section>

          {/* Your Groups */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-plum-900">Your Learning Groups</h2>
              <Link to="/groups" className="text-sm font-medium text-violet-600 hover:text-violet-700 flex items-center">
                Explore <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
            
            {groups.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {groups.map((group) => (
                  <Link key={group._id} to={`/groups/${group._id}`} className="block">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-plum-900 group-hover:text-violet-600 transition-colors">{group.name}</h3>
                        <span className="bg-lavender-100 text-violet-700 text-xs px-2 py-1 rounded-md">{group.skill}</span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">{group.description}</p>
                      <div className="flex items-center text-xs text-gray-400 gap-4">
                        <span className="flex items-center"><Users size={14} className="mr-1"/> {group.members?.length || 1} members</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center">
                <p className="text-gray-500 mb-4">You haven't joined any groups yet.</p>
                <Link to="/groups">
                  <Button variant="secondary">Find a Group</Button>
                </Link>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar (1/3 width) */}
        <div className="space-y-8">
          
          {/* Upcoming Sessions */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-plum-900">Upcoming Sessions</h2>
            </div>
            
            {sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.map((session, idx) => {
                  const sDate = session.date ? new Date(session.date) : new Date();
                  return (
                    <div key={session._id || idx} className="flex gap-4 items-start p-3 hover:bg-lavender-50 rounded-xl transition-colors">
                      <div className="w-12 h-12 bg-violet-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-violet-700">
                        <span className="text-xs font-semibold">{sDate.toLocaleDateString('en-US', { month: 'short'})}</span>
                        <span className="text-lg font-bold leading-none">{sDate.getDate()}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-plum-900 text-sm line-clamp-1">{session.title}</h4>
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <Clock size={12} className="mr-1" /> 
                          {session.time || sDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <Link to="/sessions">
                  <Button variant="ghost" fullWidth className="mt-2 text-sm">View Calendar</Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-lavender-50 rounded-full flex items-center justify-center mx-auto mb-3 text-violet-300">
                  <Clock size={24} />
                </div>
                <p className="text-sm text-gray-500">No upcoming sessions</p>
              </div>
            )}
          </section>

          {/* Progress Tracking */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-plum-900 mb-6">Learning Goals</h2>
            <div className="space-y-5">
              {user?.skillsToLearn?.length > 0 ? (
                user.skillsToLearn.slice(0, 3).map((skill, idx) => (
                  <ProgressBar 
                    key={idx} 
                    label={skill.name} 
                    percentage={Math.floor(Math.random() * 60) + 20} 
                    color="coral" 
                  />
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-2">No learning skills added yet.</p>
                  <Link to="/edit-profile" className="text-xs text-violet-600 hover:underline font-medium">
                    + Add Skills to Learn
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
