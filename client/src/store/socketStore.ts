import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  connect: (userId: string) => void;
  disconnect: () => void;
  setOnlineUsers: (users: string[]) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  onlineUsers: [],

  connect: (userId: string) => {
    if (get().socket) return;

    const socket = io(window.location.origin, {
      query: { userId },
      withCredentials: true,
    });

    socket.on('connect', () => {
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('user_online', ({ userId: uid }: { userId: string }) => {
      set((state) => ({
        onlineUsers: [...new Set([...state.onlineUsers, uid])],
      }));
    });

    socket.on('user_offline', ({ userId: uid }: { userId: string }) => {
      set((state) => ({
        onlineUsers: state.onlineUsers.filter((id) => id !== uid),
      }));
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  setOnlineUsers: (users) => set({ onlineUsers: users }),
}));
