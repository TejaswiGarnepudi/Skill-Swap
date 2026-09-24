import React, { useState } from 'react';
import { Users, Calendar, Clock, CheckCircle2, ShieldCheck, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';

const GroupCard = ({ group, pendingRequestIds = [], onRequestJoin, isRequesting = false }) => {
  const { user } = useAuth();
  const { _id, name, description, skill, difficulty, maxMembers, members, creator, startDate, endDate } = group;

  const difficultyColors = {
    beginner: 'green',
    intermediate: 'yellow',
    advanced: 'coral'
  };

  const isCreator = (creator?._id || creator) === user?._id;
  const isMember = members?.some(m => (m.user?._id || m.user || m) === user?._id);
  const isPending = pendingRequestIds.includes(_id);
  const isFull = (members?.length || 1) >= (maxMembers || 20);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="card flex flex-col h-full p-0 overflow-hidden border border-gray-100 group shadow-card hover:shadow-hover transition-all">
      {/* Header pattern/color */}
      <div className="h-16 bg-gradient-to-r from-violet-100 to-lavender-200 relative p-4 flex justify-between items-start">
        <Badge 
          variant={difficultyColors[difficulty] || 'violet'} 
          className="capitalize shadow-xs"
        >
          {difficulty || 'beginner'}
        </Badge>
        {isCreator && (
          <span className="bg-violet-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
            <ShieldCheck size={12} /> Host
          </span>
        )}
        {isMember && !isCreator && (
          <span className="bg-green-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
            <CheckCircle2 size={12} /> Member
          </span>
        )}
      </div>
      
      <div className="p-6 flex-grow flex flex-col relative">
        {/* Creator Avatar */}
        <div className="absolute -top-7 left-6">
          <Avatar 
            src={creator?.avatar} 
            name={creator?.name || 'User'} 
            size="md" 
            className="ring-4 ring-white shadow-sm"
          />
        </div>

        <div className="mt-4 mb-4">
          <span className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-1 block">
            {skill}
          </span>
          <h3 className="text-lg font-bold text-plum-900 mb-2 line-clamp-1 group-hover:text-violet-600 transition-colors">
            {name}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="mt-auto space-y-2.5 pt-2 border-t border-gray-50">
          <div className="flex items-center text-xs text-gray-500 gap-2">
            <Users size={14} className="text-gray-400" />
            <span>{members?.length || 1} / {maxMembers || 20} members</span>
            {isFull && <Badge variant="coral" size="sm" className="ml-auto">Full</Badge>}
          </div>
          
          {(startDate || endDate) && (
            <div className="flex items-center text-xs text-gray-500 gap-2">
              <Calendar size={14} className="text-gray-400" />
              <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50/40 flex items-center gap-2">
        {isCreator || isMember ? (
          <Link to={`/groups/${_id}`} className="w-full">
            <Button variant="secondary" fullWidth size="sm">
              View Group Dashboard
            </Button>
          </Link>
        ) : isPending ? (
          <div className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-yellow-50 text-yellow-700 rounded-xl text-xs font-semibold border border-yellow-200">
            <Clock size={14} /> Request Pending
          </div>
        ) : (
          <div className="w-full flex gap-2">
            <Link to={`/groups/${_id}`} className="flex-1">
              <Button variant="ghost" fullWidth size="sm" className="text-xs">
                Details
              </Button>
            </Link>
            <Button 
              size="sm" 
              fullWidth 
              disabled={isFull || isRequesting} 
              isLoading={isRequesting}
              onClick={() => onRequestJoin && onRequestJoin(group)}
              className="flex-1 flex items-center justify-center gap-1 text-xs"
            >
              <UserPlus size={14} /> Request to Join
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupCard;
