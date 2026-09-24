import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Sparkles, ArrowRight, Zap, Target } from 'lucide-react';
import Button from '../components/common/Button';

const Landing = () => {
  return (
    <div className="flex flex-col gap-24 py-12">
      {/* Hero Section */}
      <section className="text-center px-4 md:px-8 max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold text-plum-900 tracking-tight mb-6">
          Learn What You Want.<br />
          <span className="text-violet-500">Teach What You Know.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join the premier peer-to-peer skill exchange platform for students. Connect, learn, and grow together without spending a dime.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link to="/register">
            <Button size="lg" className="w-full sm:w-auto text-lg px-8 rounded-full shadow-lg shadow-violet-200">
              Find My Skill Match
            </Button>
          </Link>
          <Link to="/discover">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-8 rounded-full">
              Explore Learning Groups
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white rounded-3xl p-12 shadow-soft mx-4 md:mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-plum-900">How It Works</h2>
          <p className="text-gray-500 mt-2">Simple, effective, and completely free.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-lavender-100 rounded-2xl flex items-center justify-center mb-6 text-violet-500 rotate-3 transition-transform hover:rotate-6">
              <Sparkles size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-plum-900">1. Share Your Skills</h3>
            <p className="text-gray-600 leading-relaxed">
              List the skills you're good at and what you want to learn. Our platform supports hundreds of topics.
            </p>
          </div>
          <div className="text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-coral-50 rounded-2xl flex items-center justify-center mb-6 text-coral-500 -rotate-3 transition-transform hover:-rotate-6">
              <Target size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-plum-900">2. Find Your Match</h3>
            <p className="text-gray-600 leading-relaxed">
              Our smart algorithm pairs you with perfect learning partners based on mutual interests and skill levels.
            </p>
          </div>
          <div className="text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 text-green-500 rotate-3 transition-transform hover:rotate-6">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-plum-900">3. Learn Together</h3>
            <p className="text-gray-600 leading-relaxed">
              Exchange skills 1-on-1 or join learning circles. Chat, video call, and track your progress.
            </p>
          </div>
        </div>
      </section>

      {/* Skill Matching Feature */}
      <section className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto px-4">
        <div>
          <h2 className="text-3xl font-bold text-plum-900 mb-6">Smart Skill Matching</h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Stop searching endlessly. We analyze your profile to find users who want to learn what you know, and can teach what you want to learn.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-gray-700">
              <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-violet-500">
                <Zap size={14} />
              </div>
              Find mutual exchange partners instantly
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-violet-500">
                <Zap size={14} />
              </div>
              Filter by difficulty levels
            </li>
          </ul>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-200 to-coral-200 rounded-3xl transform rotate-3 blur-sm opacity-50"></div>
          <div className="bg-white rounded-3xl p-8 shadow-card relative transform -rotate-1">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">JD</div>
                <div>
                  <h4 className="font-semibold text-plum-900">John Doe</h4>
                  <p className="text-sm text-gray-500">Computer Science Major</p>
                </div>
              </div>
              <div className="bg-violet-100 text-violet-700 px-4 py-2 rounded-full font-bold text-lg">
                92% Match
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">You can learn</p>
                <span className="skill-tag-coral mr-2">React.js</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">John wants to learn</p>
                <span className="skill-tag mr-2">UI Design</span>
              </div>
            </div>
            <Button fullWidth className="mt-8">Send Request</Button>
          </div>
        </div>
      </section>

      {/* Credit System */}
      <section className="bg-plum-900 text-white rounded-3xl p-12 md:p-16 mx-4 md:mx-auto max-w-6xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-violet-600 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-coral-600 rounded-full blur-3xl opacity-30"></div>
        
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Fair Exchange with Skill Credits</h2>
          <p className="text-violet-100 text-lg mb-10 leading-relaxed">
            Can't find a direct mutual match? No problem. Use our credit system to learn from anyone and teach anyone.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full sm:w-64 border border-white/20">
              <div className="text-4xl mb-2 text-violet-300">+1</div>
              <p className="font-medium">Earn a credit when you teach a session</p>
            </div>
            <div className="text-violet-300 hidden sm:block">
              <ArrowRight size={32} />
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full sm:w-64 border border-white/20">
              <div className="text-4xl mb-2 text-coral-300">-1</div>
              <p className="font-medium">Spend a credit to learn from an expert</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center py-16 px-4">
        <h2 className="text-4xl font-bold text-plum-900 mb-6">Ready to start learning?</h2>
        <p className="text-xl text-gray-600 mb-10">Join thousands of students already swapping skills.</p>
        <Link to="/register">
          <Button size="lg" className="text-lg px-12 rounded-full shadow-lg shadow-violet-200">
            Join SkillSwap Today
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default Landing;
