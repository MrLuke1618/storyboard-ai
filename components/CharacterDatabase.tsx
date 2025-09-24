
import React, { useState, useEffect } from 'react';
import { CharacterProfile } from '../types';
import { CharacterCard } from './CharacterCard';
import { UploadIcon, UserGroupIcon } from './icons';

const STORAGE_KEY = 'storyboard-ai-characters';

export const CharacterDatabase: React.FC = () => {
    const [characters, setCharacters] = useState<CharacterProfile[]>([]);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newImage, setNewImage] = useState<string | null>(null);
    const [newArc, setNewArc] = useState('');
    const [newRelationships, setNewRelationships] = useState('');
    const [newVoice, setNewVoice] = useState('');


    useEffect(() => {
        const storedCharacters = localStorage.getItem(STORAGE_KEY);
        if (storedCharacters) {
            setCharacters(JSON.parse(storedCharacters));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
    }, [characters]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setNewName('');
        setNewDescription('');
        setNewImage(null);
        setNewArc('');
        setNewRelationships('');
        setNewVoice('');
        const fileInput = document.getElementById('char-image-upload') as HTMLInputElement;
        if(fileInput) fileInput.value = "";
    }

    const handleAddCharacter = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newDescription) {
            alert('Please provide at least a name and description.');
            return;
        }
        const newCharacter: CharacterProfile = {
            id: Date.now().toString(),
            name: newName,
            description: newDescription,
            tasks: [],
            ...(newImage && { imageUrl: newImage }),
            ...(newArc && { arc: newArc }),
            ...(newRelationships && { relationships: newRelationships }),
            ...(newVoice && { voice: newVoice }),
        };
        setCharacters(prev => [newCharacter, ...prev]);
        resetForm();
    };

    const handleDeleteCharacter = (id: string) => {
        if (window.confirm('Are you sure you want to delete this character?')) {
            setCharacters(prev => prev.filter(char => char.id !== id));
        }
    };

    const handleUpdateCharacter = (updatedCharacter: CharacterProfile) => {
        setCharacters(prev => prev.map(char => char.id === updatedCharacter.id ? updatedCharacter : char));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Panel */}
            <div className="lg:col-span-1">
                <form onSubmit={handleAddCharacter} className="bg-gray-800 p-6 rounded-xl shadow-2xl space-y-6 sticky top-28">
                    <h2 className="text-2xl font-bold text-white">Add New Character</h2>
                    <div className="space-y-4">
                         <label htmlFor="char-image-upload" className="w-full text-center px-4 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-300 cursor-pointer block">
                            <UploadIcon className="w-5 h-5 inline-block mr-2" />
                            {newImage ? 'Change Image' : 'Upload Reference Image'}
                        </label>
                        <input id="char-image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        {newImage && <img src={newImage} alt="Preview" className="mt-2 rounded-lg w-full object-cover aspect-square" />}

                        <input type="text" placeholder="Character Name*" value={newName} onChange={(e) => setNewName(e.target.value)}
                            className="w-full p-3 bg-gray-900 border-2 border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required />
                        
                        <textarea placeholder="Brief Description*" value={newDescription} onChange={(e) => setNewDescription(e.target.value)}
                            className="w-full h-24 p-3 bg-gray-900 border-2 border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required />

                        <textarea placeholder="Character Arc / Goal (Optional)" value={newArc} onChange={(e) => setNewArc(e.target.value)}
                            className="w-full h-24 p-3 bg-gray-900 border-2 border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        
                        <textarea placeholder="Key Relationships (Optional)" value={newRelationships} onChange={(e) => setNewRelationships(e.target.value)}
                            className="w-full h-24 p-3 bg-gray-900 border-2 border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />

                        <textarea placeholder="Voice / Mannerisms (Optional)" value={newVoice} onChange={(e) => setNewVoice(e.target.value)}
                            className="w-full h-24 p-3 bg-gray-900 border-2 border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        
                    </div>
                     <button
                        type="submit"
                        className="w-full flex items-center justify-center space-x-3 py-3 bg-indigo-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        <span>Add Character</span>
                    </button>
                </form>
            </div>

            {/* Display Panel */}
            <div className="lg:col-span-2">
                <div className="bg-gray-800 p-8 rounded-xl shadow-2xl min-h-[80vh]">
                    <h2 className="text-2xl font-bold text-white mb-6">Character Library</h2>
                    {characters.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {characters.map(char => (
                                <CharacterCard 
                                    key={char.id} 
                                    character={char} 
                                    onDelete={handleDeleteCharacter} 
                                    onUpdate={handleUpdateCharacter}
                                />
                            ))}
                        </div>
                    ) : (
                         <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-600 rounded-xl p-8 text-center min-h-[60vh]">
                            <UserGroupIcon className="w-24 h-24 text-gray-500 mb-6"/>
                            <h3 className="text-3xl font-bold text-white mb-2">Your Library is Empty</h3>
                            <p className="text-lg text-gray-400 max-w-md">
                                Add your first character using the form on the left to start building your cast.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};