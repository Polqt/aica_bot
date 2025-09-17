export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div
          className="absolute inset-0 opacity-5 dark:opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 69, 193, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 69, 193, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        ></div>
        <div className="absolute top-0 right-0 w-full h-full opacity-5">
          <div className="w-full h-full bg-gradient-to-br from-transparent via-violet-500 to-transparent transform rotate-12 scale-150"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-full opacity-3">
          <div className="w-full h-full bg-gradient-to-tr from-transparent via-violet-600 to-transparent transform -rotate-12 scale-150"></div>
        </div>
        <div className="absolute inset-0 opacity-2">
          <div className="w-full h-full bg-gradient-radial from-violet-400/20 via-transparent to-transparent"></div>
        </div>
      </div>
      <div className="min-h-screen flex relative z-10">{children}</div>
    </div>
  );
}
