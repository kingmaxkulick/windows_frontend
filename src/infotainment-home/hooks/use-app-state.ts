/**
 * Custom hook that manages the application's UI state.
 * Handles app selection, modal visibility, and global UI state transitions.
 */

import { useState } from 'react';

interface ChargingStatus {
  isCharging: boolean;
  batteryLevel: number;
  timeRemaining: number;
  chargingPower: number;
  voltage: number;
  current: number;
}

interface AppState {
  isOpen: boolean;
  name: string | null;
  isClimateOpen: boolean;
  chargingStatus: ChargingStatus;
}

export const useAppState = () => {
  const [appState, setAppState] = useState<AppState>({
    isOpen: false,
    name: null,
    isClimateOpen: false,
    chargingStatus: {
      isCharging: true,
      batteryLevel: 45,
      timeRemaining: 125,
      chargingPower: 7.4,
      voltage: 240,
      current: 32
    }
  });

  const handleAppSelect = (appName: string | null): void => {
    if (appName === 'Climate') {
      setAppState((prev) => ({
        ...prev,
        isClimateOpen: !prev.isClimateOpen
      }));
    } else {
      setAppState((prev) => ({
        ...prev,
        isOpen: appName !== null,
        name: appName !== prev.name ? appName : null
      }));
    }
  };

  const handleCloseApp = (): void => {
    setAppState((prev) => ({
      ...prev,
      isOpen: false,
      name: null
    }));
  };

  const handleCloseClimate = (): void => {
    setAppState((prev) => ({
      ...prev,
      isClimateOpen: false
    }));
  };

  const handleInfoBoxClick = (appName: string): void => {
    if (!appState.isOpen) {
      setAppState((prev) => ({
        ...prev,
        isOpen: true,
        name: appName
      }));
    }
  };

  const showMainContent: boolean = Boolean(
    appState.isOpen && appState.name && appState.name !== 'Climate'
  );

  return {
    appState,
    handleAppSelect,
    handleCloseApp,
    handleCloseClimate,
    handleInfoBoxClick,
    showMainContent
  };
};