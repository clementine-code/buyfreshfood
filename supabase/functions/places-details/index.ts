import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface DetailsRequest {
  place_id: string;
  fields?: string[];
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

    const { 
      place_id, 
      fields = ['place_id', 'formatted_address', 'geometry', 'name', 'address_components'] 
    }: DetailsRequest = await req.json()

    if (!place_id) {
      return new Response(
        JSON.stringify({ error: 'place_id is required' }),
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

    console.log('🔍 Fetching place details for:', place_id)

    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    url.searchParams.append('place_id', place_id)
    url.searchParams.append('key', googleApiKey)
    url.searchParams.append('fields', fields.join(','))

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      console.error('Google Places API error:', response.status, response.statusText)
      return new Response(
        JSON.stringify({ error: 'External API error', status: response.status }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = await response.json()

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.status, data.error_message)
      return new Response(
        JSON.stringify({ 
          error: 'Location service error', 
          details: data.error_message,
          status: data.status 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Got place details for:', place_id)

    return new Response(
      JSON.stringify(data),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in places-details function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})