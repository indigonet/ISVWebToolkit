import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      // Auth State
      user: null,
      token: null,
      isAuthenticated: false,

      login: (userData, token) => {
        set({ user: userData, token: token, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      // UI State
      showLogs: false,
      setShowLogs: (show) => set({ showLogs: show }),
      isSidebarOpen: true,
      setIsSidebarOpen: (open) => set({ isSidebarOpen: open }),

      // Inspector State
      inspectorApkInfo: null,
      apkFile: null, // Keep in memory, not persisted
      isInstalled: false,
      setInspectorApkInfo: (info) => set({ inspectorApkInfo: info }),
      setApkFile: (file) => set({ apkFile: file }),
      setIsInstalled: (installed) => set({ isInstalled: installed }),

      setInstallProgress: (progress) => set({ installProgress: progress }),

      // ADB/Logcat State
      adbLogcatData: '',
      setAdbLogcatData: (data) => set({ adbLogcatData: data }),
      appendAdbLogcatData: (data) => set((state) => ({ adbLogcatData: state.adbLogcatData + '\n' + data })),
      clearAdbLogcatData: () => set({ adbLogcatData: '' }),
      
      // Install Progress State
      installingMessage: null,
      installProgress: null,
      setInstallingMessage: (msg, progress = null) => set({ installingMessage: msg, installProgress: progress }),

      resetInspector: () => set({ 
        inspectorApkInfo: null, 
        apkFile: null, 
        isInstalled: false,
        installingMessage: null,
        installProgress: null
      }),
    }),
    {
      name: 'isv-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        inspectorApkInfo: state.inspectorApkInfo,
        isSidebarOpen: state.isSidebarOpen,
        showLogs: state.showLogs
      }),
    }
  )
);
