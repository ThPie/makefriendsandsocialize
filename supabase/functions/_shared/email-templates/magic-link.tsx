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

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your login link for Make Friends and Socialize</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img
            src="https://makefriendsandsocialize.com/images/email-logo-dark.png"
            width="200"
            height="auto"
            alt="Make Friends and Socialize"
            style={logo}
          />
        </Section>
        <Heading style={h1}>Your login link</Heading>
        <Text style={text}>
          Click below to sign in. This link will expire shortly.
        </Text>
        <Section style={buttonSection}>
          <Button style={button} href={confirmationUrl}>
            Sign In
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          If you didn't request this link, you can safely ignore this email.
        </Text>
        <Text style={footerBrand}>
          Make Friends and Socialize · Salt Lake City, Utah
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }
const container = { padding: '40px 32px', maxWidth: '600px', margin: '0 auto' }
const logoSection = { textAlign: 'center' as const, marginBottom: '24px' }
const logo = { margin: '0 auto', borderRadius: '12px' }
const h1 = {
  fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
  fontSize: '26px',
  fontWeight: '600' as const,
  fontStyle: 'italic' as const,
  color: '#0D1F0F',
  margin: '0 0 16px',
}
const text = {
  fontSize: '15px',
  color: '#4A5A4D',
  lineHeight: '24px',
  margin: '0 0 20px',
}
const buttonSection = { textAlign: 'center' as const, margin: '28px 0' }
const button = {
  backgroundColor: '#8B6914',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600' as const,
  borderRadius: '10px',
  padding: '14px 36px',
  textDecoration: 'none',
  letterSpacing: '0.04em',
  textTransform: 'uppercase' as const,
}
const hr = { borderColor: '#E3E0D8', margin: '28px 0' }
const footer = { fontSize: '12px', color: '#9BA89D', lineHeight: '20px', margin: '0 0 8px' }
const footerBrand = { fontSize: '11px', color: '#9BA89D', margin: '0' }
