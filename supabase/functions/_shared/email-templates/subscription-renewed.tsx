/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column,
} from 'npm:@react-email/components@0.0.22'

interface SubscriptionRenewedEmailProps {
  userName: string
  planName: string
  amount: string
  nextBillingDate: string
  invoiceUrl?: string
}

export const SubscriptionRenewedEmail = ({
  userName,
  planName,
  amount,
  nextBillingDate,
  invoiceUrl,
}: SubscriptionRenewedEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500;1,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    </Head>
    <Preview>Your {planName} subscription has been renewed</Preview>
    <Body style={main}>
      <Container style={outerContainer}>
        <Section style={header}>
          <div style={headerOverlay}>
            <Heading style={headerHeading}>Subscription renewed</Heading>
            <Text style={headerSub}>PAYMENT SUCCESSFUL</Text>
          </div>
        </Section>

        <Section style={bodySection}>
          <Text style={text}>
            Hi {userName}, your <strong>{planName}</strong> membership has been successfully renewed.
            Thank you for being a valued member of our community!
          </Text>

          <Section style={receiptBox}>
            <Row style={receiptRow}>
              <Column style={labelCol}><Text style={label}>Plan</Text></Column>
              <Column style={valueCol}><Text style={value}>{planName}</Text></Column>
            </Row>
            <Row style={receiptRow}>
              <Column style={labelCol}><Text style={label}>Amount Charged</Text></Column>
              <Column style={valueCol}><Text style={value}>{amount}</Text></Column>
            </Row>
            <Row style={receiptRow}>
              <Column style={labelCol}><Text style={label}>Next Billing Date</Text></Column>
              <Column style={valueCol}><Text style={value}>{nextBillingDate}</Text></Column>
            </Row>
          </Section>

          {invoiceUrl && (
            <Section style={invoiceLinkSection}>
              <Link href={invoiceUrl} style={invoiceLink}>View Invoice →</Link>
            </Section>
          )}

          <Section style={buttonSection}>
            <Button style={button} href="https://makefriendsandsocialize.com/events">
              Browse Upcoming Events
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={disclaimer}>
            Need to update your subscription or payment method? Visit your{' '}
            <Link href="https://makefriendsandsocialize.com/portal/billing" style={link}>
              billing settings
            </Link>.
          </Text>
        </Section>

        <Section style={footer}>
          <Img src="https://makefriendsandsocialize.com/images/logo-full-white.png" width="140" height="auto" alt="Make Friends and Socialize" style={footerLogo} />
          <Text style={footerCopy}>© {new Date().getFullYear()} Make Friends and Socialize LLC</Text>
          <Text style={footerLocation}>Salt Lake City, Utah, USA</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default SubscriptionRenewedEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }
const outerContainer = { maxWidth: '600px', margin: '0 auto', borderRadius: '16px', overflow: 'hidden' as const, boxShadow: '0 8px 40px rgba(13,31,15,0.08)' }
const header = { backgroundImage: "url('https://makefriendsandsocialize.com/images/email-header-bg.jpg')", backgroundSize: 'cover' as const, backgroundPosition: 'center' as const, backgroundColor: '#0D1F0F' }
const headerOverlay = { background: 'linear-gradient(180deg,rgba(13,31,15,0.78) 0%,rgba(13,31,15,0.88) 100%)', padding: '48px 40px 40px', textAlign: 'center' as const }
const headerHeading = { fontFamily: "'Cormorant Garamond',Georgia,'Times New Roman',serif", fontSize: '32px', fontWeight: '600' as const, fontStyle: 'italic' as const, color: '#ffffff', lineHeight: '1.2', margin: '0' }
const headerSub = { fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", fontSize: '11px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.55)', margin: '8px 0 0', textTransform: 'uppercase' as const }
const bodySection = { padding: '36px 40px 40px', backgroundColor: '#F2F1EE' }
const text = { fontSize: '15px', color: '#4A5A4D', lineHeight: '26px', margin: '0 0 20px' }
const receiptBox = { backgroundColor: '#E8E6E1', borderRadius: '12px', padding: '24px', margin: '0 0 24px' }
const receiptRow = { marginBottom: '12px' }
const labelCol = { width: '50%' }
const valueCol = { width: '50%', textAlign: 'right' as const }
const label = { color: '#9BA89D', fontSize: '13px', margin: '0' }
const value = { color: '#0D1F0F', fontSize: '14px', fontWeight: '600' as const, margin: '0' }
const invoiceLinkSection = { textAlign: 'center' as const, margin: '0 0 8px' }
const invoiceLink = { color: '#8B6914', fontSize: '13px', fontWeight: '600' as const, textDecoration: 'underline' }
const buttonSection = { textAlign: 'center' as const, margin: '32px 0' }
const button = { background: 'linear-gradient(135deg,#8B6914,#A47D1E)', color: '#ffffff', fontSize: '13px', fontWeight: '700' as const, borderRadius: '28px', padding: '16px 44px', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' as const }
const link = { color: '#0D1F0F', textDecoration: 'underline' }
const hr = { borderColor: '#E3E0D8', margin: '28px 0' }
const disclaimer = { fontSize: '12px', color: '#9BA89D', lineHeight: '20px', margin: '0' }
const footer = { padding: '28px 40px 32px', backgroundColor: '#0D1F0F', textAlign: 'center' as const }
const footerLogo = { display: 'block' as const, margin: '0 auto 20px', maxWidth: '140px' }
const footerCopy = { fontSize: '11px', color: 'rgba(155,168,157,0.7)', margin: '0 0 6px' }
const footerLocation = { fontSize: '11px', color: 'rgba(155,168,157,0.5)', margin: '0' }
