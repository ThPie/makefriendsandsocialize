# Email Setup with Resend

This document explains how to configure and use email functionality in MakeFriends Social Club.

## Why Resend?

Resend is the recommended email provider for React applications because:
- Native React Email support
- Simple API
- Excellent deliverability
- Generous free tier (100 emails/day)
- Real-time analytics

## Setup Instructions

### 1. Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Verify Domain

For production use, you must verify your domain:

1. Go to [Domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain (e.g., `makefriends.social`)
4. Add the DNS records to your domain provider:
   - SPF record
   - DKIM record
   - Return-path CNAME

### 3. Create API Key

1. Go to [API Keys](https://resend.com/api-keys)
2. Click "Create API Key"
3. Name it (e.g., "MakeFriends Production")
4. Copy the key (it won't be shown again)
5. Add to Lovable secrets as `RESEND_API_KEY`

## Email Templates

Email templates are located in `supabase/functions/_shared/email-templates/`.

### Available Templates

#### Welcome Email
Sent when a new user signs up.

```typescript
// Template: welcome.tsx
interface WelcomeEmailProps {
  name: string;
  loginUrl: string;
}
```

#### Event Confirmation
Sent when a user registers for an event.

```typescript
// Template: event-confirmation.tsx
interface EventConfirmationProps {
  userName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  calendarLink: string;
}
```

#### Payment Failed
Sent when a subscription payment fails.

```typescript
// Template: payment-failed.tsx
interface PaymentFailedProps {
  userName: string;
  amount: string;
  updatePaymentUrl: string;
  retryDate: string;
}
```

#### Subscription Renewed
Sent when a subscription is successfully renewed.

```typescript
// Template: subscription-renewed.tsx
interface SubscriptionRenewedProps {
  userName: string;
  planName: string;
  amount: string;
  nextBillingDate: string;
  invoiceUrl: string;
}
```

## Creating New Templates

### 1. Create Template File

```typescript
// supabase/functions/_shared/email-templates/my-template.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Link,
  Section,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface MyTemplateProps {
  userName: string;
  // ... other props
}

export const MyTemplate = ({ userName }: MyTemplateProps) => (
  <Html>
    <Head />
    <Preview>Email preview text</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Hello, {userName}!</Heading>
        <Text style={text}>
          Your email content here...
        </Text>
        <Section style={buttonContainer}>
          <Link href="https://makefriends.social" style={button}>
            Take Action
          </Link>
        </Section>
      </Container>
    </Body>
  </Html>
);

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
};

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 20px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#1a1a1a',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  padding: '12px 30px',
  textDecoration: 'none',
  display: 'inline-block',
};

export default MyTemplate;
```

### 2. Create Edge Function

```typescript
// supabase/functions/send-my-email/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { MyTemplate } from "../_shared/email-templates/my-template.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userName, userEmail } = await req.json();

    const html = await renderAsync(
      React.createElement(MyTemplate, { userName })
    );

    const { error } = await resend.emails.send({
      from: "MakeFriends <hello@makefriends.social>",
      to: [userEmail],
      subject: "Your Subject Line",
      html,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Email error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

## Email Best Practices

### Subject Lines
- Keep under 50 characters
- Be specific and actionable
- Avoid spam trigger words

### Content
- Mobile-first design (600px max width)
- Clear call-to-action
- Unsubscribe link for marketing emails
- Physical address for CAN-SPAM compliance

### Deliverability
- Authenticate domain (SPF, DKIM, DMARC)
- Monitor bounce rates
- Clean email list regularly
- Don't send to unverified addresses

## Testing

### Local Testing
Use Resend's test mode or the preview feature:

```bash
# Preview email in browser
npx email dev
```

### Test Email Address
Use `delivered@resend.dev` for testing - emails to this address always succeed.

## Monitoring

### Resend Dashboard
- Delivery rates
- Open rates (optional tracking)
- Click rates
- Bounce rates

### Error Handling
All email functions log errors to edge function logs. Check:
- Lovable Cloud → Edge Functions → Logs
- Filter by function name

## Troubleshooting

### Common Issues

1. **"Domain not verified"**
   - Check DNS records are correctly configured
   - Wait up to 48 hours for DNS propagation

2. **"Rate limit exceeded"**
   - Free tier: 100 emails/day, 1 per second
   - Upgrade to paid plan if needed

3. **"Invalid API key"**
   - Verify RESEND_API_KEY is set in secrets
   - Regenerate key if compromised

4. **Emails going to spam**
   - Verify domain
   - Check content for spam triggers
   - Build sender reputation gradually
