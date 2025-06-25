import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ReverseGeocodeRequest {
  lat: number;
  lng: number;
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

    const { lat, lng }: ReverseGeocodeRequest = await req.json()

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return new Response(
        JSON.stringify({ error: 'lat and lng must be numbers' }),
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

    console.log('🔍 Reverse geocoding coordinates:', lat, lng)

    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
    url.searchParams.append('latlng', `${lat},${lng}`)
    url.searchParams.append('key', googleApiKey)

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
          error: 'Reverse geocoding service error', 
          details: data.error_message,
          status: data.status 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Reverse geocoded coordinates:', data.results?.length || 0, 'results')

    return new Response(
      JSON.stringify(data),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in places-reverse-geocode function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})