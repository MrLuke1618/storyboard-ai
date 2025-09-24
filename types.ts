export interface AnalyzedShot {
    scene: number;
    shot: number;
    description: string;
    shotType: string;
    dialogue: string;
    duration?: number;
}

export interface StoryboardPanelData {
    id: string;
    scene: number;
    shot: number;
    description: string;
    shotType: string;
    dialogue: string;
    imageUrl: string;
    duration?: number;
}

export type VisualStyle = 'Cinematic' | 'Film Noir' | 'Technicolor' | 'Indie / Gritty';

export type View = 'dashboard' | 'storyboard' | 'characterDatabase' | 'shotList';

export interface CharacterTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface CharacterProfile {
  id: string;
  name: string;
  description: string;
  imageUrl?: string; // Optional
  arc?: string;
  relationships?: string;
  voice?: string;
  tasks?: CharacterTask[];
}

export type SceneNotes = Record<number, string>;

export interface StoryboardState {
    panels: StoryboardPanelData[];
    notes: SceneNotes;
}