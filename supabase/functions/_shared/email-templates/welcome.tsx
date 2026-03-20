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
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface WelcomeEmailProps {
  name: string
  loginUrl: string
}

export const WelcomeEmail = ({ name, loginUrl }: WelcomeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500;1,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    </Head>
    <Preview>Welcome to Make Friends and Socialize — Your journey begins!</Preview>
    <Body style={main}>
      <Container style={outerContainer}>
        <Section style={header}>
          <div style={headerOverlay}>
            <Heading style={headerHeading}>Welcome, {name}!</Heading>
            <Text style={headerSub}>YOUR JOURNEY BEGINS</Text>
          </div>
        </Section>

        <Section style={bodySection}>
          <Text style={text}>
            We're thrilled to have you join our community of professionals who value
            authentic connections. You're now part of an exclusive network where
            meaningful relationships are cultivated.
          </Text>

          <Section style={infoBox}>
            <Text style={infoTitle}>What's next?</Text>
            <Text style={infoItem}>→ Complete your profile for personalized recommendations</Text>
            <Text style={infoItem}>→ Browse upcoming events in your area</Text>
            <Text style={infoItem}>→ Connect with fellow members who share your interests</Text>
          </Section>

          <Section style={buttonSection}>
            <Button style={button} href={loginUrl}>
              Start Exploring
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={disclaimer}>
            Questions? Reach out to hello@makefriendsandsocialize.com
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

export default WelcomeEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }
const outerContainer = { maxWidth: '600px', margin: '0 auto', borderRadius: '16px', overflow: 'hidden' as const, boxShadow: '0 8px 40px rgba(13,31,15,0.08)' }
const header = { backgroundImage: "url('https://makefriendsandsocialize.com/images/email-header-bg.jpg')", backgroundSize: 'cover' as const, backgroundPosition: 'center' as const, backgroundColor: '#0D1F0F' }
const headerOverlay = { background: 'linear-gradient(180deg,rgba(13,31,15,0.78) 0%,rgba(13,31,15,0.88) 100%)', padding: '48px 40px 40px', textAlign: 'center' as const }
const headerHeading = { fontFamily: "'Cormorant Garamond',Georgia,'Times New Roman',serif", fontSize: '32px', fontWeight: '600' as const, fontStyle: 'italic' as const, color: '#ffffff', lineHeight: '1.2', margin: '0' }
const headerSub = { fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", fontSize: '11px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.55)', margin: '8px 0 0', textTransform: 'uppercase' as const }
const bodySection = { padding: '36px 40px 40px', backgroundColor: '#F2F1EE' }
const text = { fontSize: '15px', color: '#4A5A4D', lineHeight: '26px', margin: '0 0 20px' }
const infoBox = { backgroundColor: '#E8E6E1', borderRadius: '12px', padding: '24px', margin: '0 0 24px' }
const infoTitle = { fontSize: '14px', fontWeight: '700' as const, color: '#0D1F0F', margin: '0 0 12px', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }
const infoItem = { fontSize: '14px', color: '#4A5A4D', lineHeight: '24px', margin: '0 0 6px' }
const buttonSection = { textAlign: 'center' as const, margin: '32px 0' }
const button = { background: 'linear-gradient(135deg,#8B6914,#A47D1E)', color: '#ffffff', fontSize: '13px', fontWeight: '700' as const, borderRadius: '28px', padding: '16px 44px', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' as const }
const hr = { borderColor: '#E3E0D8', margin: '28px 0' }
const disclaimer = { fontSize: '12px', color: '#9BA89D', lineHeight: '20px', margin: '0' }
const footer = { padding: '28px 40px 32px', backgroundColor: '#0D1F0F', textAlign: 'center' as const }
const footerLogo = { display: 'block' as const, margin: '0 auto 20px', maxWidth: '140px' }
const footerCopy = { fontSize: '11px', color: 'rgba(155,168,157,0.7)', margin: '0 0 6px' }
const footerLocation = { fontSize: '11px', color: 'rgba(155,168,157,0.5)', margin: '0' }
