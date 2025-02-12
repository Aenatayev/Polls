import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Bold,
  Italic,
  Underline,
  Type,
  Palette,
  Highlighter,
  Pencil,
  Undo2,
  Redo2,
  Minimize2,
  X,
  GripVertical,
} from 'lucide-react';

export default function CustomizationToolbar() {
  const { t } = useLanguage();
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Initialize position to right side of screen
    if (toolbarRef.current) {
      setPosition({
        x: window.innerWidth - toolbarRef.current.offsetWidth - 20,
        y: 100,
      });
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;

    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;

    // Keep toolbar within window bounds
    const maxX = window.innerWidth - (toolbarRef.current?.offsetWidth || 0);
    const maxY = window.innerHeight - (toolbarRef.current?.offsetHeight || 0);

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={toolbarRef}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      className={`fixed bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-200 ${
        isMinimized ? 'w-12' : 'w-64'
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-2 bg-gray-50 rounded-t-lg cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center">
          <GripVertical className="h-4 w-4 text-gray-400 mr-2" />
          {!isMinimized && (
            <span className="text-sm font-medium text-gray-700">
              {t('poll.toolbar.title')}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Minimize2 className="h-4 w-4 text-gray-400" />
          </button>
          <button
            onClick={() => {
              if (toolbarRef.current) {
                toolbarRef.current.style.display = 'none';
              }
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Tools */}
      {!isMinimized && (
        <div className="p-4 space-y-4">
          {/* Text Style */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('poll.toolbar.textStyle')}
            </label>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded">
                <Bold className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded">
                <Italic className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded">
                <Underline className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Font */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('poll.toolbar.font')}
            </label>
            <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 sm:text-sm">
              <option value="arial">Arial</option>
              <option value="times">Times New Roman</option>
              <option value="helvetica">Helvetica</option>
            </select>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('poll.toolbar.fontSize')}
            </label>
            <input
              type="number"
              min="8"
              max="72"
              defaultValue="16"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 sm:text-sm"
            />
          </div>

          {/* Colors */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('poll.toolbar.colors')}
            </label>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded group relative">
                <Palette className="h-4 w-4" />
                <input
                  type="color"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded group relative">
                <Highlighter className="h-4 w-4" />
                <input
                  type="color"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </button>
            </div>
          </div>

          {/* Drawing Tool */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('poll.toolbar.drawing')}
            </label>
            <button className="p-2 hover:bg-gray-100 rounded w-full flex items-center">
              <Pencil className="h-4 w-4 mr-2" />
              <span className="text-sm">{t('poll.toolbar.drawingTool')}</span>
            </button>
          </div>

          {/* History */}
          <div className="flex items-center justify-between pt-2 border-t">
            <button className="p-2 hover:bg-gray-100 rounded">
              <Undo2 className="h-4 w-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <Redo2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}