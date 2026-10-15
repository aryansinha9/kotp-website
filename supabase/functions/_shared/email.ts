// supabase/functions/_shared/email.ts
//
// Shared confirmation-email sender for registration webhooks.
//
// Sending is deliberately best-effort: a webhook's job is to record the
// payment, and that must not fail because an email provider is having a bad
// day. Every function here swallows its errors and reports them in the return
// value so the caller can log and carry on.

import { Resend } from 'https://esm.sh/resend@3.2.0'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

// Verified Resend sending domain. Mail is DKIM-signed as
// send.kingofthepitch.com.au, which aligns with the root domain's DMARC
// policy (p=quarantine, relaxed alignment), so it authenticates correctly.
const FROM = 'King of the Pitch <noreply@send.kingofthepitch.com.au>'
const REPLY_TO = 'kotp.football@gmail.com'

const BRAND = '#FF6B00'

export interface EmailDetail {
  label: string
  value: string
}

export interface ConfirmationEmail {
  to: string
  /** Who the registration is for, e.g. "Jamie Smith". */
  participantName: string
  /** Program title as it should appear in the email. */
  programName: string
  /** Rows rendered into the summary table. Falsy values are dropped. */
  details: EmailDetail[]
  /** Total paid in cents, as reported by Stripe. */
  amountTotalCents?: number | null
}

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const formatAmount = (cents?: number | null): string | null =>
  typeof cents === 'number' ? `$${(cents / 100).toFixed(2)} AUD` : null

const buildHtml = ({ participantName, programName, details, amountTotalCents }: ConfirmationEmail): string => {
  const amount = formatAmount(amountTotalCents)
  const rows = [...details, ...(amount ? [{ label: 'Total paid', value: amount }] : [])]
    .filter(row => row && row.value)
    .map(row => `
      <tr>
        <td style="padding:10px 0;color:#6b7280;font-size:14px;vertical-align:top;width:45%;">${escapeHtml(row.label)}</td>
        <td style="padding:10px 0;color:#111827;font-size:14px;font-weight:600;">${escapeHtml(row.value)}</td>
      </tr>`)
    .join('')

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

            <tr>
              <td style="background:#0a0a0a;padding:28px 32px;">
                <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.5px;">KING OF THE PITCH</p>
                <p style="margin:6px 0 0;color:${BRAND};font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Registration Confirmed</p>
              </td>
            </tr>

            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 16px;color:#111827;font-size:16px;line-height:1.6;">
                  Thanks for registering. <strong>${escapeHtml(participantName)}</strong> is confirmed for the
                  <strong>${escapeHtml(programName)}</strong>, and payment has been received.
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;margin:24px 0 0;">
                  ${rows}
                </table>

                <p style="margin:28px 0 0;color:#6b7280;font-size:14px;line-height:1.6;">
                  Keep this email for your records. If anything above looks wrong, just reply to this message and we'll sort it out.
                </p>
              </td>
            </tr>

            <tr>
              <td style="background:#fafafa;padding:20px 32px;border-top:1px solid #e5e7eb;">
                <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                  King of the Pitch &middot; Replies go to ${escapeHtml(REPLY_TO)}
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

const buildText = ({ participantName, programName, details, amountTotalCents }: ConfirmationEmail): string => {
  const amount = formatAmount(amountTotalCents)
  const rows = [...details, ...(amount ? [{ label: 'Total paid', value: amount }] : [])]
    .filter(row => row && row.value)
    .map(row => `${row.label}: ${row.value}`)
    .join('\n')

  return [
    'KING OF THE PITCH - Registration Confirmed',
    '',
    `Thanks for registering. ${participantName} is confirmed for the ${programName}, and payment has been received.`,
    '',
    rows,
    '',
    `Keep this email for your records. If anything looks wrong, reply to this message or contact ${REPLY_TO}.`,
  ].join('\n')
}

/**
 * Sends a registration confirmation. Never throws - inspect the result.
 */
export const sendConfirmationEmail = async (
  payload: ConfirmationEmail,
): Promise<{ ok: boolean; id?: string; error?: string }> => {
  if (!RESEND_API_KEY) {
    return { ok: false, error: 'RESEND_API_KEY is not configured' }
  }

  const to = (payload.to || '').trim()
  // A missing recipient is normal for some records, not an error worth alarming on.
  if (!to || !to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return { ok: false, error: `No valid recipient address (got: ${to || 'empty'})` }
  }

  try {
    const resend = new Resend(RESEND_API_KEY)
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      replyTo: REPLY_TO,
      subject: `Registration confirmed - ${payload.programName}`,
      html: buildHtml(payload),
      text: buildText(payload),
    })

    if (error) {
      return { ok: false, error: typeof error === 'string' ? error : JSON.stringify(error) }
    }
    return { ok: true, id: data?.id }
  } catch (err) {
    return { ok: false, error: (err as Error)?.message ?? String(err) }
  }
}

/**
 * Wraps sendConfirmationEmail with logging, for use inside a webhook where the
 * outcome should never affect the HTTP response.
 */
export const sendConfirmationEmailSafely = async (payload: ConfirmationEmail): Promise<void> => {
  const result = await sendConfirmationEmail(payload)
  if (result.ok) {
    console.log(`Confirmation email sent to ${payload.to} (resend id: ${result.id})`)
  } else {
    console.error(`Confirmation email NOT sent to ${payload.to}: ${result.error}`)
  }
}
