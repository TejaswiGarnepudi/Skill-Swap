import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import Avatar from '../components/common/Avatar';
import SkillTag from '../components/common/SkillTag';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Star, Clock, Award, BookOpen, UserPlus, Users, ShieldCheck, ArrowRight, Plus } from 'lucide-react';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [createdGroups, setCreatedGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = !id || id === currentUser?._id;
  const targetId = isOwnProfile ? currentUser?._id : id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!targetId) return;
        const res = await api.get(`/users/${targetId}`);
        const uData = res.data.user || res.data;
        setProfileUser(uData);
        setCreatedGroups(res.data.createdGroups || uData.createdGroups || []);
        setJoinedGroups(res.data.joinedGroups || uData.joinedGroups || []);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [targetId, isOwnProfile]);

  if (loading) return <LoadingSpinner fullPage />;
  if (!profileUser) return <div className="text-center py-12 text-gray-500">User profile not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-card relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <Avatar 
            src={profileUser.avatar} 
            name={profileUser.name} 
            size="xl" 
            className="ring-4 ring-white shadow-md bg-white flex-shrink-0"
          />
          <div className="flex-grow">
            <h1 className="text-3xl font-bold text-plum-900">{profileUser.name}</h1>
            <p className="text-gray-500 mt-1">{profileUser.bio || 'SkillSwap Member • Passionate about peer learning'}</p>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Star size={16} className="text-yellow-400 fill-current" /> 
                {profileUser.reputation?.overall ? profileUser.reputation.overall.toFixed(1) : '5.0'} Rating
              </span>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            {isOwnProfile ? (
              <Link to="/edit-profile">
                <Button variant="secondary">Edit Profile</Button>
              </Link>
            ) : (
              <Link to="/matches">
                <Button className="flex items-center gap-2">
                  <UserPlus size={16} /> Skill Match
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card text-center">
          <Award className="w-8 h-8 mx-auto text-violet-500 mb-2" />
          <p className="text-2xl font-bold text-plum-900">{profileUser.skillCredits ?? 5}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Skill Credits</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card text-center">
          <Clock className="w-8 h-8 mx-auto text-coral-500 mb-2" />
          <p className="text-2xl font-bold text-plum-900">{profileUser.teachingHours || 0}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Hours Taught</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card text-center">
          <BookOpen className="w-8 h-8 mx-auto text-green-500 mb-2" />
          <p className="text-2xl font-bold text-plum-900">{profileUser.learningHours || 0}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Hours Learned</p>
        </div>
      </div>

      {/* Skills Sections */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-card">
          <h2 className="text-xl font-bold text-plum-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-violet-500" />
            Skills I Can Teach
          </h2>
          <div className="flex flex-wrap gap-2">
            {profileUser.skillsToTeach?.length > 0 ? (
              profileUser.skillsToTeach.map((skill, idx) => (
                <SkillTag key={idx} name={skill.name} level={skill.level} variant="teach" />
              ))
            ) : (
              <p className="text-sm text-gray-400 italic">No teaching skills listed yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-card">
          <h2 className="text-xl font-bold text-plum-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-coral-500" />
            Skills I Want to Learn
          </h2>
          <div className="flex flex-wrap gap-2">
            {profileUser.skillsToLearn?.length > 0 ? (
              profileUser.skillsToLearn.map((skill, idx) => (
                <SkillTag key={idx} name={skill.name} level={skill.level} variant="learn" />
              ))
            ) : (
              <p className="text-sm text-gray-400 italic">No learning skills added yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* My Groups Section */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-card space-y-6">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-plum-900 flex items-center gap-2">
              <Users className="text-violet-600" size={24} />
              {isOwnProfile ? 'My Learning Groups' : `${profileUser.name.split(' ')[0]}'s Groups`}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Circles hosted and joined by this learner</p>
          </div>
          {isOwnProfile && (
            <Link to="/groups">
              <Button size="sm" className="flex items-center gap-1.5 text-xs">
                <Plus size={14} /> Create Group
              </Button>
            </Link>
          )}
        </div>

        {/* 1. Groups Created (Host) */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-violet-700 mb-3 flex items-center gap-1.5">
            <ShieldCheck size={16} /> Groups Created ({createdGroups.length})
          </h3>
          {createdGroups.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {createdGroups.map((grp) => (
                <Link key={grp._id} to={`/groups/${grp._id}`} className="block group">
                  <div className="p-5 rounded-2xl border border-violet-100 bg-violet-50/20 hover:bg-violet-50/50 hover:shadow-sm transition-all flex flex-col justify-between h-full">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="violet" size="sm">{grp.skill}</Badge>
                        <span className="text-[11px] bg-violet-600 text-white font-bold px-2 py-0.5 rounded-full">
                          Group Host
                        </span>
                      </div>
                      <h4 className="font-bold text-plum-900 group-hover:text-violet-600 transition-colors line-clamp-1 text-base">
                        {grp.name}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1 mb-3">
                        {grp.description || 'No description'}
                      </p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-violet-100/60 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {grp.members?.length || 1} members
                      </span>
                      <span className="text-violet-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        Dashboard <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-lavender-50/40 text-center text-xs text-gray-500">
              No groups created yet.
            </div>
          )}
        </div>

        {/* 2. Groups Joined (Member) */}
        <div className="pt-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-green-700 mb-3 flex items-center gap-1.5">
            <Users size={16} /> Groups Joined as Member ({joinedGroups.length})
          </h3>
          {joinedGroups.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {joinedGroups.map((grp) => (
                <Link key={grp._id} to={`/groups/${grp._id}`} className="block group">
                  <div className="p-5 rounded-2xl border border-gray-100 bg-white hover:bg-lavender-50/40 hover:shadow-sm transition-all flex flex-col justify-between h-full">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="violet" size="sm">{grp.skill}</Badge>
                        <span className="text-[11px] bg-green-600 text-white font-bold px-2 py-0.5 rounded-full">
                          Member
                        </span>
                      </div>
                      <h4 className="font-bold text-plum-900 group-hover:text-violet-600 transition-colors line-clamp-1 text-base">
                        {grp.name}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1 mb-3">
                        {grp.description || 'No description'}
                      </p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {grp.members?.length || 1} members
                      </span>
                      <span className="text-violet-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        Dashboard <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-lavender-50/40 text-center text-xs text-gray-500">
              Not a member of any other groups yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
