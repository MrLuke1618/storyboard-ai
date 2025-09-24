
import React, { useState } from 'react';
import { FilmIcon } from './icons';

interface WelcomeModalProps {
    onClose: (dontShowAgain: boolean) => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const handleClose = () => {
        onClose(dontShowAgain);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full border border-gray-700 animate-fade-in-up">
                <div className="p-8 space-y-6">
                    <div className="flex items-center space-x-4">
                        <FilmIcon className="w-12 h-12 text-indigo-400" />
                        <div>
                            <h2 className="text-3xl font-bold text-white">Welcome to Storyboard AI!</h2>
                            <p className="text-gray-400">Your personal AI assistant director.</p>
                        </div>
                    </div>
                    
                    <p className="text-gray-300">
                        Bring your script to life in just a few clicks. Here's how to get started:
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white">1</div>
                            <div>
                                <h3 className="font-semibold text-white">Provide Your Script</h3>
                                <p className="text-gray-400">Type, paste, upload, or even speak your script or scene ideas into the input panel.</p>
                            </div>
                        </div>
                         <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white">2</div>
                            <div>
                                <h3 className="font-semibold text-white">Choose a Visual Style</h3>
                                <p className="text-gray-400">Select a cinematic style that matches the mood of your project, from Film Noir to Technicolor.</p>
                            </div>
                        </div>
                         <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white">3</div>
                            <div>
                                <h3 className="font-semibold text-white">Generate!</h3>
                                <p className="text-gray-400">Click the "Generate Storyboard" button and watch as the AI analyzes your script and creates your visual shots.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-900/50 p-4 flex justify-between items-center rounded-b-xl">
                    <label className="flex items-center space-x-2 text-sm text-gray-400">
                        <input 
                            type="checkbox"
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                            className="form-checkbox bg-gray-700 border-gray-600 text-indigo-500 rounded focus:ring-indigo-500"
                        />
                        <span>Don't show this again</span>
                    </label>
                    <button
                        onClick={handleClose}
                        className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300"
                    >
                        Let's Go!
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
