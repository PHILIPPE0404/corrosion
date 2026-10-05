const http = require('http');
const Corrosion = require('corrosion');

// Configure le proxy Corrosion
const proxy = new Corrosion({
    prefix: '/search/',
    codec: 'xor' // Chiffre un peu les URL pour contourner les filtres
});

const server = http.createServer((req, res) => {
    // Laisse Corrosion gérer la requête du mini-navigateur
    if (req.url.startsWith(proxy.prefix)) {
        return proxy.request(req, res);
    }
    
    // Page d'accueil simple si on arrive sur l'URL de base
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
        <h1>Mon Mini Navigateur</h1>
        <input type="text" id="url" placeholder="Entrez un lien (ex: https://wikipedia.org)">
        <button onclick="window.location.href='/search/' + btoa(document.getElementById('url').value)">Naviguer</button>
    `);
});

// Utilise le port fourni par Render ou le 10000 par défaut
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
