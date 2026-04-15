import React from 'react';
import {
  ShieldCheck, Eye, FileCheck, Scale, BookOpen, Users,
  Landmark, FileSpreadsheet, Shield, User, Briefcase,
  MapPin, CalendarDays, Clock, CheckCircle2, HelpCircle,
  Building2, Award, Phone, Mail, Globe, Star,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<any>> = {
  ShieldCheck, Eye, FileCheck, Scale, BookOpen, Users,
  Landmark, FileSpreadsheet, Shield, User, Briefcase,
  MapPin, CalendarDays, Clock, CheckCircle2, HelpCircle,
  Building2, Award, Phone, Mail, Globe, Star,
};

type IconProps = {
  name: string;
  size?: number;
  className?: string;
};

export function Icon({ name, size = 20, className }: IconProps) {
  const IconComponent = iconMap[name] || HelpCircle;
  return <IconComponent size={size} className={className} />;
}
