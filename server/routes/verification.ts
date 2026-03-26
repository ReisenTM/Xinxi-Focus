import { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import 'dotenv/config';

const router = Router();

// ===== 验证码内存存储 =====
interface CodeEntry {
  code: string;
  expiresAt: number;
  sentAt: number;
}

const codeStore = new Map<string, CodeEntry>();

// 每 5 分钟清理过期验证码
setInterval(() => {
  const now = Date.now();
  for (const [email, entry] of codeStore) {
    if (now > entry.expiresAt) {
      codeStore.delete(email);
    }
  }
}, 5 * 60 * 1000);

// 生成 6 位数字验证码
function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// 创建 nodemailer transporter
function createTransporter() {
  const port = Number(process.env.SMTP_PORT) || 465;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.qq.com',
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// POST /api/auth/send-code — 发送验证码
router.post('/send-code', async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: '请提供邮箱地址' });
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: '邮箱格式不正确' });
  }

  // 限流: 60 秒内不能重复发送
  const existing = codeStore.get(email);
  if (existing && Date.now() - existing.sentAt < 60 * 1000) {
    const waitSeconds = Math.ceil((60 * 1000 - (Date.now() - existing.sentAt)) / 1000);
    return res.status(429).json({ error: `请${waitSeconds}秒后再试` });
  }

  const code = generateCode();

  // 存储验证码 (5 分钟过期)
  codeStore.set(email, {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000,
    sentAt: Date.now(),
  });

  // 发送邮件
  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: `"心隙专注" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '【心隙专注】注册验证码',
      html: `
        <div style="max-width: 480px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; background: #f8faf9; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 48px; height: 48px; background: #4a7c6f; border-radius: 16px; line-height: 48px; color: white; font-size: 24px; font-weight: 900; font-style: italic;">F</div>
            <h2 style="margin: 12px 0 4px; color: #1a1c1b; font-size: 20px;">心隙专注</h2>
            <p style="color: #6b7b75; font-size: 13px; margin: 0;">开启你的深度专注之旅</p>
          </div>
          <div style="background: white; border-radius: 12px; padding: 24px; text-align: center; border: 1px solid #e0e3e1;">
            <p style="color: #3a4a44; font-size: 14px; margin: 0 0 16px;">你的注册验证码是：</p>
            <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4a7c6f; margin: 16px 0; font-family: 'Courier New', monospace;">${code}</div>
            <p style="color: #8a9a94; font-size: 12px; margin: 16px 0 0;">验证码 5 分钟内有效，请勿泄露给他人。</p>
          </div>
          <p style="color: #aab4ae; font-size: 11px; text-align: center; margin-top: 20px;">如果你没有注册心隙专注，请忽略此邮件。</p>
        </div>
      `,
    });

    console.log(`✉️  验证码已发送至 ${email}`);
    return res.json({ message: '验证码已发送', expiresIn: 300 });
  } catch (err) {
    console.error('邮件发送失败:', err);
    codeStore.delete(email); // 发送失败则清除验证码
    return res.status(500).json({ error: '验证码发送失败，请检查邮箱地址或稍后重试' });
  }
});

// 导出验证函数供 auth 路由使用
export function verifyCode(email: string, code: string): { valid: boolean; error?: string } {
  const entry = codeStore.get(email);
  
  if (!entry) {
    return { valid: false, error: '请先获取验证码' };
  }
  
  if (Date.now() > entry.expiresAt) {
    codeStore.delete(email);
    return { valid: false, error: '验证码已过期，请重新获取' };
  }
  
  if (entry.code !== code) {
    return { valid: false, error: '验证码错误' };
  }
  
  // 验证通过，删除已用验证码
  codeStore.delete(email);
  return { valid: true };
}

export default router;
