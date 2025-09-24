import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { StoryboardCanvas } from './components/StoryboardCanvas';
import { Footer } from './components/Footer';
import { CharacterDatabase } from './components/CharacterDatabase';
import { Dashboard } from './components/Dashboard';
import { ShotList } from './components/ShotList';
import { WelcomeModal } from './components/WelcomeModal';
import { analyzeScript, generateImageForShot } from './services/geminiService';
import { StoryboardPanelData, VisualStyle, View, AnalyzedShot, SceneNotes, StoryboardState, CharacterProfile, CharacterTask } from './types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useHistoryState } from './hooks/useHistoryState';


const App: React.FC = () => {
    const initialState: StoryboardState = { panels: [], notes: {} };
    const { 
        state: storyboardState, 
        setState: setStoryboardState,
        resetState: resetStoryboardState,
        undo, 
        redo,
        canUndo,
        canRedo,
    } = useHistoryState<StoryboardState>(initialState);
    
    const { panels: storyboardPanels, notes: sceneNotes } = storyboardState;

    const [analyzedShots, setAnalyzedShots] = useState<AnalyzedShot[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<View>('dashboard');
    const [showWelcome, setShowWelcome] = useState<boolean>(false);
    const storyboardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const hasVisited = localStorage.getItem('storyboard-ai-visited');
        if (!hasVisited) {
            setShowWelcome(true);
        }
    }, []);

    const renumberShots = (panels: StoryboardPanelData[]): StoryboardPanelData[] => {
        const sceneShotCounters: Record<number, number> = {};
        return panels.map(panel => {
            if (!sceneShotCounters[panel.scene]) {
                 sceneShotCounters[panel.scene] = 0;
            }
            sceneShotCounters[panel.scene]++;
            return { ...panel, shot: sceneShotCounters[panel.scene] };
        });
    };

    const handleGenerateStoryboard = useCallback(async (script: string, visualStyle: VisualStyle) => {
        if (!script.trim()) {
            setError('Script cannot be empty.');
            return;
        }
        setIsLoading(true);
        setError(null);
        resetStoryboardState({ panels: [], notes: {} });
        setAnalyzedShots([]);

        try {
            setLoadingMessage('Analyzing script and identifying scenes...');
            const shots = await analyzeScript(script);
            setAnalyzedShots(shots);

            if (!shots || shots.length === 0) {
                setError('Could not identify any shots in the script. Try being more descriptive.');
                setIsLoading(false);
                return;
            }

            const panelPromises = shots.map(async (shot, index) => {
                setLoadingMessage(`Generating image for shot ${index + 1} of ${shots.length}...`);
                const imageUrl = await generateImageForShot(shot.description, visualStyle);
                return {
                    id: `${shot.scene}-${shot.shot}-${Date.now()}-${index}`,
                    scene: shot.scene,
                    shot: shot.shot,
                    description: shot.description,
                    shotType: shot.shotType,
                    dialogue: shot.dialogue,
                    duration: shot.duration,
                    imageUrl,
                };
            });
            
            const panels = await Promise.all(panelPromises);
            resetStoryboardState({ panels: renumberShots(panels), notes: {} });
            
            const generationCount = parseInt(localStorage.getItem('storyboard-ai-generations') || '0', 10);
            localStorage.setItem('storyboard-ai-generations', (generationCount + 1).toString());

        } catch (err) {
            console.error(err);
            setError('An error occurred while generating the storyboard. Please check the console for details.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [resetStoryboardState]);

    const handleExportPDF = async () => {
        if (storyboardPanels.length === 0) {
            alert('No storyboard to export!');
            return;
        }
    
        setIsExporting(true);
    
        try {
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const margin = 40;
    
            // --- Helper function to ensure images are loaded ---
            const loadImage = (src: string): Promise<HTMLImageElement> => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => resolve(img);
                    img.onerror = (err) => {
                        console.error(`Failed to load image: ${src}`, err);
                        reject(err);
                    };
                    img.src = src;
                });
            };

            const ensureImagesLoaded = (element: HTMLElement) => {
                const images = Array.from(element.querySelectorAll('img'));
                return Promise.all(images.map(img => {
                    if (img.complete) return Promise.resolve();
                    return new Promise(resolve => {
                        img.onload = img.onerror = resolve;
                    });
                }));
            };

            // --- 1. Title Page ---
            pdf.setFillColor(17, 24, 39); // bg-gray-900
            pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(224, 231, 255); // text-indigo-200
            pdf.setFontSize(48);
            pdf.text('Storyboard AI Export', pdfWidth / 2, pdfHeight / 2 - 60, { align: 'center' });
            pdf.setFontSize(16);
            pdf.setTextColor(156, 163, 175); // text-gray-400
            pdf.text(new Date().toLocaleDateString(), pdfWidth / 2, pdfHeight / 2 - 30, { align: 'center' });
            
            const sceneCount = new Set(storyboardPanels.map(p => p.scene)).size;
            const shotCount = storyboardPanels.length;
            pdf.text(`Scenes: ${sceneCount} | Shots: ${shotCount}`, pdfWidth / 2, pdfHeight / 2, { align: 'center' });
    
            // --- 2. Character Profiles Page ---
            const storedCharacters = localStorage.getItem('storyboard-ai-characters');
            const characters: CharacterProfile[] = storedCharacters ? JSON.parse(storedCharacters) : [];
            if (characters.length > 0) {
                pdf.addPage();
                pdf.setFillColor(17, 24, 39);
                pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
                pdf.setFontSize(24);
                pdf.setTextColor(224, 231, 255);
                pdf.text('Character Profiles', margin, margin);
                let yPos = margin + 40;

                const drawDetail = (title: string, content: string | undefined, startY: number): number => {
                    if (!content) return startY;
                    let currentY = startY;
                    pdf.setFontSize(10).setFont('helvetica', 'bold').setTextColor(199, 210, 254);
                    pdf.text(title, margin + 70, currentY);
                    currentY += 12;
                    pdf.setFontSize(9).setFont('helvetica', 'normal').setTextColor(156, 163, 175);
                    const lines = pdf.splitTextToSize(content, pdfWidth - margin * 2 - 80);
                    pdf.text(lines, margin + 70, currentY);
                    return currentY + lines.length * 10 + 5;
                };

                for (const char of characters) {
                    let textBlockHeight = 0;
                    const fields = [char.description, char.arc, char.relationships, char.voice];
                    fields.forEach(f => {
                      if (f) textBlockHeight += (pdf.splitTextToSize(f, pdfWidth - margin * 2 - 80).length * 10) + 20;
                    });
                     if (char.tasks && char.tasks.length > 0) {
                        textBlockHeight += 12; // Title
                        textBlockHeight += char.tasks.length * 10; // Each task
                    }
                    const estimatedHeight = Math.max(80, textBlockHeight);
                    
                    if (yPos + estimatedHeight > pdfHeight - margin) {
                        pdf.addPage();
                        pdf.setFillColor(17, 24, 39);
                        pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
                        yPos = margin;
                        pdf.setFontSize(24).setTextColor(224, 231, 255);
                        pdf.text('Character Profiles (cont.)', margin, margin);
                        yPos += 40;
                    }

                    if (char.imageUrl) {
                        try {
                           const img = await loadImage(char.imageUrl);
                           pdf.addImage(img, 'JPEG', margin, yPos, 60, 60);
                        } catch (e) { 
                           pdf.setDrawColor(107, 114, 128);
                           pdf.rect(margin, yPos, 60, 60, 'D');
                        }
                    } else {
                        pdf.setDrawColor(107, 114, 128);
                        pdf.rect(margin, yPos, 60, 60, 'D');
                    }

                    let textY = yPos;
                    pdf.setFontSize(14).setFont('helvetica', 'bold').setTextColor(224, 231, 255);
                    pdf.text(char.name, margin + 70, textY + 15);
                    textY += 25;
                    
                    pdf.setFontSize(9).setFont('helvetica', 'normal').setTextColor(156, 163, 175);
                    const descLines = pdf.splitTextToSize(char.description, pdfWidth - margin * 2 - 80);
                    pdf.text(descLines, margin + 70, textY);
                    textY += descLines.length * 10 + 15;
                    
                    textY = drawDetail("Character Arc / Goal", char.arc, textY);
                    textY = drawDetail("Key Relationships", char.relationships, textY);
                    textY = drawDetail("Voice / Mannerisms", char.voice, textY);

                    if (char.tasks && char.tasks.length > 0) {
                        pdf.setFontSize(10).setFont('helvetica', 'bold').setTextColor(199, 210, 254);
                        pdf.text("Task Reminders", margin + 70, textY);
                        textY += 12;

                        for (const task of char.tasks) {
                            const taskSymbol = task.completed ? '✓' : '☐';
                            pdf.setFontSize(9).setFont('helvetica', 'normal').setTextColor(156, 163, 175);
                            const taskLines = pdf.splitTextToSize(`${taskSymbol} ${task.text}`, pdfWidth - margin * 2 - 85);
                            pdf.text(taskLines, margin + 75, textY);
                            textY += taskLines.length * 10;
                        }
                    }
                    
                    yPos = Math.max(yPos + 70, textY) + 10;
                }
            }
    
            // --- 3. Storyboard Scenes ---
            const storyboardEl = storyboardRef.current;
            if (storyboardEl) {
                const sceneContainers = storyboardEl.querySelectorAll('.scene-container');
                for (let i = 0; i < sceneContainers.length; i++) {
                    const sceneEl = sceneContainers[i] as HTMLElement;
                    
                    await ensureImagesLoaded(sceneEl);

                    pdf.addPage();
                    const sceneNumber = sceneEl.dataset.sceneNumber;
                    const note = sceneNotes[Number(sceneNumber)] || '';
    
                    pdf.setFontSize(18).setTextColor(224, 231, 255);
                    pdf.text(`Scene ${sceneNumber}`, margin, margin);
                    let noteHeight = 0;
                    if (note) {
                        pdf.setFontSize(10).setTextColor(156, 163, 175);
                        const noteLines = pdf.splitTextToSize(note, pdfWidth - margin * 2);
                        pdf.text(noteLines, margin, margin + 25);
                        noteHeight = noteLines.length * 10 + 15;
                    }
                    
                    const canvas = await html2canvas(sceneEl.querySelector('.scene-panels')!, { scale: 2, backgroundColor: '#111827', useCORS: true });
                    const imgData = canvas.toDataURL('image/png');
                    const imgHeight = (canvas.height * (pdfWidth - margin * 2)) / canvas.width;
                    pdf.addImage(imgData, 'PNG', margin, margin + 20 + noteHeight, pdfWidth - margin * 2, imgHeight);
                }
            }
    
            // --- 4. Shot List Table ---
            pdf.addPage();
            pdf.setFillColor(17, 24, 39);
            pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
            pdf.setFontSize(24).setTextColor(224, 231, 255);
            pdf.text('Shot List', margin, margin);
            let y = margin + 40;

            const drawTableHeader = () => {
                pdf.setFontSize(10).setFont('helvetica', 'bold');
                pdf.setTextColor(209, 213, 219); // text-gray-300
                pdf.text("Scene", margin, y);
                pdf.text("Shot", margin + 40, y);
                pdf.text("Type", margin + 80, y);
                pdf.text("Dur.", margin + 180, y);
                pdf.text("Description", margin + 220, y);
                y += 15;
                pdf.setDrawColor(107, 114, 128); // gray-500
                pdf.line(margin, y, pdfWidth - margin, y);
                y += 10;
            };

            drawTableHeader();
            
            for (const shot of storyboardPanels) {
                pdf.setFontSize(9).setFont('helvetica', 'normal').setTextColor(156, 163, 175);
                const descLines = pdf.splitTextToSize(shot.description, pdfWidth - margin * 2 - 220);
                const rowHeight = descLines.length * 10 + 5;

                if (y + rowHeight > pdfHeight - margin) {
                    pdf.addPage();
                    pdf.setFillColor(17, 24, 39);
                    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
                    y = margin;
                    drawTableHeader();
                }

                pdf.text(String(shot.scene), margin, y);
                pdf.text(String(shot.shot), margin + 40, y);
                pdf.text(shot.shotType, margin + 80, y);
                pdf.text(String(shot.duration || 'N/A'), margin + 180, y);
                pdf.text(descLines, margin + 220, y);
                y += rowHeight;
            }
    
            pdf.save(`StoryboardAI_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (err) {
            console.error("Failed to export PDF:", err);
            alert("An error occurred while exporting the PDF. Please check the console.");
        } finally {
            setIsExporting(false);
        }
    };
    
    const handleCloseWelcome = (dontShowAgain: boolean) => {
        setShowWelcome(false);
        if (dontShowAgain) {
            localStorage.setItem('storyboard-ai-visited', 'true');
        }
    };
    
    const handleUpdatePanel = (updatedPanel: StoryboardPanelData) => {
        const newPanels = storyboardPanels.map(p => (p.id === updatedPanel.id ? updatedPanel : p));
        setStoryboardState({ ...storyboardState, panels: newPanels });
    };

    const handleReorderPanels = (draggedId: string, targetId: string, targetScene: number) => {
        const draggedPanel = storyboardPanels.find(p => p.id === draggedId);
        if (!draggedPanel) return;

        const updatedPanel = { ...draggedPanel, scene: targetScene };
        const otherPanels = storyboardPanels.filter(p => p.id !== draggedId);
        
        const targetIndex = otherPanels.findIndex(p => p.id === targetId);
        
        if (targetIndex !== -1) {
            otherPanels.splice(targetIndex, 0, updatedPanel);
        } else {
            // Find the last index of the target scene and insert after it
            const lastIndexOfScene = otherPanels.map(p => p.scene).lastIndexOf(targetScene);
            if (lastIndexOfScene !== -1) {
                otherPanels.splice(lastIndexOfScene + 1, 0, updatedPanel);
            } else {
                otherPanels.push(updatedPanel);
            }
        }
        
        setStoryboardState({ ...storyboardState, panels: renumberShots(otherPanels) });
    };
    
    const handleUpdateSceneNotes = (sceneNumber: number, text: string) => {
        setStoryboardState({
            ...storyboardState,
            notes: { ...storyboardState.notes, [sceneNumber]: text },
        });
    };

    const renderView = () => {
        switch(view) {
            case 'dashboard':
                return <Dashboard onSetView={setView} />;
            case 'storyboard':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <InputPanel onGenerate={handleGenerateStoryboard} isLoading={isLoading} />
                        </div>
                        <div className="lg:col-span-2">
                            <StoryboardCanvas 
                                panels={storyboardPanels} 
                                isLoading={isLoading} 
                                loadingMessage={loadingMessage} 
                                error={error}
                                sceneNotes={sceneNotes}
                                onUpdateSceneNotes={handleUpdateSceneNotes}
                                onUpdatePanel={handleUpdatePanel}
                                onReorderPanels={handleReorderPanels}
                                onUndo={undo}
                                onRedo={redo}
                                canUndo={canUndo}
                                canRedo={canRedo}
                                ref={storyboardRef}
                            />
                        </div>
                    </div>
                );
            case 'characterDatabase':
                return <CharacterDatabase />;
            case 'shotList':
                 const shotsForList: AnalyzedShot[] = storyboardPanels.map(p => ({
                    scene: p.scene,
                    shot: p.shot,
                    description: p.description,
                    shotType: p.shotType,
                    dialogue: p.dialogue,
                    duration: p.duration
                }));
                return <ShotList shots={shotsForList} setShots={(newShots) => {
                     const updatedPanels = storyboardPanels.map((panel, index) => ({
                        ...panel,
                        ...newShots[index]
                    }));
                    setStoryboardState({ ...storyboardState, panels: renumberShots(updatedPanels) });
                }} />;
            default:
                return <Dashboard onSetView={setView} />;
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
            {showWelcome && <WelcomeModal onClose={handleCloseWelcome} />}
            <Header 
                onExportPDF={handleExportPDF} 
                canExport={storyboardPanels.length > 0}
                isExporting={isExporting}
                currentView={view}
                onSetView={setView}
                onShowHelp={() => setShowWelcome(true)}
            />
            <main className="flex-grow container mx-auto px-6 sm:px-8 py-12">
                {renderView()}
            </main>
            <Footer />
        </div>
    );
};

export default App;