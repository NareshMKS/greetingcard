export type Orientation = 'square' | 'portrait' | 'landscape';

export const ORIENTATION_CANVAS_SIZES: Record<Orientation, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  landscape: { width: 1200, height: 675 },
};

export interface TextArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontFamily: string;
  fontWeight?: number;
  fontColor: string;
  maxFontSize: number;
  minFontSize: number;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface BackgroundImageAsset {
  assetId: string;
  url: string;
}

export interface TemplateConfig {
  templateId: string;
  orientation: Orientation;
  canvas: CanvasSize;
  backgroundImage: BackgroundImageAsset;
  textAreas: TextArea[];
}

export interface TemplateState {
  templateId: string;
  orientation: Orientation | null;
  canvas: CanvasSize;
  backgroundImage: string | null;
  backgroundImageData: string | null;
  backgroundImageFile: File | null;
  textAreas: TextArea[];
  selectedTextAreaId: string | null;
}

export type TemplateAction =
  | { type: 'SET_TEMPLATE_ID'; payload: string }
  | { type: 'SET_ORIENTATION'; payload: Orientation }
  | { type: 'SET_BACKGROUND_IMAGE'; payload: { filename: string; dataUrl: string; file: File } }
  | { type: 'CLEAR_BACKGROUND_IMAGE' }
  | { type: 'ADD_TEXT_AREA'; payload: string }
  | { type: 'SELECT_TEXT_AREA'; payload: string | null }
  | { type: 'UPDATE_TEXT_AREA'; payload: { id: string; updates: Partial<TextArea> } }
  | { type: 'DELETE_TEXT_AREA'; payload: string }
  | { type: 'MOVE_TEXT_AREA'; payload: { id: string; x: number; y: number } }
  | { type: 'RESIZE_TEXT_AREA'; payload: { id: string; x: number; y: number; width: number; height: number } }
  | { type: 'RESET_TEMPLATE' };

export const PREDEFINED_TEXT_AREA_IDS = [
  { id: 'recipientName', label: 'Recipient Name' },
  { id: 'occasion', label: 'Occasion' },
  { id: 'message', label: 'Message' },
  { id: 'senderName', label: 'Sender Name' },
] as const;

// Font options are now loaded dynamically from Google Fonts API
// Default font for new text areas
export const DEFAULT_FONT_FAMILY = 'Playfair Display';

export const TEXT_ALIGN_OPTIONS: Array<{ value: TextArea['textAlign']; label: string }> = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];
