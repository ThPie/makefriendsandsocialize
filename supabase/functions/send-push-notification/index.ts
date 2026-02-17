import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from '../_shared/cors.ts';



// Web Push encryption implementation
// Based on RFC 8291 - Message Encryption for Web Push

const encoder = new TextEncoder();

// Import crypto key from raw bytes
async function importRawKey(keyData: Uint8Array): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    keyData.buffer as ArrayBuffer,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );
}

// Generate a new ECDH key pair for this push message
async function generateKeyPair(): Promise<CryptoKeyPair> {
  return await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );
}

// Export public key to raw format
async function exportPublicKey(key: CryptoKey): Promise<Uint8Array> {
  const exported = await crypto.subtle.exportKey("raw", key);
  return new Uint8Array(exported);
}

// HKDF - Key derivation function
async function hkdf(
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    ikm.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Extract
  const saltBuffer = salt.length > 0 ? salt.buffer as ArrayBuffer : new Uint8Array(32).buffer;
  const prk = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, saltBuffer)
  );

  const prkKey = await crypto.subtle.importKey(
    "raw",
    prk.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Expand
  const infoWithCounter = new Uint8Array(info.length + 1);
  infoWithCounter.set(info);
  infoWithCounter[info.length] = 1;

  const okm = new Uint8Array(
    await crypto.subtle.sign("HMAC", prkKey, infoWithCounter.buffer as ArrayBuffer)
  );

  return okm.slice(0, length);
}

// Base64 URL encoding/decoding helpers
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function uint8ArrayToUrlBase64(uint8Array: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...uint8Array));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Concatenate Uint8Arrays
function concat(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

// Create info for HKDF
function createInfo(type: string, clientPublicKey: Uint8Array, serverPublicKey: Uint8Array): Uint8Array {
  const typeBytes = encoder.encode(type);
  const result = new Uint8Array(
    18 + typeBytes.length + 1 + 5 + 1 + 2 + clientPublicKey.length + 2 + serverPublicKey.length
  );
  
  let offset = 0;
  
  // "Content-Encoding: " + type + "\0"
  const prefix = encoder.encode("Content-Encoding: ");
  result.set(prefix, offset);
  offset += prefix.length;
  result.set(typeBytes, offset);
  offset += typeBytes.length;
  result[offset++] = 0;
  
  // "P-256" + "\0"
  const p256 = encoder.encode("P-256");
  result.set(p256, offset);
  offset += p256.length;
  result[offset++] = 0;
  
  // Length (2 bytes) + clientPublicKey
  result[offset++] = 0;
  result[offset++] = clientPublicKey.length;
  result.set(clientPublicKey, offset);
  offset += clientPublicKey.length;
  
  // Length (2 bytes) + serverPublicKey
  result[offset++] = 0;
  result[offset++] = serverPublicKey.length;
  result.set(serverPublicKey, offset);
  
  return result;
}

// Encrypt payload using aes128gcm
async function encryptPayload(
  payload: string,
  subscription: { endpoint: string; p256dh: string; auth: string }
): Promise<{ encrypted: Uint8Array; salt: Uint8Array; serverPublicKey: Uint8Array }> {
  const payloadBytes = encoder.encode(payload);
  
  // Decode client keys
  const clientPublicKey = urlBase64ToUint8Array(subscription.p256dh);
  const authSecret = urlBase64ToUint8Array(subscription.auth);
  
  // Generate server key pair
  const serverKeyPair = await generateKeyPair();
  const serverPublicKeyBytes = await exportPublicKey(serverKeyPair.publicKey);
  
  // Import client public key
  const clientKey = await importRawKey(clientPublicKey);
  
  // Derive shared secret using ECDH
  const sharedSecretBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: clientKey },
    serverKeyPair.privateKey,
    256
  );
  const sharedSecret = new Uint8Array(sharedSecretBits);
  
  // Generate random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Derive IKM from auth secret
  const authInfo = encoder.encode("Content-Encoding: auth\0");
  const ikm = await hkdf(authSecret, sharedSecret, authInfo, 32);
  
  // Derive content encryption key
  const cekInfo = createInfo("aesgcm", clientPublicKey, serverPublicKeyBytes);
  const contentEncryptionKey = await hkdf(salt, ikm, cekInfo, 16);
  
  // Derive nonce
  const nonceInfo = createInfo("nonce", clientPublicKey, serverPublicKeyBytes);
  const nonce = await hkdf(salt, ikm, nonceInfo, 12);
  
  // Add padding (required by Web Push)
  const paddingLength = 0;
  const paddedPayload = new Uint8Array(2 + paddingLength + payloadBytes.length);
  paddedPayload[0] = paddingLength >> 8;
  paddedPayload[1] = paddingLength & 0xff;
  paddedPayload.set(payloadBytes, 2 + paddingLength);
  
  // Encrypt with AES-GCM
  const key = await crypto.subtle.importKey(
    "raw",
    contentEncryptionKey.buffer as ArrayBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: nonce.buffer as ArrayBuffer },
      key,
      paddedPayload.buffer as ArrayBuffer
    )
  );
  
  return { encrypted, salt, serverPublicKey: serverPublicKeyBytes };
}

