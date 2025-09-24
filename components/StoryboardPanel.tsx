import React, { useState, useEffect } from 'react';
import { StoryboardPanelData } from '../types';
import { CheckIcon, PencilIcon, XMarkIcon } from './icons';

interface StoryboardPanelProps {
    panel: StoryboardPanelData;
    onUpdate: (updatedPanel: StoryboardPanelData) => void;
}

export const StoryboardPanel: React.FC<StoryboardPanelProps> = ({ panel, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState<StoryboardPanelData>(panel);

    useEffect(() => {
        setEditedData(panel);
    }, [panel]);

    const handleSave = () => {
        onUpdate(editedData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedData(panel);
        setIsEditing(false);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("panelId", panel.id);
    };

    const renderViewMode = () => (
        <div className="p-4 space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-white">
                        Scene {panel.scene} - Shot {panel.shot}
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                        <span className="bg-indigo-600 text-indigo-100 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {panel.shotType.toUpperCase()}
                        </span>
                         {panel.duration && (
                            <span className="text-gray-400 text-xs font-mono">{panel.duration}s</span>
                         )}
                    </div>
                </div>
                <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-600 rounded-full transition-colors">
                    <PencilIcon className="w-4 h-4" />
                </button>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed min-h-[40px]">
                {panel.description}
            </p>
            {panel.dialogue && (
                <div className="border-t border-gray-700 pt-3">
                    <p className="text-gray-300 text-sm italic">
                       &ldquo;{panel.dialogue}&rdquo;
                    </p>
                </div>
            )}
        </div>
    );
    
    const renderEditMode = () => (
        <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
                 <h3 className="text-xl font-bold text-white">
                    Editing Shot {panel.scene}-{panel.shot}
                </h3>
                <div className="flex space-x-2">
                    <button onClick={handleSave} className="p-2 text-green-400 bg-green-900/50 hover:bg-green-800/50 rounded-full"><CheckIcon className="w-4 h-4" /></button>
                    <button onClick={handleCancel} className="p-2 text-red-400 bg-red-900/50 hover:bg-red-800/50 rounded-full"><XMarkIcon className="w-4 h-4" /></button>
                </div>
            </div>
            <div className="space-y-2 text-sm">
                <input
                    type="text"
                    value={editedData.shotType}
                    onChange={(e) => setEditedData({...editedData, shotType: e.target.value})}
                    className="w-full p-2 bg-gray-950 border border-gray-600 rounded-md focus:ring-1 focus:ring-indigo-500"
                    placeholder="Shot Type"
                />
                 <input
                    type="number"
                    value={editedData.duration || ''}
                    onChange={(e) => setEditedData({...editedData, duration: parseInt(e.target.value, 10) || 0})}
                    className="w-full p-2 bg-gray-950 border border-gray-600 rounded-md focus:ring-1 focus:ring-indigo-500"
                    placeholder="Duration (s)"
                />
                <textarea
                    value={editedData.description}
                    onChange={(e) => setEditedData({...editedData, description: e.target.value})}
                    className="w-full p-2 bg-gray-950 border border-gray-600 rounded-md focus:ring-1 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Description"
                />
            </div>
        </div>
    );

    return (
        <div 
            className="bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-700 transition-all duration-300 hover:shadow-indigo-500/20 hover:border-indigo-500 transform hover:-translate-y-1 cursor-grab active:cursor-grabbing"
            draggable
            onDragStart={handleDragStart}
        >
            <div className="aspect-video bg-black flex items-center justify-center">
                <img src={panel.imageUrl} alt={panel.description} className="w-full h-full object-cover" />
            </div>
            {isEditing ? renderEditMode() : renderViewMode()}
        </div>
    );
};
