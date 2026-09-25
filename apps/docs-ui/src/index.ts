export function getDocsHTML(specUrl: string = "/docs/spec"): string {
  return `
    <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>API Documentation</title>
          <script src="https://unpkg.com/@stoplight/elements/web-components.min.js"></script>
          <link rel="stylesheet" href="https://unpkg.com/@stoplight/elements/styles.min.css">
        </head>
        <body>
          <elements-api apiDescriptionUrl="/docs/spec" router="hash" />
          <script>
            let lastModified = null;
            setInterval(async () => {
              try {
                const res = await fetch('/docs/spec', { method: 'HEAD' });
                const modified = res.headers.get('last-modified');
                if (lastModified && modified !== lastModified) {
                  window.location.reload();
                }
                lastModified = modified;
              } catch (e) {}
            }, 1000);
          </script>
        </body>
      </html>
  `;
}
