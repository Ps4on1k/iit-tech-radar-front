import { create } from 'zustand';

interface UIState {
  // Modal states
  isModalOpen: boolean;
  modalType: 'create' | 'edit' | 'view' | null;
  selectedEntityId: string | null;
  
  // Sidebar/Navigation
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  
  // Notifications
  unreadNotifications: number;
  
  // Actions
  openModal: (type: UIState['modalType'], entityId?: string) => void;
  closeModal: () => void;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  setUnreadNotifications: (count: number) => void;
  markNotificationsRead: () => void;
}

const initialState: UIState = {
  isModalOpen: false,
  modalType: null,
  selectedEntityId: null,
  isSidebarOpen: true,
  isMobileMenuOpen: false,
  unreadNotifications: 0,
  
  openModal: (type, entityId = null) => set({ 
    isModalOpen: true, 
    modalType: type, 
    selectedEntityId: entityId 
  }),
  closeModal: () => set({ 
    isModalOpen: false, 
    modalType: null, 
    selectedEntityId: null 
  }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  setUnreadNotifications: (unreadNotifications) => set({ unreadNotifications }),
  markNotificationsRead: () => set({ unreadNotifications: 0 }),
};

export const useUIStore = create<UIState>()((set) => ({
  ...initialState,
}));
