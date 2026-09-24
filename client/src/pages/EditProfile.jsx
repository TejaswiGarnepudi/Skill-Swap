import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import SkillTag from '../components/common/SkillTag';
import { DIFFICULTY_LEVELS } from '../utils/constants';
import { Plus } from 'lucide-react';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });
  const [skillsToTeach, setSkillsToTeach] = useState(user?.skillsToTeach || []);
  const [skillsToLearn, setSkillsToLearn] = useState(user?.skillsToLearn || []);
  
  const [newSkill, setNewSkill] = useState({ name: '', level: 'beginner' });
  const [activeList, setActiveList] = useState('teach'); // 'teach' or 'learn'
  const [saving, setSaving] = useState(false);

  const handleAddSkill = () => {
    if (!newSkill.name.trim()) return;
    
    if (activeList === 'teach') {
      if (!skillsToTeach.find(s => s.name.toLowerCase() === newSkill.name.toLowerCase())) {
        setSkillsToTeach([...skillsToTeach, { name: newSkill.name.trim(), level: newSkill.level }]);
      }
    } else {
      if (!skillsToLearn.find(s => s.name.toLowerCase() === newSkill.name.toLowerCase())) {
        setSkillsToLearn([...skillsToLearn, { name: newSkill.name.trim(), level: newSkill.level }]);
      }
    }
    setNewSkill({ name: '', level: 'beginner' });
  };

  const handleRemoveSkill = (name, type) => {
    if (type === 'teach') {
      setSkillsToTeach(skillsToTeach.filter(s => s.name !== name));
    } else {
      setSkillsToLearn(skillsToLearn.filter(s => s.name !== name));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/profile', {
        name: formData.name,
        bio: formData.bio,
        avatar: formData.avatar
      });

      await api.put('/users/skills', {
        skillsToTeach,
        skillsToLearn
      });

      const res = await api.get('/auth/me');
      updateUser(res.data.user || res.data);
      navigate('/profile');
    } catch (error) {
      console.error('Failed to update profile', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 border border-gray-100 shadow-card">
      <h1 className="text-2xl font-bold text-plum-900 mb-6">Edit Profile</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-plum-900 border-b border-gray-100 pb-2">Basic Information</h2>
          <Input 
            label="Full Name" 
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <Input 
            label="Avatar Image URL" 
            value={formData.avatar}
            onChange={(e) => setFormData({...formData, avatar: e.target.value})}
            placeholder="https://images.unsplash.com/..."
          />
          <Input 
            label="Bio" 
            isTextarea
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            placeholder="Tell others a bit about yourself..."
          />
        </div>

        {/* Skills Manager */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-plum-900 border-b border-gray-100 pb-2">Your Skills</h2>
          
          <div className="flex gap-4 mb-4">
            <button 
              type="button"
              className={`pb-2 px-1 text-sm font-semibold border-b-2 transition-colors ${activeList === 'teach' ? 'border-violet-500 text-violet-600' : 'border-transparent text-gray-400'}`}
              onClick={() => setActiveList('teach')}
            >
              Skills I Can Teach ({skillsToTeach.length})
            </button>
            <button 
              type="button"
              className={`pb-2 px-1 text-sm font-semibold border-b-2 transition-colors ${activeList === 'learn' ? 'border-coral-500 text-coral-600' : 'border-transparent text-gray-400'}`}
              onClick={() => setActiveList('learn')}
            >
              Skills I Want to Learn ({skillsToLearn.length})
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text"
              placeholder={`Add a skill you want to ${activeList}... (e.g. Python, Figma)`}
              className="flex-grow rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-violet-200 text-sm"
              value={newSkill.name}
              onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
            />
            <select
              className="rounded-xl border border-gray-200 px-3 py-2.5 bg-white text-sm outline-none"
              value={newSkill.level}
              onChange={(e) => setNewSkill({...newSkill, level: e.target.value})}
            >
              {DIFFICULTY_LEVELS.map(level => (
                <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
              ))}
            </select>
            <Button type="button" onClick={handleAddSkill} className="flex items-center gap-1">
              <Plus size={16} /> Add
            </Button>
          </div>

          {/* Current Skills Chips */}
          <div className="pt-2">
            <p className="text-xs text-gray-400 mb-2 uppercase font-semibold">
              {activeList === 'teach' ? 'Skills you are offering to teach:' : 'Skills you want to learn:'}
            </p>
            <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-lavender-50/50 rounded-2xl border border-lavender-100">
              {activeList === 'teach' ? (
                skillsToTeach.length > 0 ? (
                  skillsToTeach.map((s) => (
                    <SkillTag 
                      key={s.name} 
                      name={s.name} 
                      level={s.level} 
                      variant="teach" 
                      removable 
                      onRemove={() => handleRemoveSkill(s.name, 'teach')}
                    />
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">No teaching skills added yet.</p>
                )
              ) : (
                skillsToLearn.length > 0 ? (
                  skillsToLearn.map((s) => (
                    <SkillTag 
                      key={s.name} 
                      name={s.name} 
                      level={s.level} 
                      variant="learn" 
                      removable 
                      onRemove={() => handleRemoveSkill(s.name, 'learn')}
                    />
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">No learning skills added yet.</p>
                )
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="ghost" onClick={() => navigate('/profile')}>Cancel</Button>
          <Button type="submit" isLoading={saving}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
