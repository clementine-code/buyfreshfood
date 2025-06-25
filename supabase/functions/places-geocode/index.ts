import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface GeocodeRequest {
  address: string;
  components?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { address, components = 'country:US' }: GeocodeRequest = await req.json()

    if (!address || !address.trim()) {
      return new Response(
        JSON.stringify({ error: 'address is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')
    if (!googleApiKey) {
      console.error('Google Places API key not found')
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('🔍 Geocoding address:', address)

    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
    url.searchParams.append('address', address)
    url.searchParams.append('key', googleApiKey)
    url.searchParams.append('components', components)

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      console.error('Google Geocoding API error:', response.status, response.statusText)
      return new Response(
        JSON.stringify({ error: 'External API error', status: response.status }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Geocoding API error:', data.status, data.error_message)
      return new Response(
        JSON.stringify({ 
          error: 'Geocoding service error', 
          details: data.error_message,
          status: data.status 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Geocoded address:', data.results?.length || 0, 'results')

    return new Response(
      JSON.stringify(data),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in places-geocode function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})