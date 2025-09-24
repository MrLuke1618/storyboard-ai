import React, { useState } from 'react';
import { AnalyzedShot } from '../types';
import { ListBulletIcon, DownloadIcon } from './icons';

interface ShotListProps {
    shots: AnalyzedShot[];
    setShots: (shots: AnalyzedShot[]) => void;
}

export const ShotList: React.FC<ShotListProps> = ({ shots, setShots }) => {
    const [editingCell, setEditingCell] = useState<{ rowIndex: number, key: keyof AnalyzedShot } | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    const handleCellClick = (rowIndex: number, key: keyof AnalyzedShot, value: string | number | undefined) => {
        if (key === 'description' || key === 'shotType' || key === 'duration') {
            setEditingCell({ rowIndex, key });
            setEditValue(String(value || ''));
        }
    };
    
    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditValue(e.target.value);
    };

    const handleEditBlur = () => {
        if (editingCell) {
            const updatedShots = shots.map((shot, index) => {
                if (index === editingCell.rowIndex) {
                    const key = editingCell.key;
                    const updatedShot = { ...shot };
                    if (key === 'duration') {
                        const numValue = parseInt(editValue, 10);
                        updatedShot.duration = isNaN(numValue) ? undefined : numValue;
                    } else if (key === 'shotType' || key === 'description') {
                        updatedShot[key] = editValue;
                    }
                    return updatedShot;
                }
                return shot;
            });
            setShots(updatedShots);
            setEditingCell(null);
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleEditBlur();
        }
    };

    const exportToCSV = () => {
        if (shots.length === 0) {
            alert("No shots to export!");
            return;
        }

        const headers = ["Scene", "Shot", "Shot Type", "Duration (s)", "Description", "Dialogue"];
        const rows = shots.map(s => 
            [
                s.scene, 
                s.shot, 
                s.shotType,
                s.duration || 0,
                `"${s.description.replace(/"/g, '""')}"`, 
                `"${(s.dialogue || '').replace(/"/g, '""')}"`
            ].join(',')
        );

        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "shot_list.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (shots.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-600 p-8 text-center min-h-[70vh]">
                <ListBulletIcon className="w-24 h-24 text-gray-500 mb-6"/>
                <h3 className="text-3xl font-bold text-white mb-2">No Shot List Available</h3>
                <p className="text-lg text-gray-400 max-w-md">
                    Generate a storyboard first to see the detailed shot list here.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Shot List</h2>
                <button
                    onClick={exportToCSV}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-300"
                >
                    <DownloadIcon className="w-5 h-5" />
                    <span>Export CSV</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 w-16">Scene</th>
                            <th scope="col" className="px-6 py-3 w-16">Shot</th>
                            <th scope="col" className="px-6 py-3 w-48">Shot Type</th>
                            <th scope="col" className="px-6 py-3 w-32">Duration (s)</th>
                            <th scope="col" className="px-6 py-3">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shots.map((shot, index) => (
                            <tr key={`${shot.scene}-${shot.shot}`} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="px-6 py-4 font-medium text-white">{shot.scene}</td>
                                <td className="px-6 py-4 font-medium text-white">{shot.shot}</td>
                                <td className="px-6 py-4 cursor-pointer" onClick={() => handleCellClick(index, 'shotType', shot.shotType)}>
                                    {editingCell?.rowIndex === index && editingCell.key === 'shotType' ? (
                                        <input 
                                            type="text" 
                                            value={editValue} 
                                            onChange={handleEditChange} 
                                            onBlur={handleEditBlur}
                                            onKeyPress={handleKeyPress}
                                            className="bg-gray-900 border border-indigo-500 rounded px-2 py-1 w-full"
                                            autoFocus
                                        />
                                    ) : (
                                        shot.shotType
                                    )}
                                </td>
                                 <td className="px-6 py-4 cursor-pointer" onClick={() => handleCellClick(index, 'duration', shot.duration)}>
                                    {editingCell?.rowIndex === index && editingCell.key === 'duration' ? (
                                        <input 
                                            type="number" 
                                            value={editValue} 
                                            onChange={handleEditChange} 
                                            onBlur={handleEditBlur}
                                            onKeyPress={handleKeyPress}
                                            className="bg-gray-900 border border-indigo-500 rounded px-2 py-1 w-full"
                                            autoFocus
                                        />
                                    ) : (
                                        shot.duration
                                    )}
                                </td>
                                <td className="px-6 py-4 cursor-pointer" onClick={() => handleCellClick(index, 'description', shot.description)}>
                                    {editingCell?.rowIndex === index && editingCell.key === 'description' ? (
                                        <input 
                                            type="text" 
                                            value={editValue} 
                                            onChange={handleEditChange} 
                                            onBlur={handleEditBlur}
                                            onKeyPress={handleKeyPress}
                                            className="bg-gray-900 border border-indigo-500 rounded px-2 py-1 w-full"
                                            autoFocus
                                        />
                                    ) : (
                                        shot.description
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};