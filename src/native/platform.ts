import { Capacitor } from '@capacitor/core';

/**
 * Single place to ask "where am I running?". Keep native checks behind these
 * helpers so upstream rebases touch as few files as possible.
 */
export const isNative = (): boolean => Capacitor.isNativePlatform();
export const isAndroid = (): boolean => Capacitor.getPlatform() === 'android';
export const isIOS = (): boolean => Capacitor.getPlatform() === 'ios';
