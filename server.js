const http = require('http');
const { URL } = require('url');

const server = http.createServer(async (req, res) => {
    // 1. Page d'accueil du mini-navigateur
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', sans-serif; text-align: center; padding-top: 50px; background: #f0f2f5; }
                    .box { background: white; padding: 40px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 20px rgba(0,0,0,0.08); width: 450px; }
                    input { padding: 12px; width: 80%; border: 1px solid #ccd0d5; border-radius: 6px; font-size: 14px; margin-bottom: 15px; outline: none; }
                    input:focus { border-color: #0078d4; }
                    button { padding: 12px 25px; background: #0078d4; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px; }
                    button:hover { background: #005a9e; }
                    p { color: #606770; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="box">
                    <h2>🌐 Mon Mini Navigateur Cloud</h2>
                    <p>Toutes les requêtes web sont exécutées par le serveur Render.</p>
                    <input type="text" id="url" placeholder="Entrez un lien (ex: https://wikipedia.org)" value="https://wikipedia.org">
                    <br>
                    <button onclick="navigate()">Lancer la navigation</button>
                </div>
                <script>
                    function navigate() {
                        let targetUrl = document.getElementById('url').value.trim();
                        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
                            targetUrl = 'https://' + targetUrl;
                        }
                        window.location.href = '/proxy?url=' + encodeURIComponent(targetUrl);
                    }
                </script>
            </body>
            </html>
        `);
    }

    // 2. Le moteur du Proxy : Le serveur exécute la requête à la place du client
    if (req.url.startsWith('/proxy')) {
        try {
            const currentUrl = new URL(req.url, `http://${req.headers.host}`);
            const targetUrlString = currentUrl.searchParams.get('url');

            if (!targetUrlString) {
                res.writeHead(400);
                return res.end('URL manquante.');
            }

            const targetUrl = new URL(targetUrlString);
            
            // Le serveur effectue la requête HTTP(S) vers le site cible
            const response = await fetch(targetUrl.href, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
            });

            const contentType = response.headers.get('content-type') || 'text/html';
            res.writeHead(response.status, { 'Content-Type': contentType });

            // Si c'est du texte/HTML, on l'affiche directement
            if (contentType.includes('text')) {
                let html = await response.text();
                return res.end(html);
            } else {
                // Si c'est une image ou autre ressource binaire
                const arrayBuffer = await response.arrayBuffer();
                return res.end(Buffer.from(arrayBuffer));
            }

        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('Erreur de chargement du site proxy : ' + error.message);
        }
    }

    // 404 par défaut
    res.writeHead(404);
    res.end('Page non trouvée.');
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`Mini-navigateur actif sur le port ${PORT}`);
});
