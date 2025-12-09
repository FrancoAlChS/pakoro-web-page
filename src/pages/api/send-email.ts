import type { APIRoute } from "astro";
import nodemailer from "nodemailer";

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();
  const name = data.get("name");
  const email = data.get("email");
  const subject = data.get("subject");
  const message = data.get("message");

  // Validate the data - you'll likely want to do more than this
  if (!name || !email || !subject || !message) {
    return new Response(
      JSON.stringify({
        message: "Faltan campos requeridos",
      }),
      { status: 400 }
    );
  }

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: import.meta.env.SMTP_HOST,
    port: parseInt(import.meta.env.SMTP_PORT || "587"),
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: import.meta.env.SMTP_USER,
      pass: import.meta.env.SMTP_PASS,
    },
  });

  try {
    // Send the email
    await transporter.sendMail({
      from: `"${name}" <${import.meta.env.SMTP_USER}>`, // sender address
      to: "servicios.pakoro@gmail.com", // list of receivers
      replyTo: email.toString(),
      subject: `Nuevo mensaje de contacto: ${subject}`, // Subject line
      text: message.toString(), // plain text body
      html: `
        <h3>Nuevo mensaje de contacto desde la web</h3>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Asunto:</strong> ${subject}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
      `, // html body
    });

    return new Response(
      JSON.stringify({
        message: "¡Mensaje enviado con éxito!",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({
        message: "Error al enviar el mensaje",
      }),
      { status: 500 }
    );
  }
};
