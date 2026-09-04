import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // Build email content
    const emailSubject = `New message from ${name} — Portfolio Contact`;
    const emailText = `Name: ${name}\nEmail: ${email}\n${phone ? `Phone: ${phone}\n` : ""}\nMessage:\n${message}`;
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #C4F542; margin-bottom: 20px;">New Portfolio Contact</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 100px;">Name:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${name}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="mailto:${email}">${email}</a></td></tr>
          ${phone ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${phone}</td></tr>` : ""}
        </table>
        <h3 style="margin-top: 20px; color: #333;">Message:</h3>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${message}</p>
      </div>
    `;

    // Use Resend API (free tier — 100 emails/day, no credit card needed)
    // Sign up at resend.com to get your API key
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Portfolio Contact <onboarding@resend.dev>",
          to: "musakhan5572@gmail.com",
          subject: emailSubject,
          text: emailText,
          html: emailHtml,
          reply_to: email,
        }),
      });

      if (response.ok) {
        return NextResponse.json({ success: true, message: "Email sent successfully" });
      } else {
        const data = await response.text();
        console.error("Resend error:", data);
        return NextResponse.json(
          { error: "Failed to send email", details: data },
          { status: 500 }
        );
      }
    }

    // Fallback: use EmailJS-style approach via a simple POST to Web3Forms
    // Web3Forms is free, no signup needed — just use the access key
    const web3Response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: "YOUR_WEB3FORMS_ACCESS_KEY",
        subject: emailSubject,
        from_name: "Portfolio Contact",
        name: name,
        email: email,
        phone: phone || "Not provided",
        message: message,
      }),
    });

    if (web3Response.ok) {
      return NextResponse.json({ success: true, message: "Email sent successfully" });
    } else {
      const data = await web3Response.text();
      console.error("Web3Forms error:", data);
      return NextResponse.json(
        { error: "Failed to send email", details: data },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
