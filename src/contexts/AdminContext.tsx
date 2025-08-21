import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface AdminChange {
  id: string;
  type: 'property' | 'user';
  field: string;
  oldValue: any;
  newValue: any;
  table: string;
}

interface AdminContextType {
  changes: AdminChange[];
  addChange: (change: AdminChange) => void;
  removeChange: (id: string) => void;
  clearChanges: () => void;
  hasChanges: boolean;
  saveAllChanges: () => Promise<{ success: boolean; message: string }>;
  saving: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [changes, setChanges] = useState<AdminChange[]>([]);
  const [saving, setSaving] = useState(false);

  const addChange = useCallback((change: AdminChange) => {
    setChanges(prev => {
      // Check if there's already a change for this item and field
      const existingIndex = prev.findIndex(c => 
        c.id === change.id && c.field === change.field && c.type === change.type
      );
      
      if (existingIndex >= 0) {
        // Update existing change
        const updated = [...prev];
        updated[existingIndex] = change;
        return updated;
      } else {
        // Add new change
        return [...prev, change];
      }
    });
  }, []);

  const removeChange = useCallback((id: string) => {
    setChanges(prev => prev.filter(change => change.id !== id));
  }, []);

  const clearChanges = useCallback(() => {
    setChanges([]);
  }, []);

  const saveAllChanges = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (changes.length === 0) {
      return { success: true, message: 'No changes to save' };
    }

    setSaving(true);
    
    try {
      console.log('🔄 Starting to save all changes:', changes);
      
      // Group changes by table and ID for batch updates
      const groupedChanges: Record<string, Record<string, any>> = {};
      
      changes.forEach(change => {
        if (!groupedChanges[change.table]) {
          groupedChanges[change.table] = {};
        }
        if (!groupedChanges[change.table][change.id]) {
          groupedChanges[change.table][change.id] = {};
        }
        groupedChanges[change.table][change.id][change.field] = change.newValue;
      });

      // Perform batch updates
      const updatePromises = Object.entries(groupedChanges).map(([table, idChanges]) => {
        return Object.entries(idChanges).map(([id, updates]) => {
          console.log(`📝 Updating ${table} with ID ${id}:`, updates);
          return supabase
            .from(table)
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('id', id);
        });
      }).flat();

      const results = await Promise.all(updatePromises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        console.error('❌ Errors during save:', errors);
        return { 
          success: false, 
          message: `Failed to save ${errors.length} changes. Check console for details.` 
        };
      }

      console.log('✅ All changes saved successfully');
      setChanges([]); // Clear changes after successful save
      
      return { 
        success: true, 
        message: `Successfully saved ${changes.length} changes` 
      };
      
    } catch (error) {
      console.error('❌ Error saving changes:', error);
      return { 
        success: false, 
        message: `Error saving changes: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    } finally {
      setSaving(false);
    }
  }, [changes]);

  const value: AdminContextType = {
    changes,
    addChange,
    removeChange,
    clearChanges,
    hasChanges: changes.length > 0,
    saveAllChanges,
    saving
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
