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
  Hr,
  Row,
  Column,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface SubscriptionRenewedEmailProps {
  userName: string;
  planName: string;
  amount: string;
  nextBillingDate: string;
  invoiceUrl?: string;
}

export const SubscriptionRenewedEmail = ({
  userName,
  planName,
  amount,
  nextBillingDate,
  invoiceUrl,
}: SubscriptionRenewedEmailProps) => (
  <Html>
    <Head />
    <Preview>Your {planName} subscription has been renewed</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={successBanner}>
          <Text style={successText}>✓ Payment Successful</Text>
        </Section>

        <Heading style={h1}>Subscription Renewed</Heading>
        
        <Text style={text}>
          Hi {userName},
        </Text>
        
        <Text style={text}>
          Your <strong>{planName}</strong> membership has been successfully renewed. 
          Thank you for being a valued member of our community!
        </Text>

        <Section style={receiptBox}>
          <Row style={receiptRow}>
            <Column style={labelColumn}>
              <Text style={label}>Plan</Text>
            </Column>
            <Column style={valueColumn}>
              <Text style={value}>{planName}</Text>
            </Column>
          </Row>
          
          <Row style={receiptRow}>
            <Column style={labelColumn}>
              <Text style={label}>Amount Charged</Text>
            </Column>
            <Column style={valueColumn}>
              <Text style={value}>{amount}</Text>
            </Column>
          </Row>
          
          <Row style={receiptRow}>
            <Column style={labelColumn}>
              <Text style={label}>Next Billing Date</Text>
            </Column>
            <Column style={valueColumn}>
              <Text style={value}>{nextBillingDate}</Text>
            </Column>
          </Row>
        </Section>

        {invoiceUrl && (
          <Section style={buttonContainer}>
            <Link href={invoiceUrl} style={buttonOutline}>
              View Invoice
            </Link>
          </Section>
        )}

        <Text style={text}>
          As a member, you continue to enjoy:
        </Text>
        
        <ul style={list}>
          <li style={listItem}>Access to exclusive events and gatherings</li>
          <li style={listItem}>Discounts on event tickets</li>
          <li style={listItem}>Priority RSVP for popular events</li>
          <li style={listItem}>Connection to our professional network</li>
        </ul>

        <Section style={ctaBox}>
          <Link href="https://makefriends.social/events" style={button}>
            Browse Upcoming Events
          </Link>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          Need to update your subscription or payment method? Visit your{' '}
          <Link href="https://makefriends.social/portal/billing" style={link}>
            billing settings
          </Link>.
        </Text>

        <Text style={footer}>
          MakeFriends Social Club<br />
          Making authentic connections happen.
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  borderRadius: '8px',
  maxWidth: '600px',
  overflow: 'hidden' as const,
};

const successBanner = {
  backgroundColor: '#d4edda',
  padding: '12px 20px',
  textAlign: 'center' as const,
};

const successText = {
  color: '#155724',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '30px 20px 20px',
  textAlign: 'center' as const,
};

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 20px 20px',
};

const receiptBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px',
};

const receiptRow = {
  marginBottom: '12px',
};

const labelColumn = {
  width: '50%',
};

const valueColumn = {
  width: '50%',
  textAlign: 'right' as const,
};

const label = {
  color: '#666',
  fontSize: '14px',
  margin: '0',
};

const value = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '20px',
};

const button = {
  backgroundColor: '#1a1a1a',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 40px',
  textDecoration: 'none',
  display: 'inline-block',
};

const buttonOutline = {
  backgroundColor: 'transparent',
  border: '2px solid #1a1a1a',
  borderRadius: '6px',
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '600',
  padding: '10px 24px',
  textDecoration: 'none',
  display: 'inline-block',
};

const list = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '26px',
  paddingLeft: '20px',
  margin: '0 20px 20px',
};

const listItem = {
  marginBottom: '8px',
};

const ctaBox = {
  textAlign: 'center' as const,
  margin: '30px 20px',
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '30px 20px',
};

const footer = {
  color: '#9ca299',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 20px 10px',
  paddingBottom: '20px',
};

const link = {
  color: '#1a1a1a',
  textDecoration: 'underline',
};

export default SubscriptionRenewedEmail;
