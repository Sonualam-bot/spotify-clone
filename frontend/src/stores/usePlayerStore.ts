import { Song } from "@/types";
import { create } from "zustand";
import { useChatStore } from "./useChatStore";

interface PlayerStore {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  currentIndex: number;

  initializeQueue: (songs: Song[]) => void;
  playAlbum: (songs: Song[], startIndex?: number) => void;
  setCurrentSong: (song: Song | null) => void;

  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  queue: [],
  currentIndex: -1,

  initializeQueue: (songs: Song[]) => {
    set({
      queue: songs,
      currentSong: get().currentSong || songs[0],
      currentIndex: get().currentIndex === -1 ? 0 : get().currentIndex,
    });
  },

  playAlbum: (songs: Song[], startIndex = 0) => {
    if (songs.length === 0) return;

    const song = songs[startIndex];

    const socket = useChatStore.getState().socket;

    if (socket.auth) {
      socket.emit("update_activity", {
        userId: socket.auth.userId,
        activity: `Playing ${song.title} by ${song.title}`,
      });
    }

    set({
      queue: songs,
      currentSong: song,
      currentIndex: startIndex,
      isPlaying: true,
    });
  },

  setCurrentSong: (song: Song | null) => {
    if (!song) return;

    const socket = useChatStore.getState().socket;

    if (socket.auth) {
      socket.emit("update_activity", {
        userId: socket.auth.userId,
        activity: `Playing ${song.title} by ${song.title}`,
      });
    }

    const songIndex = get().queue.findIndex((s) => s._id === song._id);

    set({
      currentSong: song,
      isPlaying: true,
      currentIndex: songIndex !== -1 ? songIndex : get().currentIndex,
    });
  },
  togglePlay: () => {
    const willStartPlaying = !get().isPlaying;

    const currentSong = get().currentSong;
    const socket = useChatStore.getState().socket;

    if (socket.auth) {
      socket.emit("update_activity", {
        userId: socket.auth.userId,
        activity:
          willStartPlaying && currentSong
            ? `Playing ${currentSong.title} by ${currentSong.title}`
            : "Idle",
      });
    }

    set({
      isPlaying: willStartPlaying,
    });
  },
  playNext: () => {
    const { currentIndex, queue } = get();
    const nextIndex = currentIndex + 1;

    //if there is a next song to play
    if (nextIndex < queue.length) {
      const nextSong = queue[nextIndex];

      const socket = useChatStore.getState().socket;

      if (socket.auth) {
        socket.emit("update_activity", {
          userId: socket.auth.userId,
          activity: `Playing ${nextSong.title} by ${nextSong.title}`,
        });
      }
      set({
        currentSong: nextSong,
        currentIndex: nextIndex,
        isPlaying: true,
      });
    } else {
      //no next song
      set({
        isPlaying: false,
      });
      const socket = useChatStore.getState().socket;

      if (socket.auth) {
        socket.emit("update_activity", {
          userId: socket.auth.userId,
          activity: `Idle`,
        });
      }
    }
  },
  playPrevious: () => {
    const { currentIndex, queue } = get();
    const previousIndex = currentIndex - 1;

    if (previousIndex >= 0) {
      const previousSong = queue[previousIndex];

      const socket = useChatStore.getState().socket;

      if (socket.auth) {
        socket.emit("update_activity", {
          userId: socket.auth.userId,
          activity: `Playing ${previousSong.title} by ${previousSong.title}`,
        });
      }

      set({
        currentIndex: previousIndex,
        currentSong: previousSong,
        isPlaying: true,
      });
    } else {
      set({
        isPlaying: false,
      });

      const socket = useChatStore.getState().socket;

      if (socket.auth) {
        socket.emit("update_activity", {
          userId: socket.auth.userId,
          activity: `Idle`,
        });
      }
    }
  },
}));
