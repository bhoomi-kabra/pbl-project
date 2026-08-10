/**
 * Service to fetch spatial road geometries from OpenStreetMap via Overpass API
 * Bounding Box for Nashik City: south: 19.93, west: 73.70, north: 20.08, east: 73.85
 */

export interface OsmRoadGeometry {
  id: number;
  name: string;
  highway: string;
  coordinates: [number, number][];
}

export async function fetchNashikRoadGeometries(): Promise<OsmRoadGeometry[]> {
  const overpassUrl = 'https://overpass-api.de/api/interpreter';
  
  // Overpass QL Query for primary, secondary & tertiary roads in Nashik bounding box
  const query = `
    [out:json][timeout:25];
    (
      way["highway"~"primary|secondary|tertiary"](19.95,73.72,20.05,73.83);
    );
    out body;
    >;
    out skel qx;
  `;

  try {
    const response = await fetch(overpassUrl, {
      method: 'POST',
      body: query,
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.statusText}`);
    }

    const data = await response.json();
    const nodesMap = new Map<number, [number, number]>();

    // Map node IDs to coordinates [lat, lon]
    data.elements.forEach((elem: any) => {
      if (elem.type === 'node') {
        nodesMap.set(elem.id, [elem.lat, elem.lon]);
      }
    });

    // Build road geometries from ways
    const roads: OsmRoadGeometry[] = [];

    data.elements.forEach((elem: any) => {
      if (elem.type === 'way' && elem.nodes && elem.tags && elem.tags.name) {
        const coords: [number, number][] = elem.nodes
          .map((nodeId: number) => nodesMap.get(nodeId))
          .filter(Boolean);

        if (coords.length > 1) {
          roads.push({
            id: elem.id,
            name: elem.tags.name,
            highway: elem.tags.highway || 'road',
            coordinates: coords,
          });
        }
      }
    });

    return roads.slice(0, 15); // Return top road geometries
  } catch (error) {
    console.warn('Overpass API fallback to local Nashik road geometries:', error);
    return [];
  }
}
