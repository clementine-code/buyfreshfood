import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface AutocompleteRequest {
  input: string;
  types?: string;
  componentRestrictions?: {
    country: string;
  };
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

    const { input, types = '(cities)', componentRestrictions = { country: 'us' } }: AutocompleteRequest = await req.json()

    if (!input || input.length < 2) {
      return new Response(
        JSON.stringify({ predictions: [] }),
        { 
          status: 200, 
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

    console.log('🔍 Fetching autocomplete suggestions for:', input)

    const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json')
    url.searchParams.append('input', input)
    url.searchParams.append('key', googleApiKey)
    url.searchParams.append('types', types)
    url.searchParams.append('components', `country:${componentRestrictions.country}`)
    url.searchParams.append('language', 'en')

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

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
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

    console.log('✅ Got autocomplete suggestions:', data.predictions?.length || 0)

    return new Response(
      JSON.stringify(data),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in places-autocomplete function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})