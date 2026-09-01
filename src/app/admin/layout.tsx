export const metadata = {
  title: {
    default: "Admin Dashboard",
    template: "%s | Admin Dashboard",
  },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-full w-full bg-secondary/20">{children}</div>;
}
