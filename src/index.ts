import { createServer, IncomingMessage, ServerResponse } from 'http';
import axios from 'axios';

interface Coord {
  0: number;
  1: number;
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface CoordinatesResponse {
  coordinates: Coordinate[];
}

interface RequestData {
  coord: Coord[];
}

interface OSRMRoute {
  geometry: {
    coordinates: [number, number][];
    type: string;
  };
}

interface OSRMResponse {
  routes: OSRMRoute[];
}

function getRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      resolve(body);
    });

    req.on('error', err => {
      reject(err);
    });
  });
}

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const body = await getRequestBody(req);

    const data: RequestData = JSON.parse(body);

    if (!data.coord || !Array.isArray(data.coord)) {
      throw new Error('Parâmetro "coord" ausente ou inválido.');
    }

    const coordinates = data.coord
      .map(coord => [coord[1], coord[0]].join(','))
      .join(';');

    const url = `https://router.project-osrm.org/route/v1/foot/${coordinates}?overview=full&geometries=geojson&steps=true`;

    const response = await axios.get<OSRMResponse>(url);
    const routes = response.data.routes[0].geometry.coordinates;

    const coords: Coordinate[] = routes.map(coord => ({
      latitude: coord[1],
      longitude: coord[0],
    }));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ coordinates: coords } as CoordinatesResponse));

  } catch (error: any) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(3333, () => {
  console.log('Server running at http://localhost:3333');
});