import React from 'react';
import { ArrowRight } from 'lucide-react';
import Button from '../common/Button';
import Avatar from '../common/Avatar';

const MatchCard = ({ match, onSendRequest }) => {
  const { user, matchScore, canLearn, canTeach } = match;

  return (
    <div className="card flex flex-col h-full border border-gray-100">
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4 items-center">
          <Avatar src={user.avatar} name={user.name} size="lg" isOnline={true} />
          <div>
            <h3 className="font-bold text-lg text-plum-900">{user.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-1">{user.bio || 'Student & Learner'}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full font-bold text-lg">
            {matchScore}%
          </div>
          <span className="text-xs text-gray-400 mt-1">Match</span>
        </div>
      </div>

      <div className="flex-grow space-y-4">
        {canLearn && canLearn.length > 0 && (
          <div className="bg-lavender-50 p-4 rounded-xl">
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">You can learn</p>
            <div className="flex flex-wrap gap-2">
              {canLearn.map((skill, idx) => (
                <span key={idx} className="skill-tag-coral text-xs">
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {canTeach && canTeach.length > 0 && (
          <div className="bg-white border border-gray-100 p-4 rounded-xl">
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">{user.name} wants to learn</p>
            <div className="flex flex-wrap gap-2">
              {canTeach.map((skill, idx) => (
                <span key={idx} className="skill-tag text-xs">
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <Button 
          fullWidth 
          onClick={() => onSendRequest(match)}
          className="group"
        >
          Send Exchange Request
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default MatchCard;
