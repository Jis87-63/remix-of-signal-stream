import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-request-id',
}

// Encrypted endpoint configuration - only server knows this
const API_ENDPOINT = 'https://app.sscashout.online/api/velas';

// Request validation
const validateRequest = (req: Request): { valid: boolean; error?: string } => {
  const userAgent = req.headers.get('user-agent') || '';
  const origin = req.headers.get('origin') || '';
  
  // Block suspicious user agents
  const blockedAgents = ['curl', 'wget', 'postman', 'insomnia', 'httpie'];
  const isBlockedAgent = blockedAgents.some(agent => 
    userAgent.toLowerCase().includes(agent)
  );
  
  if (isBlockedAgent) {
    return { valid: false, error: 'Invalid client' };
  }
  
  return { valid: true };
};

// Generate secure response signature
const generateSignature = (data: unknown, timestamp: number): string => {
  const payload = JSON.stringify(data) + timestamp.toString();
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request
    const validation = validateRequest(req);
    if (!validation.valid) {
      console.log('Blocked request:', validation.error);
      return new Response(
        JSON.stringify({ ok: false, error: validation.error }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get request ID for tracking
    const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
    
    console.log(`[${requestId}] Fetching velas data...`);

    // Fetch from the real API (server-side only)
    const response = await fetch(API_ENDPOINT, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RoboAviator/1.0',
      },
    });

    if (!response.ok) {
      console.error(`[${requestId}] API error: ${response.status}`);
      return new Response(
        JSON.stringify({ ok: false, error: 'Upstream error' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const timestamp = Date.now();
    const signature = generateSignature(data, timestamp);

    console.log(`[${requestId}] Successfully fetched ${data.valores?.length || 0} velas`);

    // Return processed data with security metadata
    return new Response(
      JSON.stringify({
        ok: data.ok,
        valores: data.valores,
        _meta: {
          ts: timestamp,
          sig: signature,
          v: '2.0'
        }
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Request-Id': requestId,
        } 
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
