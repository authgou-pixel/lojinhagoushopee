
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
    const { action, type, data } = req.body;
    
    // We only care about payment updates
    if (type !== 'payment' && action !== 'payment.created' && action !== 'payment.updated') {
        return res.status(200).json({ message: 'Notification ignored' });
    }

    const paymentId = data?.id;
    if (!paymentId) {
        return res.status(200).json({ message: 'No payment ID provided' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Initialize Supabase Admin Client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get Access Token
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

    // Get Payment Details
    const paymentData = await payment.get({ id: paymentId });
    
    if (!paymentData) {
        throw new Error('Payment not found in Mercado Pago');
    }

    // Update Order in Supabase
    const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
            payment_status: paymentData.status,
            updated_at: new Date().toISOString()
        })
        .eq('mercado_pago_payment_id', paymentId.toString());

    if (updateError) {
        console.error('Error updating order:', updateError);
        throw updateError;
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
