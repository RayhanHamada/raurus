export function scalarApiUI() {
    return new Response(
        `
    <!doctype html>
    <html>
        <head>
            <title>API Docs</title>
            <meta charset="utf-8" />
        </head>
        <body>
            <div id="app"></div>

            <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>

            <script>
                Scalar.createApiReference('#app', {
                url: '/openapi.json'
                });
            </script>
        </body>
    </html>`,
        {
            headers: {
                "content-type": "text/html",
            },
        }
    );
}
