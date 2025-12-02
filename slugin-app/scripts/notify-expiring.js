// scripts/notify-expiring.js

require('dotenv').config();
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

dayjs.extend(utc);

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper: format UTC date to YYYY-MM-DD
const datePlusDays = (days) => dayjs().utc().add(days, 'day').format('YYYY-MM-DD');

// Fetch opportunities expiring on a target date
async function fetchExpiringOn(targetISO) {
  const { data, error } = await supabase
    .from('opportunities')
    .select('id, title, user_id, deadline')
    .eq('deadline', targetISO);

  if (error) throw error;
  return data || [];
}

// Fetch user profiles (emails)
async function fetchProfiles(userIds) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email')
    .in('id', userIds);

  if (error) throw error;
  return data || [];
}

// Nodemailer transporter using Gmail
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
}

async function run() {
  const transporter = createTransporter();
  const targets = [5, 2]; // 5-day and 2-day windows
  console.log("Checking for deadlines on:", datePlusDays(5), "and", datePlusDays(2));


  for (const days of targets) {
    const targetISO = datePlusDays(days);
    const opps = await fetchExpiringOn(targetISO);
    if (!opps.length) {
      console.log(`No opportunities expiring in ${days} days`);
      continue;
    }

    const userIds = [...new Set(opps.map((o) => o.user_id))];
    const profiles = await fetchProfiles(userIds);

    for (const opp of opps) {
      const profile = profiles.find((p) => p.id === opp.user_id);
      const to = profile?.email;
      if (!to) continue;

      // Non-email side: insert notification to Supabase when 2 days left
        if (days === 2) {
              await supabase.from('notifications').insert({
                user_id: opp.user_id,
                opportunity_id: opp.id,
                type: 'deadline_warning',
                message: `Your opportunity "${opp.title}" is expiring in 2 days.`,
                created_at: new Date().toISOString()
            });
            console.log(`📌 Inserted notification for ${opp.title}`);
        }

      const editUrl = `https://yourdomain.com/opportunities/${opp.id}/edit`;
      const subject = `Your opportunity is about to expire (${days} days left)`;
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #2c3e50;">⏰ Your opportunity is expiring in ${days} days</h2>
            <p style="font-size: 16px; color: #333;">
                <strong>${opp.title}</strong> is nearing its deadline. Make sure all details are up to date so students can apply in time.
            </p>
            <p style="margin-top: 20px;">
                <a href="https://slugin.ucsc.edu/login" style="background-color: #0077cc; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
                    Log in to update your opportunity
                </a>
            </p>
            <p style="font-size: 12px; color: #888; margin-top: 30px;">
                This is an automated reminder from SlugIn. If you’ve already updated your post, no further action is needed.
            </p>
        </div>
      `;


      try {
        const info = await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to,
          subject,
          html
        });
        console.log(`✅ Sent ${days}-day email to ${to}: ${info.messageId}`);
      } catch (err) {
        console.error(`❌ Failed to send email to ${to}:`, err.message);
      }
    }
  }
}

// Run the script
run().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
