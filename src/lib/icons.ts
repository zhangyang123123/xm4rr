import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const ICON_OPTIONS = [
  { value: 'Github', label: 'GitHub' },
  { value: 'Twitter', label: 'Twitter / X' },
  { value: 'Linkedin', label: 'LinkedIn' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Youtube', label: 'YouTube' },
  { value: 'Dribbble', label: 'Dribbble' },
  { value: 'Globe', label: '网站/地球' },
  { value: 'BookOpen', label: '书籍/文章' },
  { value: 'Code2', label: '代码' },
  { value: 'Figma', label: 'Figma' },
  { value: 'ExternalLink', label: '外部链接' },
  { value: 'Mail', label: '邮箱' },
  { value: 'Send', label: 'Telegram/发送' },
  { value: 'MessageCircle', label: 'Discord/消息' },
  { value: 'Phone', label: '电话' },
  { value: 'MapPin', label: '地址' },
  { value: 'Music', label: '音乐' },
  { value: 'Video', label: '视频' },
  { value: 'ShoppingBag', label: '购物' },
  { value: 'Link2', label: '链接' },
] as const;

export function getIconByName(name: string): LucideIcon {
  const iconMap = Icons as unknown as Record<string, LucideIcon>;
  return iconMap[name] || Icons.Link2;
}
