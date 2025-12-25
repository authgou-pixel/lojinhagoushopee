import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import mercadopago from 'https://esm.sh/mercadopago@1.5.17'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // 1. Get Store Settings (Access Token)
    // We need service_role key to access store_settings as it might be protected
    // Actually, we can use the admin client if we have the service role key in env
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('store_settings')
      .select('mp_access_token')
      .single()

    if (settingsError || !settings?.mp_access_token) {
      throw new Error('Mercado Pago Access Token not configured')
    }

    // 2. Configure Mercado Pago
    mercadopago.configure({
      access_token: settings.mp_access_token
    });

    // 3. Get Request Data
    const { 
      transaction_amount, 
      token, 
      description, 
      installments, 
      payment_method_id, 
      payer,
      notification_url 
    } = await req.json()

    // 4. Create Payment
    const payment_data = {
      transaction_amount,
      token,
      description,
      installments,
      payment_method_id,
      payer,
      notification_url
    }

    const response = await mercadopago.payment.save(payment_data)

    return new Response(
      JSON.stringify(response.body),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
