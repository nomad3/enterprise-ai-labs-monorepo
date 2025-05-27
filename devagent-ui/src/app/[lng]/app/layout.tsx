import { AuthProvider } from '../../contexts/AuthContext'; // Adjusted import path

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
} 