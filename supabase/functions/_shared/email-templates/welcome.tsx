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
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface WelcomeEmailProps {
  name: string;
  loginUrl: string;
}

export const WelcomeEmail = ({ name, loginUrl }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to MakeFriends Social Club - Your journey begins!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to MakeFriends!</Heading>
        
        <Text style={text}>
          Hi {name},
        </Text>
        
        <Text style={text}>
          We're thrilled to have you join our community of professionals who value 
          authentic connections. You're now part of an exclusive network where 
          meaningful relationships are cultivated.
        </Text>

        <Section style={buttonContainer}>
          <Link href={loginUrl} style={button}>
            Start Exploring
          </Link>
        </Section>

        <Text style={text}>
          <strong>What's next?</strong>
        </Text>
        
        <ul style={list}>
          <li style={listItem}>Complete your profile to get personalized event recommendations</li>
          <li style={listItem}>Browse upcoming events in your area</li>
          <li style={listItem}>Connect with fellow members who share your interests</li>
        </ul>

        <Hr style={hr} />

        <Text style={footer}>
          Questions? Reply to this email or reach out to{' '}
          <Link href="mailto:hello@makefriends.social" style={link}>
            hello@makefriends.social
          </Link>
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

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '26px',
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
  padding: '14px 40px',
  textDecoration: 'none',
  display: 'inline-block',
};

const list = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '26px',
  paddingLeft: '20px',
};

const listItem = {
  marginBottom: '10px',
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

export default WelcomeEmail;
