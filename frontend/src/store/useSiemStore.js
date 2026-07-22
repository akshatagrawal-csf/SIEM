import { create } from 'zustand';

export const useSiemStore = create((set) => ({
  activeThreats: 142,
  systemStatus: 'Optimal',
  incidents: [],
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  addIncident: (incident) => set((state) => ({ 
    incidents: [incident, ...state.incidents].slice(0, 50) 
  })),
  setSystemStatus: (status) => set({ systemStatus: status }),
}));
