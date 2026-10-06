export async function requestBillReminderPermission() { return false; }
export default function useBillReminders() { return { supported: false, count: 0, needsDate: 0, permissionBlocked: false, error: false }; }
