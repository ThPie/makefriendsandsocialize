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

interface EventConfirmationEmailProps {
  userName: string
  eventName: string
  eventDate: string
  eventTime: string
  eventLocation: string
  eventAddress?: string
  calendarLink: string
  eventUrl: string
}

export const EventConfirmationEmail = ({
  userName,
  eventName,
  eventDate,
  eventTime,
  eventLocation,
  eventAddress,
  calendarLink,
  eventUrl,
}: EventConfirmationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500;1,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    </Head>
    <Preview>You're registered for {eventName}!</Preview>
    <Body style={main}>
      <Container style={outerContainer}>
        <Section style={header}>
          <div style={headerOverlay}>
            <Heading style={headerHeading}>You're in!</Heading>
            <Text style={headerSub}>EVENT CONFIRMATION</Text>
          </div>
        </Section>

        <Section style={bodySection}>
          <Text style={text}>
            Hi {userName}, great news! You're registered for <strong>{eventName}</strong>.
            We can't wait to see you there!
          </Text>

          <Section style={eventCard}>
            <Heading as="h2" style={h2}>{eventName}</Heading>
            <Row style={detailRow}>
              <Column style={iconCol}>📅</Column>
              <Column>
                <Text style={detailLabel}>Date</Text>
                <Text style={detailValue}>{eventDate}</Text>
              </Column>
            </Row>
            <Row style={detailRow}>
              <Column style={iconCol}>⏰</Column>
              <Column>
                <Text style={detailLabel}>Time</Text>
                <Text style={detailValue}>{eventTime}</Text>
              </Column>
            </Row>
            <Row style={detailRow}>
              <Column style={iconCol}>📍</Column>
              <Column>
                <Text style={detailLabel}>Location</Text>
                <Text style={detailValue}>{eventLocation}</Text>
                {eventAddress && <Text style={detailSub}>{eventAddress}</Text>}
              </Column>
            </Row>
          </Section>

          <Section style={buttonSection}>
            <Button style={button} href={calendarLink}>
              Add to Calendar
            </Button>
          </Section>

          <Text style={tipText}>
            <Link href={eventUrl} style={link}>View event details</Link> or manage
            your RSVP in your{' '}
            <Link href="https://makefriendsandsocialize.com/portal/events" style={link}>member portal</Link>.
          </Text>

          <Hr style={hr} />

          <Text style={disclaimer}>
            Need to cancel? Please update your RSVP at least 24 hours before the event.
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

export default EventConfirmationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }
const outerContainer = { maxWidth: '600px', margin: '0 auto', borderRadius: '16px', overflow: 'hidden' as const, boxShadow: '0 8px 40px rgba(13,31,15,0.08)' }
const header = { backgroundImage: "url('https://makefriendsandsocialize.com/images/email-header-bg.jpg')", backgroundSize: 'cover' as const, backgroundPosition: 'center' as const, backgroundColor: '#0D1F0F' }
const headerOverlay = { background: 'linear-gradient(180deg,rgba(13,31,15,0.78) 0%,rgba(13,31,15,0.88) 100%)', padding: '48px 40px 40px', textAlign: 'center' as const }
const headerHeading = { fontFamily: "'Cormorant Garamond',Georgia,'Times New Roman',serif", fontSize: '32px', fontWeight: '600' as const, fontStyle: 'italic' as const, color: '#ffffff', lineHeight: '1.2', margin: '0' }
const headerSub = { fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", fontSize: '11px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.55)', margin: '8px 0 0', textTransform: 'uppercase' as const }
const bodySection = { padding: '36px 40px 40px', backgroundColor: '#F2F1EE' }
const text = { fontSize: '15px', color: '#4A5A4D', lineHeight: '26px', margin: '0 0 20px' }
const h2 = { fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: '22px', fontWeight: '600' as const, fontStyle: 'italic' as const, color: '#0D1F0F', margin: '0 0 20px' }
const eventCard = { backgroundColor: '#E8E6E1', borderRadius: '12px', padding: '24px', margin: '0 0 24px' }
const detailRow = { marginBottom: '14px' }
const iconCol = { width: '32px', verticalAlign: 'top' as const, fontSize: '18px' }
const detailLabel = { color: '#9BA89D', fontSize: '11px', fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: '0.06em', margin: '0' }
const detailValue = { color: '#0D1F0F', fontSize: '15px', fontWeight: '500' as const, margin: '2px 0 0' }
const detailSub = { color: '#4A5A4D', fontSize: '13px', margin: '2px 0 0' }
const buttonSection = { textAlign: 'center' as const, margin: '32px 0' }
const button = { background: 'linear-gradient(135deg,#8B6914,#A47D1E)', color: '#ffffff', fontSize: '13px', fontWeight: '700' as const, borderRadius: '28px', padding: '16px 44px', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' as const }
const tipText = { fontSize: '14px', color: '#4A5A4D', lineHeight: '24px', margin: '0 0 20px' }
const link = { color: '#0D1F0F', textDecoration: 'underline' }
const hr = { borderColor: '#E3E0D8', margin: '28px 0' }
const disclaimer = { fontSize: '12px', color: '#9BA89D', lineHeight: '20px', margin: '0' }
const footer = { padding: '28px 40px 32px', backgroundColor: '#0D1F0F', textAlign: 'center' as const }
const footerLogo = { display: 'block' as const, margin: '0 auto 20px', maxWidth: '140px' }
const footerCopy = { fontSize: '11px', color: 'rgba(155,168,157,0.7)', margin: '0 0 6px' }
const footerLocation = { fontSize: '11px', color: 'rgba(155,168,157,0.5)', margin: '0' }
