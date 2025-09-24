
import React, { useState, useEffect } from 'react';
import { View } from '../types';
import { FilmIcon, ListBulletIcon, UserGroupIcon, GenerateIcon } from './icons';

interface DashboardProps {
    onSetView: (view: View) => void;
}

const StatCard: React.FC<{label: string, value: number, icon: React.ReactNode}> = ({ label, value, icon }) => (
    <div className="bg-gray-800 p-6 rounded-lg flex items-center space-x-4">
        <div className="bg-indigo-600/20 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-gray-400 text-sm">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const ActionCard: React.FC<{title: string, description: string, icon: React.ReactNode, onClick: () => void}> = ({ title, description, icon, onClick }) => (
    <button
        onClick={onClick}
        className="bg-gray-800 p-6 rounded-lg text-left w-full h-full hover:bg-gray-700 hover:border-indigo-500 border-2 border-transparent transition-all duration-300 transform hover:-translate-y-1"
    >
        <div className="flex items-center space-x-4 mb-3">
            <div className="text-indigo-400">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <p className="text-gray-400">{description}</p>
    </button>
);

export const Dashboard: React.FC<DashboardProps> = ({ onSetView }) => {
    const [characterCount, setCharacterCount] = useState(0);
    const [generationCount, setGenerationCount] = useState(0);

    useEffect(() => {
        const storedCharacters = localStorage.getItem('storyboard-ai-characters');
        if (storedCharacters) {
            setCharacterCount(JSON.parse(storedCharacters).length);
        }

        const storedGenerations = localStorage.getItem('storyboard-ai-generations');
        if (storedGenerations) {
            setGenerationCount(parseInt(storedGenerations, 10));
        }
    }, []);

    return (
        <div className="space-y-16">
            <div>
                <h1 className="text-4xl font-bold text-white mb-2">Welcome Back, Director!</h1>
                <p className="text-lg text-gray-400">Ready to bring your next vision to life? Here's where you can start.</p>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white border-b-2 border-gray-700 pb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   <ActionCard 
                        title="New Storyboard"
                        description="Start from scratch with a script, voice note, or simple idea and generate a visual storyboard."
                        icon={<FilmIcon className="w-8 h-8"/>}
                        onClick={() => onSetView('storyboard')}
                   />
                   <ActionCard 
                        title="Character Database"
                        description="Create, view, and manage the profiles for all the characters in your project."
                        icon={<UserGroupIcon className="w-8 h-8"/>}
                        onClick={() => onSetView('characterDatabase')}
                   />
                   <ActionCard 
                        title="View Shot List"
                        description="Review, edit, and export the detailed shot list generated from your last script."
                        icon={<ListBulletIcon className="w-8 h-8"/>}
                        onClick={() => onSetView('shotList')}
                   />
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white border-b-2 border-gray-700 pb-4">Project Stats</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard label="Characters Created" value={characterCount} icon={<UserGroupIcon className="w-6 h-6 text-indigo-400"/>} />
                    <StatCard label="Storyboards Generated" value={generationCount} icon={<GenerateIcon className="w-6 h-6 text-indigo-400"/>} />
                 </div>
            </div>
        </div>
    );
};