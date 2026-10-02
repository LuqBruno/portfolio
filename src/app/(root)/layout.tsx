export default function RootEntryLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, background: '#08080b', color: '#fafafa' }}>{children}</body>
    </html>
  );
}
