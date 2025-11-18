import { redirect } from 'next/navigation';

/**
 * Admin root page - redirects to dashboard
 * This handles cases where users navigate to /adminofjb directly
 */
export default function AdminRootPage() {
  redirect('/adminofjb/dashboard');
}
