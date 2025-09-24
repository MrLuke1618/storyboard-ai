import React, { useState, useCallback, useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { VisualStyle } from '../types';
import { GenerateIcon, MicIcon, StopIcon, UploadIcon } from './icons';

interface InputPanelProps {
    onGenerate: (script: string, visualStyle: VisualStyle) => void;
    isLoading: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({ onGenerate, isLoading }) => {
    const [script, setScript] = useState('');
    const [visualStyle, setVisualStyle] = useState<VisualStyle>('Cinematic');
    const { transcript, isListening, startListening, stopListening, isSupported } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            setScript(prev => prev ? `${prev}\n${transcript}` : transcript);
        }
    }, [transcript]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setScript(e.target?.result as string);
            };
            reader.readAsText(file);
        }
    };

    const handleGenerateClick = () => {
        onGenerate(script, visualStyle);
    };

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl space-y-6 sticky top-28">
            <h2 className="text-2xl font-bold text-white">1. Input Your Script</h2>
            <div className="space-y-4">
                <textarea
                    className="w-full h-64 p-4 bg-gray-900 border-2 border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-300"
                    placeholder="Paste your script here, or describe a scene..."
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                />
                <div className="flex items-center justify-between gap-4">
                    <label htmlFor="file-upload" className="flex-1 text-center px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-300 cursor-pointer">
                        <UploadIcon className="w-5 h-5 inline-block mr-2" />
                        Upload Script
                    </label>
                    <input id="file-upload" type="file" className="hidden" accept=".txt,.fountain,.pdf" onChange={handleFileChange} />
                    
                    <button
                        onClick={isListening ? stopListening : startListening}
                        disabled={!isSupported}
                        title={!isSupported ? "Speech recognition is not supported in this browser" : (isListening ? 'Stop Recording' : 'Record Audio')}
                        className={`flex-1 px-4 py-2 font-semibold rounded-lg shadow-md transition-colors duration-300 flex items-center justify-center ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-75`}
                    >
                        {isListening ? <StopIcon className="w-5 h-5 mr-2"/> : <MicIcon className="w-5 h-5 mr-2"/>}
                        {isListening ? 'Stop' : 'Record'}
                    </button>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-white mb-4">2. Choose a Style</h2>
                <div className="grid grid-cols-2 gap-4">
                    {(['Cinematic', 'Film Noir', 'Technicolor', 'Indie / Gritty'] as VisualStyle[]).map(style => (
                        <button
                            key={style}
                            onClick={() => setVisualStyle(style)}
                            className={`px-4 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${visualStyle === style ? 'bg-indigo-600 text-white ring-2 ring-indigo-400' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            {style}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={handleGenerateClick}
                disabled={isLoading || !script}
                className="w-full flex items-center justify-center space-x-3 py-4 bg-green-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-green-700 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
            >
                <GenerateIcon className="w-6 h-6"/>
                <span>{isLoading ? 'Generating...' : 'Generate Storyboard'}</span>
            </button>
        </div>
    );
};
