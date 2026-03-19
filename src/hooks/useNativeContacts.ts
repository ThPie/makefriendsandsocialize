import { useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Contacts, PhoneType, EmailType } from '@capacitor-community/contacts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContactEntry {
  name: string;
  emails: string[];
  phones: string[];
}

interface ContactMatchResult {
  contact: ContactEntry;
  /** Profile ID if the contact is an existing member */
  memberId?: string;
  memberName?: string;
}

/**
 * Access native phone contacts to find existing members or invite friends.
 * Only works on native platforms (iOS/Android).
 */
export function useNativeContacts() {
  const isNative = Capacitor.isNativePlatform();
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<ContactEntry[]>([]);
  const [matches, setMatches] = useState<ContactMatchResult[]>([]);

  /**
   * Request permission and fetch contacts from the device.
   */
  const fetchContacts = useCallback(async (): Promise<ContactEntry[]> => {
    if (!isNative) {
      toast.error('Contact import is only available in the app');
      return [];
    }

    setIsLoading(true);
    try {
      const permission = await Contacts.requestPermissions();
      if (permission.contacts !== 'granted') {
        toast.error('Contact access denied');
        return [];
      }

      const result = await Contacts.getContacts({
        projection: {
          name: true,
          emails: true,
          phones: true,
        },
      });

      const parsed: ContactEntry[] = (result.contacts || [])
        .filter((c) => c.name?.display)
        .map((c) => ({
          name: c.name?.display || '',
          emails: (c.emails || []).map((e) => e.address).filter(Boolean) as string[],
          phones: (c.phones || []).map((p) => p.number).filter(Boolean) as string[],
        }))
        .filter((c) => c.emails.length > 0 || c.phones.length > 0);

      setContacts(parsed);
      return parsed;
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      toast.error('Could not access contacts');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isNative]);

  /**
   * Find which contacts are already members by matching emails via edge function.
   * Falls back to empty results if the function isn't available.
   */
  const findMembers = useCallback(async (contactList?: ContactEntry[]): Promise<ContactMatchResult[]> => {
    const list = contactList || contacts;
    if (list.length === 0) return [];

    setIsLoading(true);
    try {
      // Collect all unique emails
      const allEmails = [...new Set(list.flatMap((c) => c.emails.map((e) => e.toLowerCase())))];

      // Call edge function to match emails against auth users
      const { data, error } = await supabase.functions.invoke('match-contacts', {
        body: { emails: allEmails.slice(0, 200) }, // Limit to 200 emails
      });

      const memberEmails = new Map<string, { id: string; name: string }>();
      if (!error && data?.matches) {
        (data.matches as Array<{ email: string; id: string; name: string }>).forEach((m) => {
          memberEmails.set(m.email.toLowerCase(), { id: m.id, name: m.name });
        });
      }

      const results: ContactMatchResult[] = list.map((contact) => {
        const matchedEmail = contact.emails.find((e) => memberEmails.has(e.toLowerCase()));
        const member = matchedEmail ? memberEmails.get(matchedEmail.toLowerCase()) : undefined;

        return {
          contact,
          memberId: member?.id,
          memberName: member?.name,
        };
      });

      // Sort: members first, then alphabetical
      results.sort((a, b) => {
        if (a.memberId && !b.memberId) return -1;
        if (!a.memberId && b.memberId) return 1;
        return a.contact.name.localeCompare(b.contact.name);
      });

      setMatches(results);
      return results;
    } catch (error) {
      console.error('Failed to find members:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [contacts]);

  /**
   * Import contacts and immediately search for existing members.
   */
  const importAndMatch = useCallback(async (): Promise<ContactMatchResult[]> => {
    const fetched = await fetchContacts();
    if (fetched.length === 0) return [];
    return findMembers(fetched);
  }, [fetchContacts, findMembers]);

  return {
    isSupported: isNative,
    isLoading,
    contacts,
    matches,
    fetchContacts,
    findMembers,
    importAndMatch,
  };
}
