import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  activeSection: string | null;
  
  // Actions
  toggle: () => void;
  open: () => void;
  close: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  setActiveSection: (section: string | null) => void;
}

export const useSidebarStore = create<SidebarState>()(
  devtools(
    persist(
      (set, get) => ({
        isOpen: true,
        isCollapsed: false,
        activeSection: null,

        toggle: () => set((state) => ({ isOpen: !state.isOpen })),
        
        open: () => set({ isOpen: true }),
        
        close: () => set({ isOpen: false }),
        
        setCollapsed: (collapsed: boolean) => set({ isCollapsed: collapsed }),
        
        toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
        
        setActiveSection: (section: string | null) => set({ activeSection: section }),
      }),
      {
        name: 'sidebar-storage',
        partialize: (state) => ({ 
          isCollapsed: state.isCollapsed,
          isOpen: state.isOpen 
        }),
      }
    ),
    { name: 'SidebarStore' }
  )
);
