const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const RECIPIENTS = (process.env.LEAD_NOTIFICATION_EMAIL || '').split(',').map(e => e.trim()).filter(Boolean);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, CORS_HEADERS);
    return res.end();
  }

  // Set CORS headers on all responses
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // --- Spam protection ---
    // Honeypot: if the hidden field has a value, silently reject
    if (data.website_url) {
      return res.status(200).json({ success: true });
    }

    // Timestamp check: reject if submitted faster than 2 seconds
    if (data._loadTime) {
      const elapsed = Date.now() - Number(data._loadTime);
      if (elapsed < 2000) {
        return res.status(200).json({ success: true });
      }
    }

    // Token validation
    if (!data._token || data._token.length < 10) {
      return res.status(200).json({ success: true });
    }

    // --- Validation ---
    if (!data.email || !data.email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    if (!data.name) {
      return res.status(400).json({ error: 'Name is required.' });
    }

    // --- Determine form type ---
    const formType = data.formType === 'quote_request' ? 'Quote Request' : 'Contact';
    const subject = `New ${formType}: ${data.name} - Ball Transfer Systems`;

    // --- Build email HTML ---
    const emailHtml = buildEmailHtml(data, formType);

    // --- Send email via Resend ---
    const { error } = await resend.emails.send({
      from: 'Ball Transfer Systems <leads@organicallyseo.com>',
      to: RECIPIENTS,
      replyTo: data.email,
      subject,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send notification.' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Submit lead error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

function buildEmailHtml(data, formType) {
  const fields = [];

  fields.push({ label: 'Name', value: data.name });
  fields.push({ label: 'Email', value: data.email });
  if (data.phone) fields.push({ label: 'Phone', value: data.phone });
  if (data.company) fields.push({ label: 'Company', value: data.company });
  if (data.job_title) fields.push({ label: 'Job Title', value: data.job_title });
  if (data.product) fields.push({ label: 'Product Interest', value: data.product });
  if (data.timeline) fields.push({ label: 'Timeline', value: data.timeline });
  if (data.updates) fields.push({ label: 'Marketing Opt-in', value: data.updates === 'yes' ? 'Yes' : 'No' });
  if (data.message) fields.push({ label: 'Message', value: data.message });

  const fieldRows = fields.map(f => `
    <tr>
      <td style="padding: 10px 16px; font-weight: 600; color: #133a63; width: 140px; vertical-align: top; border-bottom: 1px solid #eee;">${escapeHtml(f.label)}</td>
      <td style="padding: 10px 16px; color: #333; border-bottom: 1px solid #eee;">${escapeHtml(f.value)}</td>
    </tr>
  `).join('');

  const metaInfo = [];
  if (data.pageUrl) metaInfo.push(`Page: ${data.pageUrl}`);
  if (data.utm_source) metaInfo.push(`Source: ${data.utm_source}`);
  if (data.utm_medium) metaInfo.push(`Medium: ${data.utm_medium}`);
  if (data.utm_campaign) metaInfo.push(`Campaign: ${data.utm_campaign}`);

  const metaSection = metaInfo.length > 0 ? `
    <div style="margin-top: 24px; padding: 12px 16px; background: #f5f5f5; border-radius: 6px; font-size: 12px; color: #888;">
      ${metaInfo.map(m => escapeHtml(m)).join(' &bull; ')}
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f4f4f7; padding: 32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background: #133a63; padding: 24px 32px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">
                Ball Transfer Systems
              </h1>
              <p style="margin: 4px 0 0; color: rgba(255,255,255,0.7); font-size: 13px;">Lead Notification</p>
            </td>
          </tr>
          <!-- Badge -->
          <tr>
            <td style="padding: 24px 32px 0;">
              <span style="display: inline-block; background: #e86a00; color: #fff; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                ${escapeHtml(formType)}
              </span>
            </td>
          </tr>
          <!-- Fields -->
          <tr>
            <td style="padding: 16px 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 6px; overflow: hidden;">
                ${fieldRows}
              </table>
              ${metaSection}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 16px 32px; background: #f9fafb; border-top: 1px solid #eee;">
              <p style="margin: 0; font-size: 12px; color: #888; text-align: center;">
                This notification was sent from the Ball Transfer Systems website.
                Reply to this email to respond directly to the lead.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
