
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

    // Create Order in Supabase if payment is successful (or pending)
    if (response && response.id) {
        const { data: orderData, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert({
                user_id: body.user_id || null,
                status: 'pending',
                total: body.transaction_amount,
                payment_method: body.payment_method_id,
                payment_status: response.status,
                mercado_pago_payment_id: response.id.toString(),
                shipping_address: body.shipping_info ? `${body.shipping_info.address}, ${body.shipping_info.number} - ${body.shipping_info.neighborhood}` : null,
                shipping_city: body.shipping_info?.city,
                shipping_state: body.shipping_info?.state,
                shipping_zip: body.shipping_info?.zipCode,
                customer_name: body.shipping_info?.fullName,
                customer_email: body.payer.email,
                customer_phone: body.shipping_info?.phone
            })
            .select()
            .single();

        if (orderError) {
            console.error('Error creating order in Supabase:', orderError);
        } else if (orderData && body.items && body.items.length > 0) {
            // Create Order Items
            const orderItems = body.items.map(item => ({
                order_id: orderData.id,
                product_id: item.id,
                product_name: item.name,
                product_price: item.price,
                quantity: item.quantity
            }));

            const { error: itemsError } = await supabaseAdmin
                .from('order_items')
                .insert(orderItems);
            
            if (itemsError) {
                 console.error('Error creating order items in Supabase:', itemsError);
            }
        }
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Payment Error:', error);
    res.status(400).json({ error: error.message || 'Error processing payment' });
  }
}
