import React from 'react';
import { PreferencesModal } from './PreferencesModal';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose }) => {
  return (
    <PreferencesModal
      isOpen={isOpen}
      initialTab="engine"
      onClose={onClose}
    />
  );
};
