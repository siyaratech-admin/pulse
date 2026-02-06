/**
 * LocalStorage utilities for form auto-save functionality
 */

export interface FormAutoSaveData {
  formData: Record<string, any>;
  timestamp: number;
  doctype: string;
  docname?: string;
}

export class FormAutoSave {
  private static readonly STORAGE_PREFIX = 'pulse_form_autosave_';
  private static readonly MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Generate storage key for a form
   */
  private static getStorageKey(doctype: string, docname?: string): string {
    const key = docname ? `${doctype}_${docname}` : doctype;
    return `${this.STORAGE_PREFIX}${key}`;
  }

  /**
   * Save form data to localStorage
   */
  static saveFormData(
    doctype: string, 
    formData: Record<string, any>, 
    docname?: string
  ): void {
    try {
      const key = this.getStorageKey(doctype, docname);
      const autoSaveData: FormAutoSaveData = {
        formData,
        timestamp: Date.now(),
        doctype,
        docname
      };
      
      console.log(`Saving to localStorage with key: ${key}`, autoSaveData);
      localStorage.setItem(key, JSON.stringify(autoSaveData));
      
      // Clean up old entries
      this.cleanupOldEntries();
    } catch (error) {
      console.warn('Failed to save form data to localStorage:', error);
    }
  }

  /**
   * Load form data from localStorage
   */
  static loadFormData(doctype: string, docname?: string): Record<string, any> | null {
    try {
      const key = this.getStorageKey(doctype, docname);
      const stored = localStorage.getItem(key);
      
      console.log(`Loading from localStorage with key: ${key}`, stored);
      
      if (!stored) {
        return null;
      }

      const autoSaveData: FormAutoSaveData = JSON.parse(stored);
      
      // Check if data is too old
      if (Date.now() - autoSaveData.timestamp > this.MAX_AGE_MS) {
        this.removeFormData(doctype, docname);
        return null;
      }

      console.log('Loaded auto-save data:', autoSaveData.formData);
      return autoSaveData.formData;
    } catch (error) {
      console.warn('Failed to load form data from localStorage:', error);
      return null;
    }
  }

  /**
   * Remove form data from localStorage
   */
  static removeFormData(doctype: string, docname?: string): void {
    try {
      const key = this.getStorageKey(doctype, docname);
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove form data from localStorage:', error);
    }
  }

  /**
   * Check if form data exists in localStorage
   */
  static hasFormData(doctype: string, docname?: string): boolean {
    try {
      const key = this.getStorageKey(doctype, docname);
      const stored = localStorage.getItem(key);
      
      if (!stored) {
        return false;
      }

      const autoSaveData: FormAutoSaveData = JSON.parse(stored);
      
      // Check if data is too old
      if (Date.now() - autoSaveData.timestamp > this.MAX_AGE_MS) {
        this.removeFormData(doctype, docname);
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get timestamp of saved form data
   */
  static getFormDataTimestamp(doctype: string, docname?: string): number | null {
    try {
      const key = this.getStorageKey(doctype, docname);
      const stored = localStorage.getItem(key);
      
      if (!stored) {
        return null;
      }

      const autoSaveData: FormAutoSaveData = JSON.parse(stored);
      return autoSaveData.timestamp;
    } catch (error) {
      return null;
    }
  }

  /**
   * Clean up old localStorage entries
   */
  private static cleanupOldEntries(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.STORAGE_PREFIX)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              const autoSaveData: FormAutoSaveData = JSON.parse(stored);
              if (Date.now() - autoSaveData.timestamp > this.MAX_AGE_MS) {
                keysToRemove.push(key);
              }
            } catch {
              // Invalid data, mark for removal
              keysToRemove.push(key);
            }
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to cleanup old localStorage entries:', error);
    }
  }

  /**
   * Get all saved form data for debugging
   */
  static getAllSavedForms(): FormAutoSaveData[] {
    const savedForms: FormAutoSaveData[] = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.STORAGE_PREFIX)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              const autoSaveData: FormAutoSaveData = JSON.parse(stored);
              savedForms.push(autoSaveData);
            } catch {
              // Invalid data, skip
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to get all saved forms:', error);
    }

    return savedForms;
  }

  /**
   * Clear all form auto-save data
   */
  static clearAllFormData(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear all form data:', error);
    }
  }
}