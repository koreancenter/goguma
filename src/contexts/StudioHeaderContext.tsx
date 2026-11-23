import React, { createContext, useContext } from 'react';
import { FormInputEntity } from '../types';
import { LocalUser } from '../lib/localAuth';

export interface StudioHeaderContextValue {
  projectName: string;
  currentChapter: number;
  currentSection: string;
  formInputs: Record<string, FormInputEntity>;
  completedChapters: Set<number>;
  currentUser: LocalUser | null;
  onUpdateProjectName: (name: string) => void;
  onSelectChapter: (chapterId: number) => void;
  onSelectSection: (sectionKey: string) => void;
}

const defaultContext: StudioHeaderContextValue = {
  projectName: 'GOGUMA Spec Studio',
  currentChapter: 1,
  currentSection: 'project_name',
  formInputs: {},
  completedChapters: new Set<number>(),
  currentUser: null,
  onUpdateProjectName: () => {},
  onSelectChapter: () => {},
  onSelectSection: () => {},
};

const StudioHeaderContext = createContext<StudioHeaderContextValue>(defaultContext);

export const StudioHeaderProvider: React.FC<{
  value: StudioHeaderContextValue;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return (
    <StudioHeaderContext.Provider value={value}>
      {children}
    </StudioHeaderContext.Provider>
  );
};

export function useStudioHeader(): StudioHeaderContextValue {
  return useContext(StudioHeaderContext);
}
