import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AIState {
  provider: 'openai' | 'gemini' | 'anthropic';
  temperature: number;
  isOpen: boolean;
  setProvider: (provider: 'openai' | 'gemini' | 'anthropic') => void;
  setTemperature: (temp: number) => void;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      provider: 'gemini', // Default to free Gemini for testing
      temperature: 0.7,
      isOpen: false,
      setProvider: (provider) => set({ provider }),
      setTemperature: (temperature) => set({ temperature }),
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
      openChat: () => set({ isOpen: true }),
      closeChat: () => set({ isOpen: false }),
    }),
    {
      name: 'dreamnest-ai-settings',
    }
  )
);
