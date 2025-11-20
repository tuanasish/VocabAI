import React from 'react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Delete',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'danger'
}) => {
    if (!isOpen) return null;

    const variantStyles = variant === 'danger'
        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';

    // Handle ESC key
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            return () => document.removeEventListener('keydown', handleEsc);
        }
    }, [isOpen, onCancel]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 p-6 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-full ${variant === 'danger' ? 'bg-red-100 dark:bg-red-900/40' : 'bg-yellow-100 dark:bg-yellow-900/40'}`}>
                        <span className={`material-symbols-outlined text-2xl ${variant === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                            {variant === 'danger' ? 'delete' : 'warning'}
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
                </div>

                {/* Message */}
                <p className="text-slate-600 dark:text-slate-400 mb-6">{message}</p>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-colors ${variantStyles}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
