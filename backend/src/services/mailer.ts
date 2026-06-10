import nodemailer from 'nodemailer'
import { env } from '../config/env'
import type { SafeUser } from './auth.service'
import type { Order } from './orders.service'
import type { Promotion } from './promotions.service'

const transporter = nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  secure: env.MAIL_PORT === 465,
  auth: env.MAIL_USER
    ? { user: env.MAIL_USER, pass: env.MAIL_PASS }
    : undefined,
})

// ─── helpers ──────────────────────────────────────────────────────────────────

function baseHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #f9f9f9; color: #151515; margin: 0; padding: 0; }
    .wrap { max-width: 560px; margin: 40px auto; background: #fff; padding: 40px; }
    .logo { font-size: 1.5rem; font-weight: 700; letter-spacing: 3px; margin-bottom: 32px; }
    h1 { font-size: 1.25rem; font-weight: 600; margin: 0 0 16px; }
    p { font-size: 0.9375rem; line-height: 1.6; margin: 0 0 16px; color: #444; }
    .btn { display: inline-block; background: #151515; color: #fff; text-decoration: none; padding: 12px 28px; font-size: 0.875rem; font-weight: 500; margin: 8px 0 24px; }
    .divider { border: none; border-top: 1px solid #e8e8e8; margin: 24px 0; }
    table.items { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    table.items th { text-align: left; padding: 6px 0; border-bottom: 1px solid #e8e8e8; font-weight: 500; color: #888; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; }
    table.items td { padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
    .total { font-size: 1rem; font-weight: 600; }
    .footer { font-size: 0.75rem; color: #aaa; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="logo">VELN</div>
    ${body}
    <hr class="divider" />
    <p class="footer">You received this email because you have an account at VELN. &copy; ${new Date().getFullYear()} VELN.</p>
  </div>
</body>
</html>`
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

// ─── 1. Welcome email ─────────────────────────────────────────────────────────

export async function sendWelcomeEmail(user: SafeUser): Promise<void> {
  const html = baseHtml(
    'Bienvenido a VELN',
    `<h1>Welcome, ${user.name}.</h1>
     <p>Your VELN account is ready. Explore our latest collections and find pieces crafted to last.</p>
     <a class="btn" href="${env.FRONTEND_URL}">Shop now</a>
     <p>If you have any questions, just reply to this email — we're always happy to help.</p>`
  )

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: user.email,
    subject: 'Bienvenido a VELN',
    html,
  })
}

// ─── 2. Password reset email ──────────────────────────────────────────────────

export async function sendPasswordResetEmail(user: SafeUser, token: string): Promise<void> {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`

  const html = baseHtml(
    'Reset your VELN password',
    `<h1>Reset your password</h1>
     <p>Hi ${user.name}, we received a request to reset your VELN password.</p>
     <a class="btn" href="${resetUrl}">Reset password</a>
     <p>This link expires in <strong>1 hour</strong>. If you didn't request a reset, you can safely ignore this email.</p>
     <p style="font-size:0.8125rem;color:#aaa;word-break:break-all;">Or copy this link: ${resetUrl}</p>`
  )

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: user.email,
    subject: 'Reset your VELN password',
    html,
  })
}

// ─── 3. Promotion notification email ─────────────────────────────────────────

export async function sendPromotionEmail(users: SafeUser[], promotion: Promotion): Promise<void> {
  const shopUrl = `${env.FRONTEND_URL}/?promo=${encodeURIComponent(promotion.name)}`

  const html = baseHtml(
    `${promotion.name} — VELN`,
    `<h1>${promotion.name}</h1>
     ${promotion.description ? `<p>${promotion.description}</p>` : ''}
     <p>Enjoy <strong>${promotion.discount_pct}% off</strong> on selected pieces. Valid until ${new Date(promotion.ends_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.</p>
     <a class="btn" href="${shopUrl}">Shop the promotion</a>`
  )

  // Send individually so each recipient sees only their own address.
  await Promise.all(
    users.map((u) =>
      transporter.sendMail({
        from: env.MAIL_FROM,
        to: u.email,
        subject: `${promotion.name} — up to ${promotion.discount_pct}% off at VELN`,
        html,
      })
    )
  )
}

// ─── 4. Order confirmation email ─────────────────────────────────────────────

export async function sendOrderConfirmationEmail(user: SafeUser, order: Order): Promise<void> {
  const itemRows = (order.items ?? [])
    .map(
      (item) =>
        `<tr>
          <td>${item.name}</td>
          <td style="text-align:center">${item.quantity}</td>
          <td style="text-align:right">${formatPrice(item.unit_price)}</td>
          <td style="text-align:right">${formatPrice(item.unit_price * item.quantity)}</td>
        </tr>`
    )
    .join('')

  const html = baseHtml(
    `Order #${String(order.id).padStart(5, '0')} confirmed — VELN`,
    `<h1>Order confirmed</h1>
     <p>Hi ${user.name}, thank you for your order. We'll notify you when it ships.</p>
     <p><strong>Order #${String(order.id).padStart(5, '0')}</strong> &nbsp;·&nbsp; ${new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
     <hr class="divider" />
     <table class="items">
       <thead>
         <tr>
           <th>Item</th>
           <th style="text-align:center">Qty</th>
           <th style="text-align:right">Unit</th>
           <th style="text-align:right">Total</th>
         </tr>
       </thead>
       <tbody>${itemRows}</tbody>
     </table>
     <hr class="divider" />
     <p class="total" style="text-align:right">Total: ${formatPrice(order.total)}</p>
     <hr class="divider" />
     <p><strong>Ship to:</strong><br/>${order.shipping_name}<br/>${order.shipping_address}</p>
     <a class="btn" href="${env.FRONTEND_URL}/orders/${order.id}">View order</a>`
  )

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: user.email,
    subject: `Order #${String(order.id).padStart(5, '0')} confirmed — VELN`,
    html,
  })
}
