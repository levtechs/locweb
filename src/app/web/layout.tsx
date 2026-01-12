export default function WebLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div style={{ backgroundColor: "#ffffff", color: "#171717" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        html, body {
          background-color: #ffffff !important;
          color: #171717 !important;
        }
        * {
          color: #171717 !important;
        }
        a {
          color: #171717 !important;
          text-decoration: none !important;
        }
        a:hover {
          text-decoration: underline !important;
        }
        h1, h2, h3, h4, h5, h6, p, span, div, li, td, th {
          color: #171717 !important;
        }
        button {
          color: inherit !important;
        }
      `}} />
      {children}
    </div>
  );
}
