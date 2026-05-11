import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppRole {
  id: string;
  name: string;
  pin: string;
  allowedMenus: string[];
  isSystem?: boolean; // Cannot be deleted
}

export const DEFAULT_ROLES: AppRole[] = [
  { 
    id: '1', 
    name: 'Owner / Super Admin', 
    pin: '1111', 
    allowedMenus: ['all'], 
    isSystem: true 
  },
  { 
    id: '2', 
    name: 'Finance / Keuangan', 
    pin: '8899', 
    allowedMenus: ['dashboard-utama', 'roas-reports', 'closing', 'absensi', 'asset-mgmt', 'chemical-stock', 'pdf-maker', 'okr-dashboard'], 
    isSystem: false 
  },
  { 
    id: '3', 
    name: 'Advertiser / Meta Ads', 
    pin: '5555', 
    allowedMenus: ['dashboard-utama', 'roas-reports', 'absensi', 'ads-db', 'landing-page', 'leads', 'closing'], 
    isSystem: false 
  },
  { 
    id: '4', 
    name: 'Konten Kreator', 
    pin: '6666', 
    allowedMenus: ['absensi', 'content-plan', 'posting-schedule', 'tiktok-daily', 'youtube-daily', 'instagram-daily', 'facebook-daily', 'ig-shadow', 'fb-shadow', 'tiktok-shadow', 'youtube-shadow'], 
    isSystem: false 
  },
  { 
    id: '5', 
    name: 'KOL Specialist', 
    pin: '7777', 
    allowedMenus: ['absensi', 'kol-db', 'posting-schedule', 'content-plan', 'landing-page'], 
    isSystem: false 
  },
  { 
    id: '6', 
    name: 'SPV Sales Admin', 
    pin: '2222', 
    allowedMenus: ['dashboard-utama', 'absensi', 'leads', 'closing', 'crm-blast', 'complaint-qc', 'survey-b2b', 'calendar-spk', 'pdf-maker'], 
    isSystem: false 
  },
  { 
    id: '7', 
    name: 'Sales / Admin', 
    pin: '3333', 
    allowedMenus: ['absensi', 'leads', 'closing', 'calendar-spk'], 
    isSystem: false 
  },
  { 
    id: '8', 
    name: 'CRM (Customer Relationship)', 
    pin: '4444', 
    allowedMenus: ['absensi', 'leads', 'closing', 'crm-blast', 'complaint-qc', 'survey-b2b'], 
    isSystem: false 
  },
  { 
    id: '9', 
    name: 'SPV Cleaner / Ops', 
    pin: '1234', 
    allowedMenus: ['absensi', 'calendar-spk', 'docs-spk', 'daily-ops', 'asset-mgmt', 'chemical-stock', 'complaint-qc', 'survey-b2b', 'okr-dashboard'], 
    isSystem: false 
  },
  { 
    id: '10', 
    name: 'Area / Leader Ops', 
    pin: '4321', 
    allowedMenus: ['absensi', 'calendar-spk', 'docs-spk', 'daily-ops', 'asset-mgmt', 'chemical-stock'], 
    isSystem: false 
  },
  { 
    id: '11', 
    name: 'Daily Worker / Teknisi', 
    pin: '0000', 
    allowedMenus: ['absensi', 'calendar-spk', 'docs-spk'], 
    isSystem: false 
  }
];

interface AuthState {
  roles: AppRole[];
  currentUser: AppRole | null;
  login: (pin: string) => boolean;
  logout: () => void;
  addRole: (role: AppRole) => void;
  updateRole: (id: string, role: Partial<AppRole>) => void;
  deleteRole: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      roles: DEFAULT_ROLES,
      currentUser: null,
      login: (pin) => {
        const user = get().roles.find(r => r.pin === pin);
        if (user) {
          set({ currentUser: user });
          return true;
        }
        return false;
      },
      logout: () => set({ currentUser: null }),
      addRole: (role) => set((state) => ({ roles: [...state.roles, role] })),
      updateRole: (id, updatedRole) => set((state) => ({
        roles: state.roles.map(r => r.id === id ? { ...r, ...updatedRole } : r)
      })),
      deleteRole: (id) => set((state) => ({
        roles: state.roles.filter(r => r.id !== id || r.isSystem)
      }))
    }),
    {
      name: 'hagia-auth-storage'
    }
  )
);
