'use client';

import { useCallback, useRef, useState, memo, ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedItemProps {
  children: ReactNode | ((isHovered: boolean) => ReactNode);
  index: number;
  onClick?: () => void;
  className?: string;
}

const AnimatedItem = memo(({ children, index, onClick, className }: AnimatedItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.1, once: true });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      data-index={index}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={inView ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.9, opacity: 0, y: 20 }}
      transition={{ duration: 0.3, delay: 0.03 * (index % 10), ease: "easeOut" }}
      className={`cursor-pointer ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {typeof children === 'function' ? children(isHovered) : children}
    </motion.div>
  );
});

AnimatedItem.displayName = 'AnimatedItem';

interface AnimatedListProps<T extends { id?: string | number }> {
  items: T[];
  renderItem: (item: T, isHovered: boolean) => ReactNode;
  onItemSelect: (item: T) => void;
  className?: string;
  itemClassName?: string;
}

const AnimatedList = <T extends { id?: string | number },>({
  items,
  renderItem,
  onItemSelect,
  className = '',
  itemClassName = '',
}: AnimatedListProps<T>) => {
  const listRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((item: T) => {
    onItemSelect(item);
  }, [onItemSelect]);

  const renderedItems = useCallback(() => {
    return items.map((item: T, index: number) => (
      <AnimatedItem
        key={item.id || index}
        index={index}
        onClick={() => handleClick(item)}
        className={itemClassName}
      >
        {(isHovered: boolean) => renderItem(item, isHovered)}
      </AnimatedItem>
    ));
  }, [items, renderItem, itemClassName, handleClick]);

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={listRef}
        className="max-h-[600px] overflow-y-auto p-4 custom-scrollbar"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--primary) transparent',
          // GPU acceleration for scrolling
          willChange: 'transform',
          transform: 'translateZ(0)'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderedItems()}
        </div>
      </div>

      {/* Top Fade Gradient */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[var(--background)] to-transparent pointer-events-none" style={{ pointerEvents: 'none' }} />
      {/* Bottom Fade Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--background)] to-transparent pointer-events-none" style={{ pointerEvents: 'none' }} />
    </div>
  );
};

export default AnimatedList;
