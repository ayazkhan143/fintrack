import { useEffect } from 'react';
import { router } from 'expo-router';

// This tab is just a shortcut — it immediately opens the add-transaction modal
export default function AddTab() {
  useEffect(() => {
    router.push('/modals/add-transaction');
  }, []);
  return null;
}