// Create VAPID JWT token
async function createVapidToken(
  endpoint: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<{ token: string; publicKey: string }> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  
  const header = {
    typ: "JWT",
    alg: "ES256"
  };
  
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60, // 12 hours
    sub: "mailto:hello@makefriends.club"
  };
  
  const headerB64 = uint8ArrayToUrlBase64(encoder.encode(JSON.stringify(header)));
  const payloadB64 = uint8ArrayToUrlBase64(encoder.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;
  
  // Import private key for signing
  const privateKeyBytes = urlBase64ToUint8Array(vapidPrivateKey);
  
  // Create proper PKCS8 format for the private key
  // EC private key in SEC1 format to PKCS8
  const pkcs8Header = new Uint8Array([
    0x30, 0x81, 0x87, 0x02, 0x01, 0x00, 0x30, 0x13,
    0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02,
    0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d,
    0x03, 0x01, 0x07, 0x04, 0x6d, 0x30, 0x6b, 0x02,
    0x01, 0x01, 0x04, 0x20
  ]);
  
  const pkcs8Middle = new Uint8Array([0xa1, 0x44, 0x03, 0x42, 0x00]);
  const publicKeyBytes = urlBase64ToUint8Array(vapidPublicKey);
  
  const pkcs8Key = concat(pkcs8Header, privateKeyBytes, pkcs8Middle, publicKeyBytes);
  
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    pkcs8Key.buffer as ArrayBuffer,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
  
  // Sign the token
  const signature = new Uint8Array(
    await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      privateKey,
      encoder.encode(unsignedToken)
    )
  );
  
  // Convert DER signature to raw format (64 bytes)
  const signatureB64 = uint8ArrayToUrlBase64(signature);
  
  return {
    token: `${unsignedToken}.${signatureB64}`,
    publicKey: vapidPublicKey
  };
}

// Send push notification to a single subscription
async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: object
): Promise<{ success: boolean; expired: boolean; error?: string }> {
  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
  
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.error('VAPID keys not configured');
    return { success: false, expired: false, error: 'VAPID keys not configured' };
  }

  const payloadString = JSON.stringify(payload);
  console.log(`Encrypting payload for endpoint: ${subscription.endpoint.substring(0, 50)}...`);
  
  try {
    // Encrypt the payload
    const { encrypted, salt, serverPublicKey } = await encryptPayload(payloadString, subscription);
    
    // Create VAPID authorization
    const vapid = await createVapidToken(subscription.endpoint, vapidPublicKey, vapidPrivateKey);
    
    // Build the encrypted body with headers
    // Format: salt (16) + record size (4) + key length (1) + server public key (65) + encrypted data
    const recordSize = new Uint8Array([0, 0, 16, 0]); // 4096 bytes
    const keyLength = new Uint8Array([serverPublicKey.length]);
    
    const body = concat(salt, recordSize, keyLength, serverPublicKey, encrypted);
    
    console.log(`Sending push to: ${subscription.endpoint.substring(0, 50)}...`);
    
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'Content-Length': body.length.toString(),
        'TTL': '86400',
        'Authorization': `vapid t=${vapid.token}, k=${vapid.publicKey}`,
        'Urgency': 'high',
      },
      body: body.buffer as ArrayBuffer,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Push notification failed:', response.status, errorText);
      
      // If subscription is invalid (410 Gone or 404), mark for removal
      if (response.status === 410 || response.status === 404) {
        console.log('Subscription expired, marking for removal');
        return { success: false, expired: true, error: `HTTP ${response.status}: ${errorText}` };
      }
      return { success: false, expired: false, error: `HTTP ${response.status}: ${errorText}` };
    }
    
    console.log('Push notification sent successfully');
    return { success: true, expired: false };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, expired: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, title, body, data, tag, actions } = await req.json();
    
    console.log(`Sending push notification to user ${user_id}:`, { title, body, tag });

    // Get all push subscriptions for this user
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user_id);

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No push subscriptions found for user:', user_id);
      return new Response(
        JSON.stringify({ message: 'No subscriptions found', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${subscriptions.length} subscription(s) for user`);

    const payload = {
      title,
      body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-64x64.png',
      data: data || { url: '/portal/dashboard' },
      tag: tag || 'notification',
      actions: actions || [],
      timestamp: Date.now(),
    };

    const results = await Promise.all(
      subscriptions.map(async (sub) => {
        const result = await sendPushNotification(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          payload
        );
        
        // Remove expired subscriptions
        if (result.expired) {
          console.log('Removing expired subscription:', sub.id);
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', sub.id);
        }
        
        return { ...result, subscription_id: sub.id };
      })
    );

    const successCount = results.filter(r => r.success).length;
    const expiredCount = results.filter(r => r.expired).length;
    const errors = results.filter(r => !r.success && !r.expired).map(r => r.error);
    
    console.log(`Push notifications: ${successCount} sent, ${expiredCount} expired, ${errors.length} failed`);

    return new Response(
      JSON.stringify({ 
        message: 'Push notifications processed',
        sent: successCount,
        expired: expiredCount,
        failed: errors.length,
        total: subscriptions.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in send-push-notification:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
