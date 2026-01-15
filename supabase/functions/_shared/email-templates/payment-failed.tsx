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

interface PaymentFailedEmailProps {
  userName: string;
  amount: string;
  planName: string;
  updatePaymentUrl: string;
  retryDate: string;
  failureReason?: string;
}

export const PaymentFailedEmail = ({
  userName,
  amount,
  planName,
  updatePaymentUrl,
  retryDate,
  failureReason,
}: PaymentFailedEmailProps) => (
  <Html>
    <Head />
    <Preview>Action needed: Your payment couldn't be processed</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={warningBanner}>
          <Text style={warningText}>⚠️ Payment Failed</Text>
        </Section>

        <Heading style={h1}>We couldn't process your payment</Heading>
        
        <Text style={text}>
          Hi {userName},
        </Text>
        
        <Text style={text}>
          We tried to charge your payment method for your <strong>{planName}</strong> subscription 
          ({amount}), but the transaction was unsuccessful.
        </Text>

        {failureReason && (
          <Section style={reasonBox}>
            <Text style={reasonText}>
              <strong>Reason:</strong> {failureReason}
            </Text>
          </Section>
        )}

        <Section style={buttonContainer}>
          <Link href={updatePaymentUrl} style={button}>
            Update Payment Method
          </Link>
        </Section>

        <Text style={text}>
          <strong>What happens next?</strong>
        </Text>
        
        <Text style={text}>
          We'll automatically retry this payment on <strong>{retryDate}</strong>. 
          To avoid any interruption to your membership benefits, please update your 
          payment information before then.
        </Text>

        <Section style={infoBox}>
          <Text style={infoText}>
            💡 <strong>Tip:</strong> Make sure your card hasn't expired and that you have 
            sufficient funds. You can also try a different payment method.
          </Text>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          If you believe this is an error or need assistance, please contact us at{' '}
          <Link href="mailto:billing@makefriends.social" style={link}>
            billing@makefriends.social
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
  padding: '0',
  borderRadius: '8px',
  maxWidth: '600px',
  overflow: 'hidden' as const,
};

const warningBanner = {
  backgroundColor: '#fef3cd',
  padding: '12px 20px',
  textAlign: 'center' as const,
};

const warningText = {
  color: '#856404',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '32px',
  margin: '30px 20px 20px',
};

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 20px 20px',
};

const reasonBox = {
  backgroundColor: '#fff3f3',
  borderLeft: '4px solid #dc3545',
  padding: '12px 16px',
  margin: '0 20px 20px',
};

const reasonText = {
  color: '#721c24',
  fontSize: '14px',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 20px',
};

const button = {
  backgroundColor: '#dc3545',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 40px',
  textDecoration: 'none',
  display: 'inline-block',
};

const infoBox = {
  backgroundColor: '#e7f5ff',
  borderRadius: '6px',
  padding: '16px',
  margin: '0 20px 20px',
};

const infoText = {
  color: '#004085',
  fontSize: '14px',
  margin: '0',
  lineHeight: '22px',
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

export default PaymentFailedEmail;
