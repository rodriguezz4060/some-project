export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:border-border focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
    >
      Перейти до основного вмісту
    </a>
  );
}
