# Contact form / EmailJS setup

The contact form is implemented using the official EmailJS REST endpoint, with loading, success, failure, and required-field states. Its frontend integration is ready, but Gmail delivery is not active until the account configuration below is supplied. Direct email and Instagram links work independently.

1. Sign in or create your account at https://dashboard.emailjs.com/.
2. In **Email Services**, add **Gmail** and connect **skambampally@gmail.com** through Google's sign-in flow. Keep your Gmail password out of the website configuration. Record the Service ID.
3. Create an email template with these settings:

   | Setting | Value |
   | --- | --- |
   | To Email | `skambampally@gmail.com` (fixed in the dashboard) |
   | From Name | `{{name}}` |
   | From Email | The connected Gmail address / default service address |
   | Reply To | `{{reply_to}}` |
   | Subject | `Photography enquiry from {{name}}` |

   Suggested template body:

   ```text
   Name: {{first_name}} {{last_name}}
   Email: {{email}}
   Phone: {{phone}}

   {{message}}
   ```

   Record the Template ID. Use ordinary escaped variables, with a fixed recipient.
4. Find your Public Key in the account settings. Add the following public configuration to ignored `.env.local` (or the deployment's environment settings):

   ```dotenv
   VITE_EMAILJS_SERVICE_ID=your_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   ```

5. Restart the development server after changing environment values, or rebuild for production. Use EmailJS's service test, then verify the form delivers to Gmail and replies address the visitor.

Only the three public account values are used by the browser. No Gmail password, private key, or OAuth token belongs in these settings. Until configured, submitting the form reports that delivery is unavailable and offers the direct email link; it never reports a successful send.

Official references: [Connecting email services](https://www.emailjs.com/docs/user-guide/connecting-email-services/), [REST send API](https://www.emailjs.com/docs/rest-api/send/).
