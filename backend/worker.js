/**
 * All Access Artist - Backend API
 * Version 2.0.0 - Proprietary
 * Cloudflare Worker for music industry management platform
 */

// CORS headers for frontend requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method;

      // API Routes
      if (path.startsWith('/api/')) {
        return await handleApiRequest(request, env, path, method);
      }

      // Health check endpoint
      if (path === '/health') {
        return new Response(JSON.stringify({ 
          status: 'healthy', 
          service: 'All Access Artist API',
          version: '2.0.0',
          timestamp: new Date().toISOString(),
          worker: env.WORKER_NAME || 'allaccessartist',
          deployed: new Date().toISOString(),
          build_fixed: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Default response
      return new Response(JSON.stringify({ 
        message: 'All Access Artist API - Version 2.0.0',
        endpoints: [
          'GET /health - Health check',
          'GET /api/artists - Get artist profiles',
          'POST /api/artists - Create artist profile',
          'GET /api/releases - Get music releases',
          'POST /api/releases - Create music release',
          'GET /api/analytics - Get analytics data',
          'GET /api/calendar - Get content calendar'
        ]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

// Handle API requests
async function handleApiRequest(request, env, path, method) {
  const segments = path.split('/').filter(Boolean);
  const resource = segments[1]; // api/[resource]
  const id = segments[2]; // api/resource/[id]

  // Initialize Supabase client (simplified for Cloudflare Workers)
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new Response(JSON.stringify({ 
      error: 'Supabase configuration missing',
      message: 'Environment variables not configured'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  switch (resource) {
    case 'artists':
      return await handleArtists(request, env, method, id);
    case 'releases':
      return await handleReleases(request, env, method, id);
    case 'analytics':
      return await handleAnalytics(request, env, method, id);
    case 'calendar':
      return await handleCalendar(request, env, method, id);
    default:
      return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
  }
}

// Supabase API helper function
async function supabaseRequest(env, endpoint, options = {}) {
  const url = `${env.SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    'apikey': env.SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase error: ${response.status} - ${error}`);
  }

  return await response.json();
}

// Artist profiles endpoints
async function handleArtists(request, env, method, id) {
  switch (method) {
    case 'GET':
      if (id) {
        // Get specific artist
        const data = await supabaseRequest(env, `artist_profiles?id=eq.${id}`);
        return jsonResponse(data[0] || null);
      } else {
        // Get all public artists
        const data = await supabaseRequest(env, 'artist_profiles?is_public=eq.true&order=created_at.desc');
        return jsonResponse(data);
      }

    case 'POST':
      const artistData = await request.json();
      const data = await supabaseRequest(env, 'artist_profiles', {
        method: 'POST',
        body: JSON.stringify(artistData)
      });
      return jsonResponse(data[0], 201);

    default:
      return methodNotAllowed();
  }
}

// Music releases endpoints
async function handleReleases(request, env, method, id) {
  switch (method) {
    case 'GET':
      if (id) {
        // Get specific release with artist info
        const data = await supabaseRequest(env, `music_releases?id=eq.${id}&select=*,artist_profiles(artist_name,profile_image_url)`);
        return jsonResponse(data[0] || null);
      } else {
        // Get all released music with artist info
        const data = await supabaseRequest(env, 'music_releases?status=eq.released&select=*,artist_profiles(artist_name,profile_image_url)&order=release_date.desc');
        return jsonResponse(data);
      }

    case 'POST':
      const releaseData = await request.json();
      const releaseResult = await supabaseRequest(env, 'music_releases', {
        method: 'POST',
        body: JSON.stringify(releaseData)
      });
      return jsonResponse(releaseResult[0], 201);

    default:
      return methodNotAllowed();
  }
}

// Analytics endpoints
async function handleAnalytics(request, env, method, id) {
  switch (method) {
    case 'GET':
      const url = new URL(request.url);
      const artistId = url.searchParams.get('artist_id');
      const platform = url.searchParams.get('platform');
      
      if (!artistId) {
        return new Response(JSON.stringify({ error: 'artist_id required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      let endpoint = `fan_analytics?artist_id=eq.${artistId}`;
      if (platform) {
        endpoint += `&platform=eq.${platform}`;
      }
      endpoint += '&order=period_start.desc';

      const data = await supabaseRequest(env, endpoint);
      return jsonResponse(data);

    default:
      return methodNotAllowed();
  }
}

// Content calendar endpoints
async function handleCalendar(request, env, method, id) {
  switch (method) {
    case 'GET':
      const url = new URL(request.url);
      const artistId = url.searchParams.get('artist_id');
      
      if (!artistId) {
        return new Response(JSON.stringify({ error: 'artist_id required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const data = await supabaseRequest(env, `content_calendar?artist_id=eq.${artistId}&order=scheduled_date.asc`);
      return jsonResponse(data);

    case 'POST':
      const calendarData = await request.json();
      const calendarResult = await supabaseRequest(env, 'content_calendar', {
        method: 'POST',
        body: JSON.stringify(calendarData)
      });
      return jsonResponse(calendarResult[0], 201);

    default:
      return methodNotAllowed();
  }
}

// Helper functions
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function methodNotAllowed() {
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
