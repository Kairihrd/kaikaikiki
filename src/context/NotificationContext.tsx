// アプリ内通知(いいね等)と DM 未読状態をアプリ全体で共有し、AsyncStorage に保存する。
// OSプッシュ通知(expo-notifications)は使わず、まずはアプリ内の疑似通知のみ。
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTI_KEY = "senseed:notifications";
const DM_KEY = "senseed:dmUnread";

export type NoticeType =
  | "support"
  | "like"
  | "comment"
  | "theme"
  | "billboard"
  | "likeDynamic";

export interface Notice {
  id: string;
  type: NoticeType;
  textKey: string; // i18n キー
  timeKey: string; // i18n キー
  read: boolean;
}

// 初期通知(すべて未読 → 起動時に通知バッジが出る)。
const SEED: Notice[] = [
  { id: "n1", type: "support", textKey: "notif.support", timeKey: "time.5min", read: false },
  { id: "n2", type: "like", textKey: "notif.like", timeKey: "time.1hour", read: false },
  { id: "n3", type: "comment", textKey: "notif.comment", timeKey: "time.3hours", read: false },
  { id: "n4", type: "theme", textKey: "notif.theme", timeKey: "time.yesterday", read: false },
  { id: "n5", type: "billboard", textKey: "notif.billboard", timeKey: "time.2days", read: false },
];

interface NotificationContextValue {
  notifications: Notice[];
  unreadCount: number;
  dmUnread: number;
  addLikeNotification: () => void;
  markAllRead: () => void;
  receiveDm: () => void;
  markDmRead: () => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  dmUnread: 0,
  addLikeNotification: () => {},
  markAllRead: () => {},
  receiveDm: () => {},
  markDmRead: () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notice[]>(SEED);
  const [dmUnread, setDmUnread] = useState(1); // 初期未読DM 1件

  useEffect(() => {
    (async () => {
      try {
        const [n, dm] = await Promise.all([
          AsyncStorage.getItem(NOTI_KEY),
          AsyncStorage.getItem(DM_KEY),
        ]);
        if (n) setNotifications(JSON.parse(n));
        if (dm !== null) setDmUnread(Number(dm));
      } catch {
        // 保存無しなら SEED のまま
      }
    })();
  }, []);

  const persistNoti = (list: Notice[]) => {
    AsyncStorage.setItem(NOTI_KEY, JSON.stringify(list)).catch(() => {});
  };
  const persistDm = (n: number) => {
    AsyncStorage.setItem(DM_KEY, String(n)).catch(() => {});
  };

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      dmUnread,
      addLikeNotification: () => {
        setNotifications((prev) => {
          const next: Notice[] = [
            {
              id: `like-${Date.now()}`,
              type: "likeDynamic",
              textKey: "notif.likeDynamic",
              timeKey: "time.now",
              read: false,
            },
            ...prev,
          ];
          persistNoti(next);
          return next;
        });
      },
      markAllRead: () => {
        setNotifications((prev) => {
          if (prev.every((n) => n.read)) return prev;
          const next = prev.map((n) => ({ ...n, read: true }));
          persistNoti(next);
          return next;
        });
      },
      receiveDm: () => {
        setDmUnread((prev) => {
          const next = prev + 1;
          persistDm(next);
          return next;
        });
      },
      markDmRead: () => {
        setDmUnread((prev) => {
          if (prev === 0) return prev;
          persistDm(0);
          return 0;
        });
      },
    }),
    [notifications, dmUnread],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
