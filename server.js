const http = require('http');
const path = require('path');

// Charge le proxy Corrosion en local depuis les dossiers de votre dépôtconst Corrosion = require('./');

const Corrosion = require('./');


const proxy = new Corrosion({
    prefix: '/search/',
    codec: 'xor'
});

const server = http.createServer((req, res) => {
    if (req.url.startsWith(proxy.prefix)) {
        return proxy.request(req, res);
    }
    
    // Page d'accueil du mini-navigateur
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
        <style>
            body { font-family: sans-serif; text-align: center; padding-top: 50px; background: #f0f2f5; }
            .box { background: white; padding: 30px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            input { padding: 10px; width: 300px; border: 1px solid #ccc; border-radius: 4px; }
            button { padding: 10px 20px; background: #0078d4; color: white; border: none; border-radius: 4px; cursor: pointer; }
        </style>
        <div class="box">
            <h2>🌐 Mon Mini Navigateur</h2>
            <p>Le serveur fait les requêtes à votre place.</p>
            <input type="text" id="url" placeholder="Ex: https://wikipedia.org" value="https://wikipedia.org">
            <button onclick="navigate()">Ouvrir</button>
        </div>
        <script>
            function navigate() {
                const url = document.getElementById('url').value;
                // Encode l'URL en XOR simple pour le proxy
                const encoded = encodeURIComponent(url);
                window.location.href = '/search/' + encoded;
            }
        </script>
    `);
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`Mini-navigateur actif sur le port ${PORT}`);
});
