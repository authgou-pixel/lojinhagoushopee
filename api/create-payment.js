import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Initialize Supabase Admin Client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get Access Token from Database
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('store_settings')
      .select('mp_access_token')
      .single();

    if (settingsError || !settings?.mp_access_token) {
      throw new Error('Mercado Pago Access Token not configured');
    }

    // Initialize Mercado Pago
    const client = new MercadoPagoConfig({ accessToken: settings.mp_access_token });
    const payment = new Payment(client);

    // Get request body
    const body = req.body;

    // Create Payment
    const response = await payment.create({
      body: {
        transaction_amount: body.transaction_amount,
        token: body.token,
        description: body.description,
        installments: body.installments,
        payment_method_id: body.payment_method_id,
        payer: body.payer,
        notification_url: body.notification_url,
      }
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Payment Error:', error);
    res.status(400).json({ error: error.message || 'Error processing payment' });
  }
}
