// Next.js API route for sending email
import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';
import dotenv from 'dotenv';

dotenv.config();

const mailgunAuth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  },
};

// Configure Nodemailer with Mailgun
const transporter = nodemailer.createTransport(mg(mailgunAuth));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, subject, text } = req.body;

    try {
      // Setup email options
      const mailOptions = {
        from: `Weather App <${process.env.EMAIL_USER}>`, // Sender
        to: process.env.RECEIVER_EMAIL, // Receiver
        subject: subject || 'Weather Alert',
        text: text || 'Here is the weather update.The current temperature has exceeded the threshold temperature of 35°C. Stay Safe Stay home',
      };

      // Send email using Mailgun
      await transporter.sendMail(mailOptions);

      // Log a success message
      console.log('Email sent successfully:', { to: mailOptions.to, subject: mailOptions.subject });

      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Error sending email', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
