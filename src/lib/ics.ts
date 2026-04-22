import "server-only";

// Minimal RFC 5545 ICS generator. One event, UTC times, CRLF line endings.
// Good enough for Apple/Google/Outlook to import as a calendar event.
// The spec requires commas and semicolons in TEXT fields to be backslash-escaped.

type IcsInput = {
  uid: string;
  startsAt: Date;
  endsAt: Date;
  summary: string;
  location: string;
  description: string;
  organizerName: string;
  organizerEmail: string;
  attendeeName: string;
  attendeeEmail: string;
};

function fmtUtc(d: Date): string {
  return d
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z") // drop millis
    .replace(/[-:]/g, "");
}

function escapeIcsText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function buildRideInvite(input: IcsInput): string {
  const now = fmtUtc(new Date());
  const start = fmtUtc(input.startsAt);
  const end = fmtUtc(input.endsAt);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//jwerba//Ride//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${input.uid}@jwerba.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcsText(input.summary)}`,
    `LOCATION:${escapeIcsText(input.location)}`,
    `DESCRIPTION:${escapeIcsText(input.description)}`,
    `ORGANIZER;CN=${escapeIcsText(input.organizerName)}:MAILTO:${input.organizerEmail}`,
    `ATTENDEE;CN=${escapeIcsText(input.attendeeName)};ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=FALSE:MAILTO:${input.attendeeEmail}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
