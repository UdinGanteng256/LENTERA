'use client';

import React from 'react';

interface SkeletonLoaderProps {
  type?: 'quran' | 'ceramah' | 'prayer';
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'quran', 
  count = 6 
}) => {
  if (type === 'quran') {
    return (
      <div className="skeleton-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-card glass-card">
            <div className="skeleton-circle" />
            <div className="skeleton-content">
              <div className="skeleton-line short" />
              <div className="skeleton-line" />
              <div className="skeleton-line" />
            </div>
            <div className="skeleton-arabic" />
          </div>
        ))}
        <style jsx>{`
          .skeleton-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 16px;
            width: 100%;
          }
          .skeleton-card {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 20px;
            overflow: hidden;
          }
          .skeleton-circle {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: linear-gradient(
              90deg,
              var(--panel-bg) 25%,
              rgba(212, 175, 55, 0.1) 50%,
              var(--panel-bg) 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
          .skeleton-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .skeleton-line {
            height: 12px;
            border-radius: 6px;
            background: linear-gradient(
              90deg,
              var(--panel-bg) 25%,
              rgba(212, 175, 55, 0.1) 50%,
              var(--panel-bg) 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
          .skeleton-line.short {
            width: 60%;
          }
          .skeleton-arabic {
            width: 60px;
            height: 40px;
            border-radius: 8px;
            background: linear-gradient(
              90deg,
              var(--panel-bg) 25%,
              rgba(212, 175, 55, 0.1) 50%,
              var(--panel-bg) 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  if (type === 'ceramah') {
    return (
      <div className="skeleton-video-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-video-card glass-card">
            <div className="skeleton-thumbnail" />
            <div className="skeleton-video-content">
              <div className="skeleton-line short" />
              <div className="skeleton-line" />
              <div className="skeleton-line" />
            </div>
          </div>
        ))}
        <style jsx>{`
          .skeleton-video-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
            width: 100%;
          }
          .skeleton-video-card {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 16px;
            overflow: hidden;
          }
          .skeleton-thumbnail {
            width: 100%;
            aspect-ratio: 16/9;
            border-radius: 12px;
            background: linear-gradient(
              90deg,
              var(--panel-bg) 25%,
              rgba(212, 175, 55, 0.1) 50%,
              var(--panel-bg) 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
          .skeleton-video-content {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .skeleton-line {
            height: 12px;
            border-radius: 6px;
            background: linear-gradient(
              90deg,
              var(--panel-bg) 25%,
              rgba(212, 175, 55, 0.1) 50%,
              var(--panel-bg) 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
          .skeleton-line.short {
            width: 70%;
          }
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;
