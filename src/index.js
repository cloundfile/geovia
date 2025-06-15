import { createServer } from 'http';
import axios from 'axios'; 

const server = createServer((req, res) => {
  let body = '';

  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const data = JSON.parse(body);

      if (!data.coord || !Array.isArray(data.coord)) {
        throw new Error('Parâmetro "coord" ausente ou inválido.');
      }

      const coordinates = data.coord
        .map(coord => [coord[1], coord[0]].join(','))
        .join(';');

      const url = `https://router.project-osrm.org/route/v1/foot/${coordinates}?overview=full&geometries=geojson&steps=true`;

      const response = await axios.get(url);
      const routes = response.data.routes[0].geometry.coordinates;
      const coords = routes.map(coord => ({
        latitude:  coord[1],
        longitude: coord[0]
      }));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ coordinates: coords }));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
});

server.listen(3000, () => {
  console.log('http://localhost:3000');
});