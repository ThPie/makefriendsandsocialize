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
} from 'npm:@react-email/components@0.0.22'

interface PaymentFailedEmailProps {
  userName: string
  amount: string
  planName: string
  updatePaymentUrl: string
  retryDate: string
  failureReason?: string
}

export const PaymentFailedEmail = ({
  userName,
  amount,
  planName,
  updatePaymentUrl,
  retryDate,
  failureReason,
}: PaymentFailedEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500;1,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    </Head>
    <Preview>Action needed: Your payment couldn't be processed</Preview>
    <Body style={main}>
      <Container style={outerContainer}>
        <Section style={header}>
          <div style={headerOverlay}>
            <Heading style={headerHeading}>Payment unsuccessful</Heading>
            <Text style={headerSub}>ACTION REQUIRED</Text>
          </div>
        </Section>

        <Section style={bodySection}>
          <Section style={alertBox}>
            <Text style={alertText}>
              ⚠️ We tried to charge your payment method for your <strong>{planName}</strong> subscription ({amount}), but the transaction was unsuccessful.
            </Text>
          </Section>

          {failureReason && (
            <Section style={reasonBox}>
              <Text style={reasonText}>
                <strong>Reason:</strong> {failureReason}
              </Text>
            </Section>
          )}

          <Text style={text}>
            Hi {userName}, we'll automatically retry this payment on <strong>{retryDate}</strong>.
            To avoid any interruption to your membership benefits, please update your payment information before then.
          </Text>

          <Section style={buttonSection}>
            <Button style={button} href={updatePaymentUrl}>
              Update Payment Method
            </Button>
          </Section>

          <Section style={tipBox}>
            <Text style={tipText}>
              💡 Make sure your card hasn't expired and that you have sufficient funds. You can also try a different payment method.
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={disclaimer}>
            If you believe this is an error or need assistance, contact us at{' '}
            <Link href="mailto:billing@makefriendsandsocialize.com" style={link}>
              billing@makefriendsandsocialize.com
            </Link>
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

export default PaymentFailedEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }
const outerContainer = { maxWidth: '600px', margin: '0 auto', borderRadius: '16px', overflow: 'hidden' as const, boxShadow: '0 8px 40px rgba(13,31,15,0.08)' }
const header = { backgroundImage: "url('https://makefriendsandsocialize.com/images/email-header-bg.jpg')", backgroundSize: 'cover' as const, backgroundPosition: 'center' as const, backgroundColor: '#0D1F0F' }
const headerOverlay = { background: 'linear-gradient(180deg,rgba(13,31,15,0.78) 0%,rgba(13,31,15,0.88) 100%)', padding: '48px 40px 40px', textAlign: 'center' as const }
const headerHeading = { fontFamily: "'Cormorant Garamond',Georgia,'Times New Roman',serif", fontSize: '32px', fontWeight: '600' as const, fontStyle: 'italic' as const, color: '#ffffff', lineHeight: '1.2', margin: '0' }
const headerSub = { fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", fontSize: '11px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.55)', margin: '8px 0 0', textTransform: 'uppercase' as const }
const bodySection = { padding: '36px 40px 40px', backgroundColor: '#F2F1EE' }
const text = { fontSize: '15px', color: '#4A5A4D', lineHeight: '26px', margin: '0 0 20px' }
const alertBox = { backgroundColor: '#FEF3CD', borderLeft: '4px solid #8B6914', borderRadius: '0 12px 12px 0', padding: '18px 22px', margin: '0 0 24px' }
const alertText = { fontSize: '14px', color: '#6B5210', lineHeight: '22px', margin: '0' }
const reasonBox = { backgroundColor: '#FDEDED', borderLeft: '4px solid #C0392B', borderRadius: '0 12px 12px 0', padding: '14px 20px', margin: '0 0 24px' }
const reasonText = { fontSize: '13px', color: '#721c24', margin: '0' }
const tipBox = { backgroundColor: '#E8E6E1', borderRadius: '12px', padding: '18px 22px', margin: '0 0 24px' }
const tipText = { fontSize: '13px', color: '#4A5A4D', lineHeight: '22px', margin: '0' }
const buttonSection = { textAlign: 'center' as const, margin: '32px 0' }
const button = { background: 'linear-gradient(135deg,#8B6914,#A47D1E)', color: '#ffffff', fontSize: '13px', fontWeight: '700' as const, borderRadius: '28px', padding: '16px 44px', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' as const }
const link = { color: '#0D1F0F', textDecoration: 'underline' }
const hr = { borderColor: '#E3E0D8', margin: '28px 0' }
const disclaimer = { fontSize: '12px', color: '#9BA89D', lineHeight: '20px', margin: '0' }
const footer = { padding: '28px 40px 32px', backgroundColor: '#0D1F0F', textAlign: 'center' as const }
const footerLogo = { display: 'block' as const, margin: '0 auto 20px', maxWidth: '140px' }
const footerCopy = { fontSize: '11px', color: 'rgba(155,168,157,0.7)', margin: '0 0 6px' }
const footerLocation = { fontSize: '11px', color: 'rgba(155,168,157,0.5)', margin: '0' }
