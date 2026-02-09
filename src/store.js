import { create } from 'zustand';

const useStore = create((set) => ({
  fingerCount: 0, // The Watcher updates this
  setFingerCount: (count) => set({ fingerCount: count }),
}));

export default useStore;