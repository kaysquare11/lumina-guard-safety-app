const nodemailer = require('nodemailer');

// Create transporter
let transporter = null;

// Initialize email service
const initEmailService = () => {
  // Check if email is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  Email not configured - emails will not be sent');
    console.log('⚠️  Add EMAIL_USER and EMAIL_PASS to .env to enable emails');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log('✅ Email service configured');
    return transporter;
  } catch (error) {
    console.error('❌ Email service initialization failed:', error.message);
    return null;
  }
};

// Initialize on module load
initEmailService();

// Send SOS Alert Email
const sendSOSAlert = async (toEmail, userName, location) => {
  if (!transporter) {
    console.log('📧 Email not configured - skipping email notification');
    return { success: false, message: 'Email not configured' };
  }

  try {
    const mapLink = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Lumina Guard" <noreply@luminaguard.com>',
      to: toEmail,
      subject: `🚨 EMERGENCY ALERT - ${userName} needs help!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">🚨 EMERGENCY ALERT</h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-top: 0;">Emergency SOS Triggered!</h2>
            
            <p style="font-size: 16px; color: #4b5563;">
              <strong>${userName}</strong> has triggered an emergency SOS alert and may need immediate assistance.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>📍 Location:</strong></p>
              <p style="margin: 10px 0; color: #6b7280;">
                Latitude: ${location.latitude.toFixed(6)}<br>
                Longitude: ${location.longitude.toFixed(6)}
              </p>
              
              <p style="margin: 20px 0;"><strong>⏰ Time:</strong></p>
              <p style="margin: 10px 0; color: #6b7280;">
                ${new Date().toLocaleString()}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${mapLink}" 
                 style="background: #dc2626; color: white; padding: 15px 40px; text-decoration: none; border-radius: 10px; display: inline-block; font-weight: bold;">
                📍 VIEW LOCATION ON MAP
              </a>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;">
                <strong>⚠️ Action Required:</strong> Please try to contact ${userName} immediately or notify local emergency services if you cannot reach them.
              </p>
            </div>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; text-align: center;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              This is an automated emergency alert from Lumina Guard Safety System<br>
              If you received this message in error, please disregard it.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to: ${toEmail}`, info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email send failed to ${toEmail}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Send Welcome Email
const sendWelcomeEmail = async (toEmail, userName) => {
  if (!transporter) {
    return { success: false, message: 'Email not configured' };
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Lumina Guard" <noreply@luminaguard.com>',
      to: toEmail,
      subject: '🌟 Welcome to Lumina Guard - Your Circle of Light',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to Lumina Guard</h1>
            <p style="color: white; opacity: 0.9; margin-top: 10px;">Your Circle of Light</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937;">Hello ${userName}! 👋</h2>
            
            <p style="font-size: 16px; color: #4b5563;">
              Thank you for joining Lumina Guard. Your safety is our priority, and we're here to protect you 24/7.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">🛡️ Getting Started:</h3>
              <ul style="color: #6b7280; line-height: 1.8;">
                <li>Add your emergency contacts in your profile</li>
                <li>Familiarize yourself with the SOS button location</li>
                <li>Review nearby safe zones on your map</li>
                <li>Test your location access permissions</li>
              </ul>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
              Remember: In an emergency, just tap the SOS button and your emergency contacts will be notified immediately with your location.
            </p>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; text-align: center;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Stay safe with Lumina Guard 💜
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Welcome email failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendSOSAlert,
  sendWelcomeEmail
};