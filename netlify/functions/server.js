// netlify/functions/server.js
// Fixed: Removed Leaflet (browser library) from server-side Node.js code
// Leaflet should only be used on the client-side

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

// Handle CORS preflight
const handleCors = (callback) => {
  return async (event, context) => {
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: 'ok'
      };
    }
    return callback(event, context);
  };
};

// Main handler
exports.handler = handleCors(async (event, context) => {
  try {
    const path = event.path.replace('/.netlify/functions/server', '') || '/';
    const method = event.httpMethod;

    console.log(`${method} ${path}`);

    // ============================================
    // API ROUTES - Return JSON only, NOT objects
    // ============================================

    // GET /api/map-data - Returns GeoJSON features
    if (path === '/api/map-data' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                name: 'Sample Parcel',
                area: 5000
              },
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [-73.98, 40.75],
                  [-73.95, 40.75],
                  [-73.95, 40.77],
                  [-73.98, 40.77],
                  [-73.98, 40.75]
                ]]
              }
            }
          ]
        })
      };
    }

    // GET /api/parcels - Returns parcels list
    if (path === '/api/parcels' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 1,
              name: 'Parcel A',
              area: 5000,
              owner: 'Owner 1',
              status: 'active'
            },
            {
              id: 2,
              name: 'Parcel B',
              area: 3000,
              owner: 'Owner 2',
              status: 'active'
            }
          ]
        })
      };
    }

    // GET /api/revenue - Returns revenue records
    if (path === '/api/revenue' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 1,
              parcelId: 1,
              amount: 5000,
              date: '2026-01-15',
              type: 'tax'
            },
            {
              id: 2,
              parcelId: 2,
              amount: 3000,
              date: '2026-01-20',
              type: 'fee'
            }
          ]
        })
      };
    }

    // GET /api/health - Health check
    if (path === '/api/health' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          service: 'NAKSHA Backend API'
        })
      };
    }

    // POST /api/parcels - Create new parcel
    if (path === '/api/parcels' && method === 'POST') {
      try {
        const body = JSON.parse(event.body || '{}');
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({
            success: true,
            data: {
              id: Math.floor(Math.random() * 10000),
              ...body,
              createdAt: new Date().toISOString()
            }
          })
        };
      } catch (error) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Invalid request body'
          })
        };
      }
    }

    // 404 - Route not found
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Not found',
        path: path,
        availableRoutes: [
          'GET /api/health',
          'GET /api/map-data',
          'GET /api/parcels',
          'POST /api/parcels',
          'GET /api/revenue'
        ]
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message
      })
    };
  }
});
