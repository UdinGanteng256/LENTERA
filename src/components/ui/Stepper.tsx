'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StepperProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  children: React.ReactNode;
}

const Stepper: React.FC<StepperProps> = ({ currentStep, totalSteps, children }) => {
  return (
    <div className="stepper-container" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      {/* Progress Bar */}
      <div className="stepper-progress" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '40px',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '2px',
          background: 'rgba(255,255,255,0.1)',
          zIndex: 0,
          transform: 'translateY(-50%)'
        }} />
        <motion.div 
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            height: '2px',
            background: 'var(--primary)',
            zIndex: 1,
            transform: 'translateY(-50%)',
            boxShadow: '0 0 10px var(--primary)'
          }}
        />
        
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div 
            key={i} 
            style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              background: i + 1 <= currentStep ? 'var(--primary)' : '#1A1A2E',
              border: '2px solid',
              borderColor: i + 1 <= currentStep ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
              color: i + 1 <= currentStep ? '#0F0F1B' : 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 800,
              zIndex: 2,
              transition: 'all 0.3s ease'
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="stepper-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Stepper;
