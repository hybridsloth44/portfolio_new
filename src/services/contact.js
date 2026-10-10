const emailjs = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim(),
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim(),
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim(),
};

export const contactConfigured = Boolean(emailjs.serviceId && emailjs.templateId && emailjs.publicKey);

export async function sendContactMessage(fields) {
  if (!contactConfigured) throw new Error('Contact delivery is not configured');
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(20000),
    body: JSON.stringify({
      service_id: emailjs.serviceId,
      template_id: emailjs.templateId,
      user_id: emailjs.publicKey,
      template_params: {
        first_name: fields.firstName,
        last_name: fields.lastName,
        name: `${fields.firstName} ${fields.lastName}`,
        email: fields.email,
        reply_to: fields.email,
        phone: fields.phone || 'Not provided',
        message: fields.message,
      },
    }),
  });
  if (!response.ok) throw new Error('Contact delivery failed');
}
