import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaExclamationCircle,
  FaExclamationTriangle,
  FaBell,
  FaInfoCircle,
  FaCheckCircle,
  FaCog
} from "react-icons/fa";

export type AlertType =
  | "error"
  | "warning"
  | "notification"
  | "info"
  | "success"
  | "system";

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
}

interface AlertsContextType {
  pushAlert: (message: string, type: AlertType, title?: string) => void;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

const MAX_VISIBLE = 6;
const ALERT_DURATION = 5000;
const TRANSITION_DELAY = 300;

const alertStyles: Record<AlertType, string> = {
  error: "bg-red-700 border-red-900",
  warning: "bg-amber-700 border-amber-900",
  notification: "bg-orange-700 border-orange-900",
  info: "bg-sky-700 border-sky-900",
  success: "bg-emerald-700 border-green-900",
  system: "bg-teal-700 border-teal-900"
};

const alertIcons: Record<AlertType, React.ReactElement> = {
  error: <FaExclamationCircle className="mr-3 text-lg" />,
  warning: <FaExclamationTriangle className="mr-3 text-lg" />,
  notification: <FaBell className="mr-3 text-lg" />,
  info: <FaInfoCircle className="mr-3 text-lg" />,
  success: <FaCheckCircle className="mr-3 text-lg" />,
  system: <FaCog className="mr-3 text-lg" />
};

const AlertItem: React.FC<{ alert: Alert; onRemove: (id: string) => void }> = ({
  alert,
  onRemove
}) => (
  <motion.div
    layout
    layoutId={alert.id}
    role="alert"
    initial={{ opacity: 0, scale: 0.9, y: -10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.85, y: -20 }}
    transition={{ duration: 0.35, ease: "easeInOut" }}
    whileHover={{ scale: 1.03 }}
    className={`px-3 py-2 rounded-md shadow-md shadow-black border-2 text-white w-72 md:w-80 lg:w-96 cursor-pointer ${alertStyles[alert.type]}`}
    onClick={() => onRemove(alert.id)}
  >
    <div className="flex items-center">
      {alertIcons[alert.type]}
      <div>
        <div className="font-bold">{alert.title}</div>
        <div className="text-sm">{alert.message}</div>
      </div>
    </div>
  </motion.div>
);

const StackedAlertsIndicator: React.FC<{ count: number }> = ({ count }) => (
  <motion.div
    layout
    layoutId="stacked-indicator"
    initial={{ opacity: 0, scale: 0.9, y: -10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.85, y: -20 }}
    transition={{ duration: 0.35, ease: "easeInOut" }}
    className="w-72 md:w-80 lg:w-96 h-12 rounded text-white bg-gray-800 border-2 border-gray-600 flex items-center justify-center shadow-md"
  >
    <span className="font-bold">+{count} alertas na fila</span>
  </motion.div>
);

export const AlertsProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [visibleAlerts, setVisibleAlerts] = useState<Alert[]>([]);
  const [queuedAlerts, setQueuedAlerts] = useState<Alert[]>([]);

  const pushAlert = useCallback(
    (message: string, type: AlertType, title: string = type.toUpperCase()) => {
      const id = crypto.randomUUID();
      const newAlert: Alert = { id, message, type, title };
      setVisibleAlerts((prev) => {
        if (prev.length < MAX_VISIBLE) {
          return [...prev, newAlert];
        } else {
          setQueuedAlerts((prevQueue) => [...prevQueue, newAlert]);
          return prev;
        }
      });
    },
    []
  );

  const removeAlert = useCallback((id: string) => {
    setVisibleAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  useEffect(() => {
    const timers = visibleAlerts.map((alert) =>
      setTimeout(() => removeAlert(alert.id), ALERT_DURATION)
    );
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [visibleAlerts, removeAlert]);

  useEffect(() => {
    if (visibleAlerts.length < MAX_VISIBLE && queuedAlerts.length > 0) {
      const timer = setTimeout(() => {
        setQueuedAlerts((prevQueue) => {
          const next = prevQueue[0];
          if (next) {
            setVisibleAlerts((prev) => [...prev, next]);
            return prevQueue.slice(1);
          }
          return prevQueue;
        });
      }, TRANSITION_DELAY);
      return () => clearTimeout(timer);
    }
  }, [visibleAlerts, queuedAlerts]);

  return (
    <AlertsContext.Provider value={{ pushAlert }}>
      {children}
      <div className="fixed top-0 right-0 m-4 z-50 flex flex-col space-y-2 items-end" aria-live="polite">
        <AnimatePresence initial={false} mode="popLayout">
          {visibleAlerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} onRemove={removeAlert} />
          ))}
          {queuedAlerts.length > 0 && (
            <StackedAlertsIndicator count={queuedAlerts.length} />
          )}
        </AnimatePresence>
      </div>
    </AlertsContext.Provider>
  );
};

export const useAlerts = (): AlertsContextType => {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error("useAlerts must be used within an AlertsProvider");
  }
  return context;
};
