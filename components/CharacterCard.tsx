
import React, { useState } from 'react';
import { CharacterProfile, CharacterTask } from '../types';
import { TrashIcon, UserCircleIcon, PlusIcon } from './icons';

interface CharacterCardProps {
    character: CharacterProfile;
    onDelete: (id: string) => void;
    onUpdate: (character: CharacterProfile) => void;
}

const DetailSection: React.FC<{title: string, content?: string}> = ({ title, content }) => {
    if (!content) return null;
    return (
        <div className="border-t border-gray-700 pt-2 mt-2">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{title}</h4>
            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
    );
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character, onDelete, onUpdate }) => {
    const [newTaskText, setNewTaskText] = useState('');
    const initials = character.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskText.trim()) return;
        const newTask: CharacterTask = {
            id: Date.now().toString(),
            text: newTaskText.trim(),
            completed: false,
        };
        const updatedCharacter = {
            ...character,
            tasks: [...(character.tasks || []), newTask],
        };
        onUpdate(updatedCharacter);
        setNewTaskText('');
    };

    const handleToggleTask = (taskId: string) => {
        const updatedTasks = (character.tasks || []).map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        onUpdate({ ...character, tasks: updatedTasks });
    };

    const handleDeleteTask = (taskId: string) => {
        const updatedTasks = (character.tasks || []).filter(task => task.id !== taskId);
        onUpdate({ ...character, tasks: updatedTasks });
    };

    return (
        <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-700 flex flex-col transition-all duration-300 hover:shadow-indigo-500/20 hover:border-indigo-500 transform hover:-translate-y-1">
            <div className="w-full h-56 bg-gray-800 flex items-center justify-center">
                {character.imageUrl ? (
                    <img src={character.imageUrl} alt={character.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center text-gray-500">
                        <UserCircleIcon className="w-24 h-24" />
                        <span className="text-4xl font-bold -mt-4 text-gray-600">{initials}</span>
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-white mb-2">{character.name}</h3>
                    <button onClick={() => onDelete(character.id)} className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full flex-shrink-0">
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed flex-grow">
                    {character.description}
                </p>
                <div className="space-y-2 mt-3">
                    <DetailSection title="Character Arc" content={character.arc} />
                    <DetailSection title="Relationships" content={character.relationships} />
                    <DetailSection title="Voice/Mannerisms" content={character.voice} />
                </div>
                <div className="border-t border-gray-700 pt-3 mt-3">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Task Reminders</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                        {(character.tasks || []).map(task => (
                            <div key={task.id} className="flex items-center justify-between group">
                                <label className="flex items-center space-x-2 text-sm text-gray-400 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={() => handleToggleTask(task.id)}
                                        className="form-checkbox bg-gray-700 border-gray-600 text-indigo-500 rounded focus:ring-indigo-500 w-4 h-4"
                                    />
                                    <span className={task.completed ? 'line-through text-gray-500' : 'text-gray-300'}>
                                        {task.text}
                                    </span>
                                </label>
                                <button onClick={() => handleDeleteTask(task.id)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                     <form onSubmit={handleAddTask} className="mt-2 flex items-center space-x-2">
                        <input
                            type="text"
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            placeholder="Add a new task..."
                            className="flex-grow bg-gray-800 border border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500"
                        />
                        <button type="submit" className="p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50" disabled={!newTaskText.trim()}>
                            <PlusIcon className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};