import React from 'react';
import { FilmIcon, DownloadIcon, UserGroupIcon, HomeIcon, ListBulletIcon, QuestionMarkCircleIcon } from './icons';
import { View } from '../types';

interface HeaderProps {
    onExportPDF: () => void;
    canExport: boolean;
    isExporting: boolean;
    currentView: View;
    onSetView: (view: View) => void;
    onShowHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    onExportPDF, 
    canExport, 
    isExporting, 
    currentView, 
    onSetView, 
    onShowHelp
}) => {
    const navButtonStyle = "flex items-center space-x-2 px-4 py-2 font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-75";
    const activeButtonStyle = "bg-indigo-600 text-white focus:ring-indigo-400";
    const inactiveButtonStyle = "bg-gray-700 hover:bg-gray-600 text-gray-200 focus:ring-gray-500";
    
    const NavButton: React.FC<{view: View, label: string, icon: React.ReactNode}> = ({ view, label, icon }) => (
        <button
            onClick={() => onSetView(view)}
            className={`${navButtonStyle} ${currentView === view ? activeButtonStyle : inactiveButtonStyle}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <header className="bg-gray-800 shadow-lg sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <FilmIcon className="w-10 h-10 text-indigo-400" />
                    <h1 className="text-3xl font-bold font-orbitron text-white tracking-wider">
                        Storyboard <span className="text-indigo-400">AI</span>
                    </h1>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <NavButton view="dashboard" label="Dashboard" icon={<HomeIcon className="w-5 h-5" />} />
                    <NavButton view="storyboard" label="Storyboard" icon={<FilmIcon className="w-5 h-5" />} />
                    <NavButton view="shotList" label="Shot List" icon={<ListBulletIcon className="w-5 h-5" />} />
                    <NavButton view="characterDatabase" label="Characters" icon={<UserGroupIcon className="w-5 h-5" />} />

                    <div className="h-8 border-l border-gray-600"></div>

                    <button
                        onClick={onExportPDF}
                        disabled={!canExport || isExporting}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
                        title={isExporting ? "Exporting in progress..." : (!canExport ? "Generate a storyboard to enable export" : "Export project package as PDF")}
                    >
                        <DownloadIcon className={`w-5 h-5 ${isExporting ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export PDF'}</span>
                    </button>
                     <button
                        onClick={onShowHelp}
                        className="p-2 text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                        title="Help"
                    >
                        <QuestionMarkCircleIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </header>
    );
};