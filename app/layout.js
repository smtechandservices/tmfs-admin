import './globals.css';

export const metadata = {
  title: { default: 'TMFS Admin', template: '%s · TMFS Admin' },
  description: 'Leads, website analytics and email for Time Machine Financial Services.',
  applicationName: 'TMFS Admin',
  authors: [{ name: 'Time Machine Financial Services' }],
  // Favicon and home-screen icon use the same badge as the public site.
  icons: { icon: '/logo.png', apple: '/logo.png' },
  robots: { index: false, follow: false },
};

export const viewport = { themeColor: '#1800ad' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" />
      </head>
      <body className="min-h-screen text-[14px]">{children}</body>
    </html>
  );
}
