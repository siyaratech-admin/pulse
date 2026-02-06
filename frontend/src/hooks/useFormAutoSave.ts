import { useEffect, useCallback, useRef, useState } from "react";
import { FormAutoSave } from "../utils/formAutoSave";

interface UseFormAutoSaveOptions {
  doctype: string;
  docname?: string;
  debounceMs?: number;
  enabled?: boolean;
  onRestore?: (data: Record<string, any>) => void;
}

interface UseFormAutoSaveReturn {
  saveFormData: (formData: Record<string, any>) => void;
  loadFormData: () => Record<string, any> | null;
  clearFormData: () => void;
  hasAutoSaveData: boolean;
  autoSaveTimestamp: number | null;
  restoreAutoSaveData: () => void;
  isRestored: boolean;
}

/**
 * Hook for automatic form data saving and restoration using localStorage
 *
 * CRITICAL FEATURES:
 * - Preserves ALL form data (including null, undefined, empty strings, 0, false)
 * - Properly merges restored data with new changes
 * - Tracks restoration state to prevent data loss
 * - Debounced saving to avoid localStorage spam
 */
export const useFormAutoSave = ({
  doctype,
  docname,
  debounceMs = 1000,
  enabled = true,
  onRestore,
}: UseFormAutoSaveOptions): UseFormAutoSaveReturn => {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRestoredRef = useRef<boolean>(false);

  const [hasAutoSaveData, setHasAutoSaveData] = useState<boolean>(() =>
    FormAutoSave.hasFormData(doctype, docname),
  );
  const [autoSaveTimestamp, setAutoSaveTimestamp] = useState<number | null>(
    () => FormAutoSave.getFormDataTimestamp(doctype, docname),
  );
  const [isRestored, setIsRestored] = useState<boolean>(false);

  // Function to update auto-save status
  const updateAutoSaveStatus = useCallback(() => {
    const hasData = FormAutoSave.hasFormData(doctype, docname);
    const timestamp = FormAutoSave.getFormDataTimestamp(doctype, docname);

    console.log("📊 [AutoSave] Status update:", {
      doctype,
      docname,
      hasData,
      timestamp: timestamp ? new Date(timestamp).toLocaleString() : null,
    });

    setHasAutoSaveData(hasData);
    setAutoSaveTimestamp(timestamp);
  }, [doctype, docname]);

  /**
   * CRITICAL FIX: Save form data with MINIMAL filtering
   * Only removes File objects that can't be serialized to JSON
   * Preserves ALL other values including null, undefined, empty strings, 0, false
   */
  const saveFormData = useCallback(
    (formData: Record<string, any>) => {
      if (!enabled) {
        console.log("⏸️ [AutoSave] Disabled, skipping save");
        return;
      }

      console.log("💾 [AutoSave] saveFormData called");
      console.log("📊 [AutoSave] Form data keys:", Object.keys(formData));
      console.log("📦 [AutoSave] Full form data:", formData);

      // Clear previous timeout to debounce
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        console.log("⏰ [AutoSave] Cleared previous timeout");
      }

      // Set new timeout for debounced save
      saveTimeoutRef.current = setTimeout(() => {
        console.log("⏰ [AutoSave] Debounce timer fired, processing save...");

        // CRITICAL: Only filter out File objects
        // Keep EVERYTHING else to preserve exact form state
        const cleanData = Object.keys(formData).reduce(
          (acc, key) => {
            const value = formData[key];

            // Skip File objects (can't be serialized to JSON)
            if (value instanceof File) {
              console.log(`⏭️ [AutoSave] Skipping File object for key: ${key}`);
              return acc;
            }

            // Skip Blob objects (can't be serialized to JSON)
            if (value instanceof Blob) {
              console.log(`⏭️ [AutoSave] Skipping Blob object for key: ${key}`);
              return acc;
            }

            // IMPORTANT: Include ALL other values
            // This includes: null, undefined, '', 0, false, [], {}
            // Arrays and objects will be preserved as-is
            acc[key] = value;
            return acc;
          },
          {} as Record<string, any>,
        );

        console.log("🧹 [AutoSave] Cleaned data for storage:", cleanData);
        console.log(
          "📏 [AutoSave] Number of fields to save:",
          Object.keys(cleanData).length,
        );

        // Save to localStorage
        try {
          FormAutoSave.saveFormData(doctype, cleanData, docname);
          console.log("✅ [AutoSave] Data saved to localStorage successfully");

          // Update auto-save status after saving
          updateAutoSaveStatus();
        } catch (error) {
          console.error("❌ [AutoSave] Failed to save data:", error);
        }
      }, debounceMs);
    },
    [doctype, docname, debounceMs, enabled, updateAutoSaveStatus],
  );

  /**
   * Load form data from localStorage
   */
  const loadFormData = useCallback((): Record<string, any> | null => {
    if (!enabled) {
      console.log("⏸️ [AutoSave] Load disabled");
      return null;
    }

    try {
      const data = FormAutoSave.loadFormData(doctype, docname);
      console.log("📖 [AutoSave] Loaded form data from localStorage:", data);
      console.log(
        "📊 [AutoSave] Loaded data keys:",
        data ? Object.keys(data) : [],
      );
      return data;
    } catch (error) {
      console.error("❌ [AutoSave] Failed to load data:", error);
      return null;
    }
  }, [doctype, docname, enabled]);

  /**
   * Clear form data from localStorage
   */
  const clearFormData = useCallback(() => {
    console.log("🗑️ [AutoSave] Clearing auto-save data");

    try {
      FormAutoSave.removeFormData(doctype, docname);
      console.log("✅ [AutoSave] Data cleared successfully");

      // Clear any pending save timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        console.log("⏰ [AutoSave] Cleared pending save timeout");
      }

      // Reset restoration state
      isRestoredRef.current = false;
      setIsRestored(false);

      // Update auto-save status after clearing
      updateAutoSaveStatus();
    } catch (error) {
      console.error("❌ [AutoSave] Failed to clear data:", error);
    }
  }, [doctype, docname, updateAutoSaveStatus]);

  /**
   * CRITICAL: Restore auto-save data and mark as restored
   * This ensures subsequent changes are merged with restored data
   */
  const restoreAutoSaveData = useCallback(() => {
    console.log("🔄 [AutoSave] === RESTORE INITIATED ===");
    console.log("🔄 [AutoSave] Attempting to restore auto-save data...");

    const savedData = loadFormData();
    console.log("📦 [AutoSave] Loaded saved data:", savedData);
    console.log(
      "📊 [AutoSave] Saved data keys:",
      savedData ? Object.keys(savedData) : [],
    );

    if (savedData && onRestore) {
      console.log("✅ [AutoSave] Calling onRestore callback with saved data");

      // Mark as restored BEFORE calling onRestore
      isRestoredRef.current = true;
      setIsRestored(true);

      // Call the onRestore callback
      onRestore(savedData);

      console.log("✅ [AutoSave] === RESTORE COMPLETED ===");
      console.log("✅ [AutoSave] isRestored flag set to true");
    } else {
      if (!savedData) {
        console.log("⚠️ [AutoSave] No saved data found");
      }
      if (!onRestore) {
        console.log("⚠️ [AutoSave] onRestore callback missing");
      }
    }
  }, [loadFormData, onRestore]);

  /**
   * Update auto-save status on mount and when doctype/docname changes
   */
  useEffect(() => {
    const hasData = FormAutoSave.hasFormData(doctype, docname);
    const timestamp = FormAutoSave.getFormDataTimestamp(doctype, docname);

    console.log("🔍 [AutoSave] Checking status on mount/change:", {
      doctype,
      docname,
      hasData,
      timestamp: timestamp ? new Date(timestamp).toLocaleString() : null,
    });

    setHasAutoSaveData(hasData);
    setAutoSaveTimestamp(timestamp);
  }, [doctype, docname]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        console.log("🧹 [AutoSave] Cleanup: Cleared pending save timeout");
      }
    };
  }, []);

  return {
    saveFormData,
    loadFormData,
    clearFormData,
    hasAutoSaveData,
    autoSaveTimestamp,
    restoreAutoSaveData,
    isRestored,
  };
};
