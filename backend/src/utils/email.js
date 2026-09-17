const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

// Send OTP email
const sendOTPEmail = async (to, otp) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email is not configured");
  }

  const mail = getTransporter();

  await mail.sendMail({
    from: `"Safar ✈️" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Safar Login OTP 🔐",
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1c; color: #fff; border-radius: 16px; overflow: hidden;">
        
        <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">✈️ Safar</h1>
          <p style="margin: 8px 0 0; opacity: 0.9;">Welcome to your journey</p>
        </div>

        <div style="padding: 32px;">
          <h2 style="color: #f59e0b; margin-top: 0;">
            Login Verification
          </h2>

          <p style="color: #9ca3af; line-height: 1.6;">
            Use the OTP below to verify your email address and login to Safar.
          </p>

          <div style="
            background: rgba(255,255,255,0.06);
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            text-align: center;
          ">
            <div style="
              font-size: 36px;
              font-weight: bold;
              letter-spacing: 10px;
              color: #3b82f6;
            ">
              ${otp}
            </div>
          </div>

          <p style="color: #9ca3af; font-size: 14px;">
            This OTP is valid for <strong>5 minutes</strong>.
          </p>

          <p style="color: #6b7280; font-size: 13px;">
            If you didn't request this OTP, you can safely ignore this email.
          </p>
        </div>

        <div style="
          background: rgba(255,255,255,0.03);
          padding: 16px;
          text-align: center;
          color: #4b5563;
          font-size: 12px;
        ">
          Team Safar ✨ • Your Travel Partner
        </div>

      </div>
    `,
  });

  console.log(`📧 OTP sent to ${to}`);
};


// Existing trip email
const sendTripEmail = async (to, tripData) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("⚠️ Email not configured, skipping email send");
    return;
  }

  try {
    const mail = getTransporter();

    await mail.sendMail({
      from: `"Safar ✈️" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your Safar Trip Plan 🌍",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1c; color: #fff; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">✈️ Safar</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">Your Journey Awaits</p>
          </div>

          <div style="padding: 32px;">
            <h2 style="color: #f59e0b; margin-top: 0;">
              Hello ${tripData.name}!
            </h2>

            <p style="color: #9ca3af; line-height: 1.6;">
              Your trip to
              <strong style="color: #3b82f6;">
                ${tripData.place}
              </strong>
              is being planned!
            </p>

            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin: 20px 0;">
              <p style="margin: 8px 0;">📍 <strong>Destination:</strong> ${tripData.place}</p>
              <p style="margin: 8px 0;">📅 <strong>Days:</strong> ${tripData.days}</p>
              <p style="margin: 8px 0;">💰 <strong>Budget:</strong> ₹${tripData.budget}</p>
              <p style="margin: 8px 0;">👥 <strong>People:</strong> ${tripData.people || 1}</p>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              We'll get back to you shortly with a detailed itinerary.
            </p>
          </div>

          <div style="background: rgba(255,255,255,0.03); padding: 16px; text-align: center; color: #4b5563; font-size: 12px;">
            Team Safar ✨ • Your Travel Partner
          </div>
        </div>
      `,
    });

    console.log(`📧 Trip email sent to ${to}`);
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
  }
};

module.exports = {
  sendOTPEmail,
  sendTripEmail,
};