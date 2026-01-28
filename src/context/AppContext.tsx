import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Recipient } from '../types/recipient';
import type { CardTemplate } from '../types/template';
import { parseCSVFile } from '../services/csvParser';
import { generateEditedImage } from '../services/imageEditService';

export interface AppState {
  recipients: Recipient[];
  selectedTemplate: CardTemplate | null;
  templates: CardTemplate[];
  generatingRowIndex: number | null;
  /** Preview of the last generated image (right side panel) */
  previewImageUrl: string | null;
  previewRecipientName: string | null;
  error: string | null;
}

interface AppContextValue extends AppState {
  setRecipients: (r: Recipient[]) => void;
  setSelectedTemplate: (t: CardTemplate | null) => void;
  setTemplates: (t: CardTemplate[]) => void;
  setError: (e: string | null) => void;
  uploadCSV: (file: File) => Promise<void>;
  generateGreetingForRecipient: (index: number) => Promise<void>;
  reset: () => void;
}

const initialState: AppState = {
  recipients: [],
  selectedTemplate: null,
  templates: [],
  generatingRowIndex: null,
  previewImageUrl: null,
  previewRecipientName: null,
  error: null,
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({
  children,
  templates: defaultTemplates,
}: {
  children: ReactNode;
  templates: CardTemplate[];
}) {
  const [state, setState] = useState<AppState>({
    ...initialState,
    templates: defaultTemplates,
  });

  const setRecipients = useCallback((recipients: Recipient[]) => {
    setState((s) => ({ ...s, recipients, error: null }));
  }, []);

  const setSelectedTemplate = useCallback((selectedTemplate: CardTemplate | null) => {
    setState((s) => ({ ...s, selectedTemplate, error: null }));
  }, []);

  const setTemplates = useCallback((templates: CardTemplate[]) => {
    setState((s) => ({ ...s, templates }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((s) => ({ ...s, error }));
  }, []);

  const uploadCSV = useCallback(async (file: File) => {
    setState((s) => ({ ...s, error: null }));
    try {
      const recipients = await parseCSVFile(file);
      setState((s) => ({
        ...s,
        recipients,
        error: null,
      }));
    } catch (e) {
      setState((s) => ({
        ...s,
        error: e instanceof Error ? e.message : 'Invalid CSV',
      }));
    }
  }, []);

  const generateGreetingForRecipient = useCallback(async (index: number) => {
    const { recipients, selectedTemplate } = state;
    const r = recipients[index];
    const t = selectedTemplate;

    if (!r || !t) {
      setState((s) => ({
        ...s,
        generatingRowIndex: null,
        error: !t ? 'Please upload a template image first.' : s.error,
      }));
      return;
    }

    setState((s) => ({ ...s, generatingRowIndex: index, error: null }));

    // Build occasion-specific prompt using CSV fields
    const occ = r.occasion.trim().toLowerCase();
    const receiver = r.name || 'Friend';
    const sender = r.sender || 'Naresh';
    const message = r.message || '';

    const buildPrompt = (): string => {
      if (occ.includes('birthday')) {
        return `Add elegant birthday text to the existing image without altering the background or layout. ` +
          `Main heading text: “Happy Birthday ${receiver}” — styled in a classy, celebratory font with a refined and modern look. ` +
          `Subtext message: “${message || 'May God bless you with joy, good health, and great success in all that you do.'}” ` +
          `Closing line: “Warm wishes from ${sender}” — placed neatly below the message in a subtle yet readable font. ` +
          `Ensure the text is well-aligned, visually balanced, and blends naturally with the image. ` +
          `Maintain high readability, professional spacing, and a premium birthday greeting aesthetic. Do not modify or replace the original background.`;
      }
      if (occ.includes('promotion')) {
        return `Add elegant congratulatory text to the existing image without altering the background or layout. ` +
          `Main heading text: “Congratulations on Your Promotion” — styled in a classy, professional font with a refined and modern corporate look. ` +
          `Subtext message: “${message || 'Your dedication, hard work, and talent have truly paid off. Wishing you continued growth and success in your new role.'}” ` +
          `Closing line: “Best wishes from ${sender}” — placed neatly below the message in a subtle yet readable font. ` +
          `Ensure the text is well-aligned, visually balanced, and blends naturally with the image. ` +
          `Maintain high readability, professional spacing, and a premium congratulatory aesthetic. Do not modify or replace the original background.`;
      }
      if (occ.includes('festival')) {
        return `Add elegant festive greeting text to the existing image without altering the background or layout. ` +
          `Main heading text: “Warm Festival Wishes” — styled in a classy, celebratory font with a refined and modern festive look. ` +
          `Subtext message: “${message || 'May this festive season fill your life with happiness, peace, and prosperity.'}” ` +
          `Closing line: “With warm regards from ${sender}” — placed neatly below the message in a subtle yet readable font. ` +
          `Ensure the text is well-aligned, visually balanced, and blends naturally with the image. ` +
          `Maintain high readability, professional spacing, and a premium festive greeting aesthetic. Do not modify or replace the original background.`;
      }
      if (occ.includes('newyear') || occ.includes('new year')) {
        return `Add elegant New Year greeting text to the existing image without altering the background or layout. ` +
          `Main heading text: “Happy New Year 2026” — styled in a classy, celebratory font with a refined and modern look. ` +
          `Subtext message: “${message || 'May the new year bring new opportunities, good health, happiness, and success in every step of your journey.'}” ` +
          `Closing line: “Best wishes from ${sender}” — placed neatly below the message in a subtle yet readable font. ` +
          `Ensure the text is well-aligned, visually balanced, and blends naturally with the image. ` +
          `Maintain high readability, professional spacing, and a premium New Year greeting aesthetic. Do not modify or replace the original background.`;
      }
      if (occ.includes('christmas')) {
        return `Add elegant Christmas greeting text to the existing image without altering the background or layout. ` +
          `Main heading text: “Merry Christmas” — styled in a classy, warm, and festive font with a refined modern look. ` +
          `Subtext message: “${message || 'May this Christmas bring you joy, peace, love, and beautiful moments with your loved ones.'}” ` +
          `Closing line: “Warm wishes from ${sender}” — placed neatly below the message in a subtle yet readable font. ` +
          `Ensure the text is well-aligned, visually balanced, and blends naturally with the image. ` +
          `Maintain high readability, professional spacing, and a premium Christmas greeting aesthetic. Do not modify or replace the original background.`;
      }
      if (occ.includes('anniversary')) {
        return `Add elegant anniversary greeting text to the existing image without altering the background or layout. ` +
          `Main heading text: “Happy Anniversary” — styled in a classy, romantic font with a refined and modern look. ` +
          `Subtext message: “${message || 'Wishing you both a lifetime of love, understanding, and beautiful memories together.'}” ` +
          `Closing line: “Warm wishes from ${sender}” — placed neatly below the message in a subtle yet readable font. ` +
          `Ensure the text is well-aligned, visually balanced, and blends naturally with the image. ` +
          `Maintain high readability, professional spacing, and a premium anniversary greeting aesthetic. Do not modify or replace the original background.`;
      }
      if (occ.includes('congratulations') || occ.includes('congrats')) {
        return `Add elegant congratulatory text to the existing image without altering the background or layout. ` +
          `Main heading text: “Congratulations” — styled in a classy, confident font with a refined and modern look. ` +
          `Subtext message: “${message || 'Your achievement is a result of your dedication and perseverance. Wishing you continued success ahead.'}” ` +
          `Closing line: “Best wishes from ${sender}” — placed neatly below the message in a subtle yet readable font. ` +
          `Ensure the text is well-aligned, visually balanced, and blends naturally with the image. ` +
          `Maintain high readability, professional spacing, and a premium congratulatory aesthetic. Do not modify or replace the original background.`;
      }

      // Fallback generic prompt if no specific occasion matched
      return `Add elegant greeting text for ${occ || 'a special occasion'} to the existing image without altering the background or layout. ` +
        `Main heading text should include the name “${receiver}”. ` +
        `Subtext message: “${message || 'Warm wishes to you.'}” ` +
        `Closing line: “Best wishes from ${sender}”. ` +
        `Ensure the text is well-aligned, visually balanced, and blends naturally with the image. ` +
        `Maintain high readability, professional spacing, and do not modify or replace the original background.`;
    };

    try {
      // Convert the selected template background URL to a Blob
      const response = await fetch(t.background);
      const blob = await response.blob();

      const imageUrl = await generateEditedImage({
        image: blob,
        prompt: buildPrompt(),
        // defaults for lora/seed/steps/guidance are handled in the service
      });

      setState((s) => ({
        ...s,
        recipients: s.recipients.map((rec, i) =>
          i === index ? { ...rec, generatedImageUrl: imageUrl } : rec
        ),
        generatingRowIndex: null,
        previewImageUrl: imageUrl,
        previewRecipientName: r.name,
      }));
    } catch (e) {
      setState((s) => ({
        ...s,
        generatingRowIndex: null,
        error: e instanceof Error ? e.message : 'Image generation failed',
      }));
    }
  }, [state]);

  const reset = useCallback(() => {
    setState((s) => ({
      ...initialState,
      templates: s.templates,
    }));
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      setRecipients,
      setSelectedTemplate,
      setTemplates,
      setError,
      uploadCSV,
      generateGreetingForRecipient,
      reset,
    }),
    [
      state,
      setRecipients,
      setSelectedTemplate,
      setTemplates,
      setError,
      uploadCSV,
      generateGreetingForRecipient,
      reset,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
