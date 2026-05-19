import { useCallback, useState } from 'react';
import { Reminder } from '@/types/model';

export function useReminderFormState() {
  const [createReminderOpen, setCreateReminderOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const openCreateReminder = useCallback(() => {
    setEditingReminder(null);
    setCreateReminderOpen(true);
  }, []);

  const openEditReminder = useCallback((reminder: Reminder) => {
    setEditingReminder(reminder);
    setCreateReminderOpen(true);
  }, []);

  const closeReminderForm = useCallback(() => {
    setCreateReminderOpen(false);
    setEditingReminder(null);
  }, []);

  return {
    createReminderOpen,
    editingReminder,
    setCreateReminderOpen,
    setEditingReminder,
    openCreateReminder,
    openEditReminder,
    closeReminderForm,
  };
}
