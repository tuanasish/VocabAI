import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface ActionMenuItem {
    label: string;
    icon?: string;
    onClick?: () => void;
    to?: string;
    variant?: 'default' | 'danger';
}

interface ActionMenuProps {
    items: ActionMenuItem[];
    triggerIcon?: string; // Default is 'more_vert'
    className?: string;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ items, triggerIcon = 'more_vert', className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={`relative ${className}`} ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            >
                <span className="material-symbols-outlined text-xl">{triggerIcon}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 py-1 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                    {items.map((item, index) => {
                        const content = (
                            <div className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium">
                                {item.icon && (
                                    <span className={`material-symbols-outlined text-[20px] ${item.variant === 'danger' ? 'text-red-500' : 'text-slate-400'}`}>
                                        {item.icon}
                                    </span>
                                )}
                                <span className={item.variant === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}>
                                    {item.label}
                                </span>
                            </div>
                        );

                        const className = `block w-full text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${item.variant === 'danger' ? 'hover:bg-red-50 dark:hover:bg-red-900/10' : ''
                            }`;

                        if (item.to) {
                            return (
                                <Link
                                    key={index}
                                    to={item.to}
                                    className={className}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {content}
                                </Link>
                            );
                        }

                        return (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    item.onClick?.();
                                    setIsOpen(false);
                                }}
                                className={className}
                            >
                                {content}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ActionMenu;
