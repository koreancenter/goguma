import { 
  Home, Search, Bell, User, Settings, Heart, Star, 
  MessageCircle, ShoppingCart, Info, HelpCircle, 
  MapPin, Calendar, LogOut, Plus, Trash, Globe, Briefcase, Menu 
} from 'lucide-react';
import { generateLocalSlug } from './slugify';

export { generateLocalSlug } from './slugify';

/**
 * Unified URL-friendly slug generator.
 * Leverages deterministic dictionary matching, Korean phonetic romanization, and kebab-casing.
 */
export function generateSlug(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Handle external URLs or links
  if (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('mailto:')) {
    return text;
  }

  const cleanSlug = generateLocalSlug(text);
  if (!cleanSlug) return '/';
  return cleanSlug.startsWith('/') ? cleanSlug : `/${cleanSlug}`;
}

export const getIconForLabel = (label: string): any => {
  const l = (label || '').toLowerCase();
  if (l.includes('home') || l.includes('main') || l.includes('대시보드') || l.includes('홈')) return Home;
  if (l.includes('search') || l.includes('find') || l.includes('explore') || l.includes('검색')) return Search;
  if (l.includes('bell') || l.includes('notif') || l.includes('notice') || l.includes('알림')) return Bell;
  if (l.includes('user') || l.includes('profile') || l.includes('account') || l.includes('마이') || l.includes('회원')) return User;
  if (l.includes('setting') || l.includes('config') || l.includes('설정')) return Settings;
  if (l.includes('heart') || l.includes('like') || l.includes('좋아요') || l.includes('찜')) return Heart;
  if (l.includes('star') || l.includes('rate') || l.includes('스크랩') || l.includes('별점')) return Star;
  if (l.includes('chat') || l.includes('message') || l.includes('talk') || l.includes('채팅') || l.includes('메시지')) return MessageCircle;
  if (l.includes('cart') || l.includes('shop') || l.includes('store') || l.includes('구매') || l.includes('장바구니') || l.includes('상점')) return ShoppingCart;
  if (l.includes('info') || l.includes('about') || l.includes('정보') || l.includes('소개')) return Info;
  if (l.includes('help') || l.includes('faq') || l.includes('문의') || l.includes('도움')) return HelpCircle;
  if (l.includes('map') || l.includes('location') || l.includes('지도') || l.includes('위치')) return MapPin;
  if (l.includes('calendar') || l.includes('event') || l.includes('schedule') || l.includes('일정') || l.includes('달력')) return Calendar;
  if (l.includes('log') || l.includes('sign') || l.includes('로그')) return LogOut;
  if (l.includes('plus') || l.includes('add') || l.includes('new') || l.includes('추가')) return Plus;
  if (l.includes('trash') || l.includes('delete') || l.includes('삭제')) return Trash;
  if (l.includes('globe') || l.includes('web') || l.includes('world') || l.includes('언어') || l.includes('지구')) return Globe;
  if (l.includes('work') || l.includes('job') || l.includes('business') || l.includes('비즈니스') || l.includes('업무')) return Briefcase;
  return Menu;
};
