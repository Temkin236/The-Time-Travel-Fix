
export interface PosterData {
  originalImage: string;
  userInstructions?: string;
  remasteredImage?: string;
  extractedText?: string;
  division?: 'Development' | 'Cyber' | 'Data Science' | 'Capacity Building' | 'General/Events';
  status: 'idle' | 'analyzing' | 'generating' | 'completed' | 'error';
  error?: string;
}

export interface ExtractionResult {
  title: string;
  date: string;
  topic: string;
  otherDetails: string;
}
