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

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email change for Make Friends and Socialize</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img
            src="https://makefriendsandsocialize.com/images/logo-monogram.png"
            width="48"
            height="48"
            alt="Make Friends and Socialize"
            style={logo}
          />
        </Section>
        <Heading style={h1}>Confirm your email change</Heading>
        <Text style={text}>
          You requested to change your email from{' '}
          <Link href={`mailto:${email}`} style={link}>
            {email}
          </Link>{' '}
          to{' '}
          <Link href={`mailto:${newEmail}`} style={link}>
            {newEmail}
          </Link>
          .
        </Text>
        <Section style={buttonSection}>
          <Button style={button} href={confirmationUrl}>
            Confirm Email Change
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          If you didn't request this change, please secure your account immediately.
        </Text>
        <Text style={footerBrand}>
          Make Friends and Socialize · Salt Lake City, Utah
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

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
const link = { color: '#0D1F0F', textDecoration: 'underline' }
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
