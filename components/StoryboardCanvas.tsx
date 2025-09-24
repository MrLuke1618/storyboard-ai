import React, { forwardRef, useMemo } from 'react';
import { StoryboardPanelData, SceneNotes } from '../types';
import { StoryboardPanel } from './StoryboardPanel';
import { Loader } from './Loader';
import { CameraIcon, UndoIcon, RedoIcon } from './icons';

interface StoryboardCanvasProps {
    panels: StoryboardPanelData[];
    isLoading: boolean;
    loadingMessage: string;
    error: string | null;
    sceneNotes: SceneNotes;
    onUpdateSceneNotes: (sceneNumber: number, text: string) => void;
    onUpdatePanel: (panel: StoryboardPanelData) => void;
    onReorderPanels: (draggedId: string, targetId: string, targetScene: number) => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

export const StoryboardCanvas = forwardRef<HTMLDivElement, StoryboardCanvasProps>(({ 
    panels, 
    isLoading, 
    loadingMessage, 
    error, 
    sceneNotes,
    onUpdateSceneNotes,
    onUpdatePanel,
    onReorderPanels,
    onUndo,
    onRedo,
    canUndo,
    canRedo
}, ref) => {

    const scenes = useMemo(() => {
        const groupedScenes: Record<number, StoryboardPanelData[]> = {};
        for (const panel of panels) {
            if (!groupedScenes[panel.scene]) {
                groupedScenes[panel.scene] = [];
            }
            groupedScenes[panel.scene].push(panel);
        }
        return groupedScenes;
    }, [panels]);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetPanel: StoryboardPanelData) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData("panelId");
        if (draggedId && draggedId !== targetPanel.id) {
            onReorderPanels(draggedId, targetPanel.id, targetPanel.scene);
        }
    };

    const handleSceneDrop = (e: React.DragEvent<HTMLDivElement>, sceneNumber: number) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData("panelId");
        const targetId = (e.target as HTMLElement).closest('[draggable]')?.id || '';

        // If dropping on a panel, let its handler manage it.
        // This handles dropping in an empty scene area.
        if (draggedId && !targetId) {
             onReorderPanels(draggedId, '', sceneNumber);
        }
    };


    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };
    
    const WelcomeScreen = () => (
        <div className="flex flex-col items-center justify-center h-full bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-600 p-8 text-center">
            <CameraIcon className="w-24 h-24 text-gray-500 mb-6"/>
            <h3 className="text-3xl font-bold text-white mb-2">Your Storyboard Awaits</h3>
            <p className="text-lg text-gray-400 max-w-md">
                Enter your script, choose a style, and click 'Generate' to bring your vision to life.
            </p>
        </div>
    );

    const controlButtonStyle = "p-2 text-gray-400 bg-gray-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:text-white hover:enabled:bg-gray-600";

    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl min-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-white">Storyboard</h2>
                 <div className="flex items-center space-x-2">
                    <button onClick={onUndo} disabled={!canUndo} className={controlButtonStyle} title="Undo">
                        <UndoIcon className="w-5 h-5" />
                    </button>
                    <button onClick={onRedo} disabled={!canRedo} className={controlButtonStyle} title="Redo">
                        <RedoIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div ref={ref} className="flex-grow space-y-12">
                {isLoading && <Loader message={loadingMessage} />}
                {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}
                {!isLoading && !error && panels.length === 0 && <WelcomeScreen />}
                {!isLoading && !error && panels.length > 0 && (
                    Object.entries(scenes).map(([sceneNumber, scenePanels]) => (
                        <div 
                            key={sceneNumber} 
                            className="space-y-6 scene-container" 
                            data-scene-number={sceneNumber}
                            onDrop={(e) => handleSceneDrop(e, Number(sceneNumber))}
                            onDragOver={handleDragOver}
                        >
                            <div className="border-b-2 border-gray-700 pb-3 mb-4">
                                <h3 className="text-2xl font-bold text-indigo-400">Scene {sceneNumber}</h3>
                                <textarea
                                    value={sceneNotes[Number(sceneNumber)] || ''}
                                    onChange={(e) => onUpdateSceneNotes(Number(sceneNumber), e.target.value)}
                                    placeholder="Add scene notes here (e.g., location, mood, key props...)"
                                    className="w-full mt-2 p-2 bg-gray-900/50 border border-gray-600 rounded-md text-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    rows={2}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 scene-panels">
                                {(scenePanels as StoryboardPanelData[]).map((panel) => (
                                    <div key={panel.id} onDrop={(e) => handleDrop(e, panel)} onDragOver={handleDragOver}>
                                         <StoryboardPanel 
                                            panel={panel} 
                                            onUpdate={onUpdatePanel}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
});