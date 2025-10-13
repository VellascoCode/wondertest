// src/utils/toast.ts
import toast from 'react-hot-toast';

export const showAlert = (
  message: string,
  type: 'error' | 'success' | 'info' | 'warning' = 'info',
  title?: string
) => {
  const iconMap = {
    error: '❌',
    success: '✅',
    info: 'ℹ️',
    warning: '⚠️'
  };

  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-gray-800 text-white border-2 border-gray-600 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="text-xl mr-3">{iconMap[type]}</div>
          <div className="flex-1">
            {title && <p className="text-sm font-semibold">{title}</p>}
            <p className="mt-1 text-sm">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-700">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:bg-gray-700"
        >
          ✖
        </button>
      </div>
    </div>
  ));
};