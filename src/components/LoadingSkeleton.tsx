import React from 'react';

interface LoadingSkeletonProps {
    variant?: 'card' | 'text' | 'circle' | 'rect';
    width?: string;
    height?: string;
    className?: string;
    count?: number;
}

/**
 * Reusable loading skeleton component with multiple variants
 * Supports dark mode and customizable dimensions
 */
const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
    variant = 'rect',
    width,
    height,
    className = '',
    count = 1,
}) => {
    const getVariantClasses = () => {
        switch (variant) {
            case 'card':
                return 'rounded-xl h-48 w-full';
            case 'text':
                return 'rounded h-4 w-full';
            case 'circle':
                return 'rounded-full w-12 h-12';
            case 'rect':
            default:
                return 'rounded-lg';
        }
    };

    const baseClasses = 'animate-pulse bg-slate-200 dark:bg-slate-700';
    const variantClasses = getVariantClasses();

    const style: React.CSSProperties = {};
    if (width) style.width = width;
    if (height) style.height = height;

    const skeletons = Array.from({ length: count }, (_, index) => (
        <div
            key={index}
            className={`${baseClasses} ${variantClasses} ${className}`}
            style={style}
        />
    ));

    return count > 1 ? <>{skeletons}</> : skeletons[0];
};

export default LoadingSkeleton;
