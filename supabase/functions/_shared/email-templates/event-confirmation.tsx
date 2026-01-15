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

interface EventConfirmationEmailProps {
  userName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventAddress?: string;
  calendarLink: string;
  eventUrl: string;
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
  <Html>
    <Head />
    <Preview>You're registered for {eventName}!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>You're In! 🎉</Heading>
        
        <Text style={text}>
          Hi {userName},
        </Text>
        
        <Text style={text}>
          Great news! You're registered for <strong>{eventName}</strong>. 
          We can't wait to see you there!
        </Text>

        <Section style={eventCard}>
          <Heading as="h2" style={h2}>{eventName}</Heading>
          
          <Row style={detailRow}>
            <Column style={iconColumn}>📅</Column>
            <Column style={detailColumn}>
              <Text style={detailLabel}>Date</Text>
              <Text style={detailValue}>{eventDate}</Text>
            </Column>
          </Row>

          <Row style={detailRow}>
            <Column style={iconColumn}>⏰</Column>
            <Column style={detailColumn}>
              <Text style={detailLabel}>Time</Text>
              <Text style={detailValue}>{eventTime}</Text>
            </Column>
          </Row>

          <Row style={detailRow}>
            <Column style={iconColumn}>📍</Column>
            <Column style={detailColumn}>
              <Text style={detailLabel}>Location</Text>
              <Text style={detailValue}>{eventLocation}</Text>
              {eventAddress && <Text style={detailSubtext}>{eventAddress}</Text>}
            </Column>
          </Row>
        </Section>

        <Section style={buttonContainer}>
          <Link href={calendarLink} style={button}>
            Add to Calendar
          </Link>
        </Section>

        <Text style={text}>
          <Link href={eventUrl} style={link}>View event details</Link> or manage 
          your RSVP in your <Link href="https://makefriends.social/portal/events" style={link}>member portal</Link>.
        </Text>

        <Hr style={hr} />

        <Text style={footer}>
          <strong>Tips for the event:</strong>
        </Text>
        <ul style={list}>
          <li style={listItem}>Arrive 5-10 minutes early</li>
          <li style={listItem}>Bring your positive energy and open mind</li>
          <li style={listItem}>Don't hesitate to introduce yourself to others</li>
        </ul>

        <Hr style={hr} />

        <Text style={footer}>
          Need to cancel? Please update your RSVP at least 24 hours before the event
          so someone else can take your spot.
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
  padding: '40px 20px',
  borderRadius: '8px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 20px',
};

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 20px',
};

const eventCard = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '24px',
  margin: '20px 0',
};

const detailRow = {
  marginBottom: '16px',
};

const iconColumn = {
  width: '32px',
  verticalAlign: 'top' as const,
  fontSize: '20px',
};

const detailColumn = {
  verticalAlign: 'top' as const,
};

const detailLabel = {
  color: '#9ca299',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  margin: '0',
};

const detailValue = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '500',
  margin: '2px 0 0',
};

const detailSubtext = {
  color: '#666',
  fontSize: '14px',
  margin: '2px 0 0',
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
  padding: '14px 40px',
  textDecoration: 'none',
  display: 'inline-block',
};

const list = {
  color: '#484848',
  fontSize: '14px',
  lineHeight: '24px',
  paddingLeft: '20px',
  margin: '10px 0',
};

const listItem = {
  marginBottom: '8px',
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '30px 0',
};

const footer = {
  color: '#9ca299',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 10px',
};

const link = {
  color: '#1a1a1a',
  textDecoration: 'underline',
};

export default EventConfirmationEmail;
