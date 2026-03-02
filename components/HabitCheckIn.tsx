import React, { useState, useEffect, useRef } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { 
  Plus, 
  Check, 
  X, 
  Calendar as CalendarIcon,
  List,
  Grid,
  Code,
  Sun,
  Zap,
  BookOpen,
  Activity,
  CheckCircle2,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Heart,
  Flame,
  Target,
  Star,
  Trophy,
  Coffee,
  Dumbbell,
  Music,
  Film,
  Gamepad2,
  Camera,
  PenTool,
  Palette,
  ShoppingBag,
  Plane,
  Car,
  Bike,
  Home,
  Briefcase,
  GraduationCap,
  Smile,
  Moon,
  Cloud,
  Droplet,
  Leaf,
  Flower2,
  TreePine,
  Mountain,
  Waves,
  Sparkles,
  Lightbulb,
  Rocket,
  Gift,
  Bell,
  Clock,
  Timer,
  Calendar,
  Search,
  Settings,
  User,
  Users,
  Baby,
  Dog,
  Cat,
  Fish,
  Bird,
  Search as SearchIcon
} from 'lucide-react';
import { Habit, HabitWithStats, HabitGoalType, HabitDurationType } from '../types';
import { habitApi } from '../services/habitApi';

interface HabitCheckInProps {
  onBack?: () => void;
  habits?: Habit[];
  habitsWithStats?: HabitWithStats[];
  isLoading?: boolean;
  onReload?: () => Promise<void>;
}

// 图标接口
interface IconItem {
  name: string;
  component: React.ComponentType<any>;
  category: string;
}

// 所有可用的图标 - 255个常用图标，按分类组织
const AVAILABLE_ICONS: IconItem[] = [
  // 运动健身 (25个)
  { name: 'Activity', component: Activity, category: '运动健身' },
  { name: 'Dumbbell', component: Dumbbell, category: '运动健身' },
  { name: 'Target', component: Target, category: '运动健身' },
  { name: 'Trophy', component: Trophy, category: '运动健身' },
  { name: 'Zap', component: Zap, category: '运动健身' },
  { name: 'Flame', component: Flame, category: '运动健身' },
  { name: 'Bike', component: Bike, category: '运动健身' },
  { name: 'CheckCircle2', component: CheckCircle2, category: '运动健身' },
  { name: 'Star', component: Star, category: '运动健身' },
  { name: 'Heart', component: Heart, category: '运动健身' },
  { name: 'Rocket', component: Rocket, category: '运动健身' },
  { name: 'Lightbulb', component: Lightbulb, category: '运动健身' },
  { name: 'Sparkles', component: Sparkles, category: '运动健身' },
  { name: 'Gift', component: Gift, category: '运动健身' },
  { name: 'Bell', component: Bell, category: '运动健身' },
  { name: 'Clock', component: Clock, category: '运动健身' },
  { name: 'Timer', component: Timer, category: '运动健身' },
  { name: 'Calendar', component: Calendar, category: '运动健身' },
  { name: 'User', component: User, category: '运动健身' },
  { name: 'Users', component: Users, category: '运动健身' },
  { name: 'Settings', component: Settings, category: '运动健身' },
  { name: 'Search', component: Search, category: '运动健身' },
  { name: 'Grid', component: Grid, category: '运动健身' },
  { name: 'List', component: List, category: '运动健身' },
  { name: 'Plus', component: Plus, category: '运动健身' },
  
  // 学习工作 (25个)
  { name: 'BookOpen', component: BookOpen, category: '学习工作' },
  { name: 'GraduationCap', component: GraduationCap, category: '学习工作' },
  { name: 'PenTool', component: PenTool, category: '学习工作' },
  { name: 'Code', component: Code, category: '学习工作' },
  { name: 'Briefcase', component: Briefcase, category: '学习工作' },
  { name: 'Home', component: Home, category: '学习工作' },
  { name: 'Camera', component: Camera, category: '学习工作' },
  { name: 'Palette', component: Palette, category: '学习工作' },
  { name: 'Lightbulb', component: Lightbulb, category: '学习工作' },
  { name: 'Target', component: Target, category: '学习工作' },
  { name: 'CheckCircle2', component: CheckCircle2, category: '学习工作' },
  { name: 'Star', component: Star, category: '学习工作' },
  { name: 'Trophy', component: Trophy, category: '学习工作' },
  { name: 'Zap', component: Zap, category: '学习工作' },
  { name: 'Rocket', component: Rocket, category: '学习工作' },
  { name: 'Sparkles', component: Sparkles, category: '学习工作' },
  { name: 'Bell', component: Bell, category: '学习工作' },
  { name: 'Clock', component: Clock, category: '学习工作' },
  { name: 'Timer', component: Timer, category: '学习工作' },
  { name: 'Calendar', component: Calendar, category: '学习工作' },
  { name: 'User', component: User, category: '学习工作' },
  { name: 'Users', component: Users, category: '学习工作' },
  { name: 'Settings', component: Settings, category: '学习工作' },
  { name: 'Search', component: Search, category: '学习工作' },
  { name: 'Grid', component: Grid, category: '学习工作' },
  
  // 生活日常 (25个)
  { name: 'Home', component: Home, category: '生活日常' },
  { name: 'Bell', component: Bell, category: '生活日常' },
  { name: 'Clock', component: Clock, category: '生活日常' },
  { name: 'Timer', component: Timer, category: '生活日常' },
  { name: 'Calendar', component: Calendar, category: '生活日常' },
  { name: 'ShoppingBag', component: ShoppingBag, category: '生活日常' },
  { name: 'User', component: User, category: '生活日常' },
  { name: 'Users', component: Users, category: '生活日常' },
  { name: 'Baby', component: Baby, category: '生活日常' },
  { name: 'Dog', component: Dog, category: '生活日常' },
  { name: 'Cat', component: Cat, category: '生活日常' },
  { name: 'Fish', component: Fish, category: '生活日常' },
  { name: 'Bird', component: Bird, category: '生活日常' },
  { name: 'Sun', component: Sun, category: '生活日常' },
  { name: 'Moon', component: Moon, category: '生活日常' },
  { name: 'Cloud', component: Cloud, category: '生活日常' },
  { name: 'Droplet', component: Droplet, category: '生活日常' },
  { name: 'Settings', component: Settings, category: '生活日常' },
  { name: 'Search', component: Search, category: '生活日常' },
  { name: 'Grid', component: Grid, category: '生活日常' },
  { name: 'List', component: List, category: '生活日常' },
  { name: 'Plus', component: Plus, category: '生活日常' },
  { name: 'Check', component: Check, category: '生活日常' },
  { name: 'X', component: X, category: '生活日常' },
  { name: 'Edit', component: Edit, category: '生活日常' },
  
  // 娱乐休闲 (25个)
  { name: 'Music', component: Music, category: '娱乐休闲' },
  { name: 'Film', component: Film, category: '娱乐休闲' },
  { name: 'Gamepad2', component: Gamepad2, category: '娱乐休闲' },
  { name: 'Camera', component: Camera, category: '娱乐休闲' },
  { name: 'Palette', component: Palette, category: '娱乐休闲' },
  { name: 'Sparkles', component: Sparkles, category: '娱乐休闲' },
  { name: 'Star', component: Star, category: '娱乐休闲' },
  { name: 'Heart', component: Heart, category: '娱乐休闲' },
  { name: 'Smile', component: Smile, category: '娱乐休闲' },
  { name: 'Gift', component: Gift, category: '娱乐休闲' },
  { name: 'Rocket', component: Rocket, category: '娱乐休闲' },
  { name: 'Lightbulb', component: Lightbulb, category: '娱乐休闲' },
  { name: 'Trophy', component: Trophy, category: '娱乐休闲' },
  { name: 'Zap', component: Zap, category: '娱乐休闲' },
  { name: 'Flame', component: Flame, category: '娱乐休闲' },
  { name: 'Target', component: Target, category: '娱乐休闲' },
  { name: 'CheckCircle2', component: CheckCircle2, category: '娱乐休闲' },
  { name: 'Bell', component: Bell, category: '娱乐休闲' },
  { name: 'Clock', component: Clock, category: '娱乐休闲' },
  { name: 'Timer', component: Timer, category: '娱乐休闲' },
  { name: 'Calendar', component: Calendar, category: '娱乐休闲' },
  { name: 'User', component: User, category: '娱乐休闲' },
  { name: 'Users', component: Users, category: '娱乐休闲' },
  { name: 'Settings', component: Settings, category: '娱乐休闲' },
  { name: 'Search', component: Search, category: '娱乐休闲' },
  
  // 健康医疗 (20个)
  { name: 'Activity', component: Activity, category: '健康医疗' },
  { name: 'Heart', component: Heart, category: '健康医疗' },
  { name: 'Droplet', component: Droplet, category: '健康医疗' },
  { name: 'Sun', component: Sun, category: '健康医疗' },
  { name: 'Moon', component: Moon, category: '健康医疗' },
  { name: 'Leaf', component: Leaf, category: '健康医疗' },
  { name: 'Flower2', component: Flower2, category: '健康医疗' },
  { name: 'TreePine', component: TreePine, category: '健康医疗' },
  { name: 'Mountain', component: Mountain, category: '健康医疗' },
  { name: 'Waves', component: Waves, category: '健康医疗' },
  { name: 'Bell', component: Bell, category: '健康医疗' },
  { name: 'Clock', component: Clock, category: '健康医疗' },
  { name: 'Timer', component: Timer, category: '健康医疗' },
  { name: 'Calendar', component: Calendar, category: '健康医疗' },
  { name: 'User', component: User, category: '健康医疗' },
  { name: 'Users', component: Users, category: '健康医疗' },
  { name: 'Settings', component: Settings, category: '健康医疗' },
  { name: 'Search', component: Search, category: '健康医疗' },
  { name: 'CheckCircle2', component: CheckCircle2, category: '健康医疗' },
  { name: 'Target', component: Target, category: '健康医疗' },
  
  // 交通出行 (20个)
  { name: 'Car', component: Car, category: '交通出行' },
  { name: 'Plane', component: Plane, category: '交通出行' },
  { name: 'Bike', component: Bike, category: '交通出行' },
  { name: 'Home', component: Home, category: '交通出行' },
  { name: 'Bell', component: Bell, category: '交通出行' },
  { name: 'Clock', component: Clock, category: '交通出行' },
  { name: 'Timer', component: Timer, category: '交通出行' },
  { name: 'Calendar', component: Calendar, category: '交通出行' },
  { name: 'User', component: User, category: '交通出行' },
  { name: 'Users', component: Users, category: '交通出行' },
  { name: 'Settings', component: Settings, category: '交通出行' },
  { name: 'Search', component: Search, category: '交通出行' },
  { name: 'Grid', component: Grid, category: '交通出行' },
  { name: 'List', component: List, category: '交通出行' },
  { name: 'Plus', component: Plus, category: '交通出行' },
  { name: 'Check', component: Check, category: '交通出行' },
  { name: 'X', component: X, category: '交通出行' },
  { name: 'Edit', component: Edit, category: '交通出行' },
  { name: 'Target', component: Target, category: '交通出行' },
  { name: 'Zap', component: Zap, category: '交通出行' },
  
  // 自然天气 (25个)
  { name: 'Sun', component: Sun, category: '自然天气' },
  { name: 'Moon', component: Moon, category: '自然天气' },
  { name: 'Cloud', component: Cloud, category: '自然天气' },
  { name: 'Droplet', component: Droplet, category: '自然天气' },
  { name: 'Leaf', component: Leaf, category: '自然天气' },
  { name: 'Flower2', component: Flower2, category: '自然天气' },
  { name: 'TreePine', component: TreePine, category: '自然天气' },
  { name: 'Mountain', component: Mountain, category: '自然天气' },
  { name: 'Waves', component: Waves, category: '自然天气' },
  { name: 'Fish', component: Fish, category: '自然天气' },
  { name: 'Bird', component: Bird, category: '自然天气' },
  { name: 'Dog', component: Dog, category: '自然天气' },
  { name: 'Cat', component: Cat, category: '自然天气' },
  { name: 'Baby', component: Baby, category: '自然天气' },
  { name: 'Sparkles', component: Sparkles, category: '自然天气' },
  { name: 'Star', component: Star, category: '自然天气' },
  { name: 'Heart', component: Heart, category: '自然天气' },
  { name: 'Bell', component: Bell, category: '自然天气' },
  { name: 'Clock', component: Clock, category: '自然天气' },
  { name: 'Timer', component: Timer, category: '自然天气' },
  { name: 'Calendar', component: Calendar, category: '自然天气' },
  { name: 'User', component: User, category: '自然天气' },
  { name: 'Users', component: Users, category: '自然天气' },
  { name: 'Settings', component: Settings, category: '自然天气' },
  { name: 'Search', component: Search, category: '自然天气' },
  
  // 食物饮品 (20个)
  { name: 'Coffee', component: Coffee, category: '食物饮品' },
  { name: 'ShoppingBag', component: ShoppingBag, category: '食物饮品' },
  { name: 'Droplet', component: Droplet, category: '食物饮品' },
  { name: 'Flame', component: Flame, category: '食物饮品' },
  { name: 'Heart', component: Heart, category: '食物饮品' },
  { name: 'Star', component: Star, category: '食物饮品' },
  { name: 'Sparkles', component: Sparkles, category: '食物饮品' },
  { name: 'Gift', component: Gift, category: '食物饮品' },
  { name: 'Bell', component: Bell, category: '食物饮品' },
  { name: 'Clock', component: Clock, category: '食物饮品' },
  { name: 'Timer', component: Timer, category: '食物饮品' },
  { name: 'Calendar', component: Calendar, category: '食物饮品' },
  { name: 'User', component: User, category: '食物饮品' },
  { name: 'Users', component: Users, category: '食物饮品' },
  { name: 'Settings', component: Settings, category: '食物饮品' },
  { name: 'Search', component: Search, category: '食物饮品' },
  { name: 'Grid', component: Grid, category: '食物饮品' },
  { name: 'List', component: List, category: '食物饮品' },
  { name: 'Plus', component: Plus, category: '食物饮品' },
  { name: 'Check', component: Check, category: '食物饮品' },
  
  // 科技数码 (25个)
  { name: 'Code', component: Code, category: '科技数码' },
  { name: 'Camera', component: Camera, category: '科技数码' },
  { name: 'Settings', component: Settings, category: '科技数码' },
  { name: 'Search', component: Search, category: '科技数码' },
  { name: 'Grid', component: Grid, category: '科技数码' },
  { name: 'List', component: List, category: '科技数码' },
  { name: 'Plus', component: Plus, category: '科技数码' },
  { name: 'Check', component: Check, category: '科技数码' },
  { name: 'X', component: X, category: '科技数码' },
  { name: 'Edit', component: Edit, category: '科技数码' },
  { name: 'Trash2', component: Trash2, category: '科技数码' },
  { name: 'Bell', component: Bell, category: '科技数码' },
  { name: 'Clock', component: Clock, category: '科技数码' },
  { name: 'Timer', component: Timer, category: '科技数码' },
  { name: 'Calendar', component: Calendar, category: '科技数码' },
  { name: 'User', component: User, category: '科技数码' },
  { name: 'Users', component: Users, category: '科技数码' },
  { name: 'Zap', component: Zap, category: '科技数码' },
  { name: 'Rocket', component: Rocket, category: '科技数码' },
  { name: 'Lightbulb', component: Lightbulb, category: '科技数码' },
  { name: 'Sparkles', component: Sparkles, category: '科技数码' },
  { name: 'Target', component: Target, category: '科技数码' },
  { name: 'CheckCircle2', component: CheckCircle2, category: '科技数码' },
  { name: 'Star', component: Star, category: '科技数码' },
  { name: 'Trophy', component: Trophy, category: '科技数码' },
  
  // 社交沟通 (20个)
  { name: 'User', component: User, category: '社交沟通' },
  { name: 'Users', component: Users, category: '社交沟通' },
  { name: 'Baby', component: Baby, category: '社交沟通' },
  { name: 'Heart', component: Heart, category: '社交沟通' },
  { name: 'Smile', component: Smile, category: '社交沟通' },
  { name: 'Bell', component: Bell, category: '社交沟通' },
  { name: 'Gift', component: Gift, category: '社交沟通' },
  { name: 'Sparkles', component: Sparkles, category: '社交沟通' },
  { name: 'Star', component: Star, category: '社交沟通' },
  { name: 'Trophy', component: Trophy, category: '社交沟通' },
  { name: 'CheckCircle2', component: CheckCircle2, category: '社交沟通' },
  { name: 'Target', component: Target, category: '社交沟通' },
  { name: 'Zap', component: Zap, category: '社交沟通' },
  { name: 'Rocket', component: Rocket, category: '社交沟通' },
  { name: 'Lightbulb', component: Lightbulb, category: '社交沟通' },
  { name: 'Clock', component: Clock, category: '社交沟通' },
  { name: 'Timer', component: Timer, category: '社交沟通' },
  { name: 'Calendar', component: Calendar, category: '社交沟通' },
  { name: 'Settings', component: Settings, category: '社交沟通' },
  { name: 'Search', component: Search, category: '社交沟通' },
  
  // 艺术创意 (20个)
  { name: 'Palette', component: Palette, category: '艺术创意' },
  { name: 'PenTool', component: PenTool, category: '艺术创意' },
  { name: 'Camera', component: Camera, category: '艺术创意' },
  { name: 'Music', component: Music, category: '艺术创意' },
  { name: 'Film', component: Film, category: '艺术创意' },
  { name: 'Sparkles', component: Sparkles, category: '艺术创意' },
  { name: 'Star', component: Star, category: '艺术创意' },
  { name: 'Heart', component: Heart, category: '艺术创意' },
  { name: 'Lightbulb', component: Lightbulb, category: '艺术创意' },
  { name: 'Rocket', component: Rocket, category: '艺术创意' },
  { name: 'Gift', component: Gift, category: '艺术创意' },
  { name: 'Trophy', component: Trophy, category: '艺术创意' },
  { name: 'Zap', component: Zap, category: '艺术创意' },
  { name: 'Flame', component: Flame, category: '艺术创意' },
  { name: 'Target', component: Target, category: '艺术创意' },
  { name: 'CheckCircle2', component: CheckCircle2, category: '艺术创意' },
  { name: 'Bell', component: Bell, category: '艺术创意' },
  { name: 'Clock', component: Clock, category: '艺术创意' },
  { name: 'Timer', component: Timer, category: '艺术创意' },
  { name: 'Calendar', component: Calendar, category: '艺术创意' },
  
  // 其他 (25个)
  { name: 'Settings', component: Settings, category: '其他' },
  { name: 'Search', component: Search, category: '其他' },
  { name: 'Grid', component: Grid, category: '其他' },
  { name: 'List', component: List, category: '其他' },
  { name: 'Plus', component: Plus, category: '其他' },
  { name: 'Check', component: Check, category: '其他' },
  { name: 'X', component: X, category: '其他' },
  { name: 'Edit', component: Edit, category: '其他' },
  { name: 'Trash2', component: Trash2, category: '其他' },
  { name: 'ChevronLeft', component: ChevronLeft, category: '其他' },
  { name: 'ChevronRight', component: ChevronRight, category: '其他' },
  { name: 'Bell', component: Bell, category: '其他' },
  { name: 'Clock', component: Clock, category: '其他' },
  { name: 'Timer', component: Timer, category: '其他' },
  { name: 'Calendar', component: Calendar, category: '其他' },
  { name: 'User', component: User, category: '其他' },
  { name: 'Users', component: Users, category: '其他' },
  { name: 'Target', component: Target, category: '其他' },
  { name: 'CheckCircle2', component: CheckCircle2, category: '其他' },
  { name: 'Star', component: Star, category: '其他' },
  { name: 'Trophy', component: Trophy, category: '其他' },
  { name: 'Zap', component: Zap, category: '其他' },
  { name: 'Rocket', component: Rocket, category: '其他' },
  { name: 'Lightbulb', component: Lightbulb, category: '其他' },
  { name: 'Sparkles', component: Sparkles, category: '其他' },
];

// 颜色映射 - 将颜色名称映射到完整的Tailwind类名
const getColorClass = (color?: string | null): string => {
  if (!color) return 'bg-blue-500';
  
  // 如果已经是完整的类名格式（如 "blue-500"），加上 bg- 前缀
  if (color.includes('-')) {
    // 检查是否已经有 bg- 前缀
    if (color.startsWith('bg-')) {
      return color;
    }
    return `bg-${color}`;
  }
  
  // 如果是简单的颜色名称（如 "blue"），映射到完整的类名
  const colorMap: Record<string, string> = {
    'blue': 'bg-blue-500',
    'green': 'bg-green-500',
    'purple': 'bg-purple-500',
    'orange': 'bg-orange-500',
    'red': 'bg-red-500',
    'pink': 'bg-pink-500',
    'cyan': 'bg-cyan-500',
    'teal': 'bg-teal-500',
  };
  return colorMap[color] || 'bg-blue-500';
};

// 图标映射
const getIcon = (iconName: string) => {
  const iconMap = AVAILABLE_ICONS.reduce((acc, icon) => {
    acc[icon.name] = icon.component;
    return acc;
  }, {} as Record<string, React.ComponentType<any>>);
  
  const IconComp = iconMap[iconName] || Activity;
  return <IconComp className="w-5 h-5 text-white" />;
};

// 默认习惯图标和颜色
const DEFAULT_COLORS = [
  'bg-blue-500',
  'bg-orange-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-indigo-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-teal-500',
];

export const HabitCheckIn: React.FC<HabitCheckInProps> = ({ 
  onBack, 
  habits: propsHabits, 
  habitsWithStats: propsHabitsWithStats, 
  isLoading: propsIsLoading,
  onReload 
}) => {
  // 格式化日期为 YYYY-MM-DD（使用本地时区）
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 规范化日期字符串（处理时区问题）
  const normalizeDate = (dateValue: string | Date): string => {
    if (typeof dateValue === 'string') {
      if (dateValue.includes('T')) {
        // ISO 格式：使用本地时区解析
        const date = new Date(dateValue);
        return formatLocalDate(date);
      } else {
        // 已经是 YYYY-MM-DD 格式
        return dateValue;
      }
    } else {
      // 如果是 Date 对象
      return formatLocalDate(dateValue);
    }
  };

  const [habits, setHabits] = useState<Habit[]>(propsHabits || []);
  const [habitsWithStats, setHabitsWithStats] = useState<HabitWithStats[]>(propsHabitsWithStats || []);
  const [isLoading, setIsLoading] = useState(propsIsLoading ?? false);
  const [viewMode, setViewMode] = useState<'week' | 'calendar'>('week');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [newHabit, setNewHabit] = useState({
    name: "",
    description: "",
    iconName: "Activity",
    color: "blue",
    goalType: HabitGoalType.CHECK_IN,
    goalAmount: 1,
    goalUnit: "次",
    startDate: formatLocalDate(new Date()),
    durationType: HabitDurationType.FOREVER,
    customDuration: 30,
    targetDays: 7,
    reminderTime: "",
  });
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconSearchQuery, setIconSearchQuery] = useState("");
  const [selectedIconCategory, setSelectedIconCategory] = useState<string>('全部');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(formatLocalDate(new Date()));
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; habitId: string; dateStr: string } | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const iconPickerRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // 颜色选项
  const colorOptions = [
    { value: 'blue', label: '蓝色', class: 'bg-blue-500' },
    { value: 'green', label: '绿色', class: 'bg-green-500' },
    { value: 'purple', label: '紫色', class: 'bg-purple-500' },
    { value: 'orange', label: '橙色', class: 'bg-orange-500' },
    { value: 'red', label: '红色', class: 'bg-red-500' },
    { value: 'pink', label: '粉色', class: 'bg-pink-500' },
    { value: 'cyan', label: '青色', class: 'bg-cyan-500' },
    { value: 'teal', label: '青绿色', class: 'bg-teal-500' },
  ];

  // 点击外部关闭图标选择器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (iconPickerRef.current && !iconPickerRef.current.contains(event.target as Node)) {
        setShowIconPicker(false);
        setIconSearchQuery("");
      }
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    if (showIconPicker || showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showIconPicker, showColorPicker]);

  // 当props变化时更新本地状态
  useEffect(() => {
    if (propsHabits !== undefined) {
      setHabits(propsHabits);
    }
  }, [propsHabits]);

  useEffect(() => {
    if (propsHabitsWithStats !== undefined) {
      // 确保数据是最新的
      setHabitsWithStats(propsHabitsWithStats);
    }
  }, [propsHabitsWithStats]);

  useEffect(() => {
    if (propsIsLoading !== undefined) {
      setIsLoading(propsIsLoading);
    }
  }, [propsIsLoading]);

  // 点击外部关闭右键菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenu) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [contextMenu]);

  // 如果没有传入props，则自己加载（向后兼容）
  const loadHabits = async () => {
    if (onReload) {
      await onReload();
    } else {
      try {
        setIsLoading(true);
        const data = await habitApi.listMyHabits();
        const activeHabits = data.filter(h => h.isActive);
        setHabits(activeHabits);
        
        const statsPromises = activeHabits.map(async (habit) => {
          try {
            return await habitApi.getHabitWithStats(habit.id);
          } catch (error) {
            console.error(`加载习惯 ${habit.id} 统计数据失败:`, error);
            return null;
          }
        });
        
        const statsResults = await Promise.all(statsPromises);
        setHabitsWithStats(statsResults.filter((s): s is HabitWithStats => s !== null));
      } catch (error) {
        console.error('加载习惯失败:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 获取本周日期 (周一到周日)
  const getWeekDates = () => {
    const curr = new Date();
    const dayOfWeek = curr.getDay() === 0 ? 6 : curr.getDay() - 1; 
    const monday = new Date(curr);
    monday.setDate(curr.getDate() - dayOfWeek);
    monday.setHours(0, 0, 0, 0);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      week.push(formatLocalDate(day));
    }
    return week;
  };

  const weekDates = getWeekDates();
  const weekDaysLabel = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  // 打卡逻辑 - 乐观更新（无感打卡）
  const toggleHabit = async (habitId: string, dateStr: string) => {
    const habit = habitsWithStats.find(h => h.id === habitId);
    if (!habit) return;

    const status = getCheckInStatus(habit, dateStr);
    const isQuantityType = habit.goalType === HabitGoalType.QUANTITY;
    
    // 保存原始状态用于回滚
    const originalHabitsWithStats = JSON.parse(JSON.stringify(habitsWithStats));

    // 立即更新本地状态（乐观更新）
    const updatedHabitsWithStats = habitsWithStats.map(h => {
      if (h.id === habitId) {
        const checkInDate = dateStr;
        const existingCheckInIndex = h.recentCheckIns.findIndex(
          ci => {
            const ciDate = normalizeDate(ci.date);
            return ciDate === checkInDate;
          }
        );

        let updatedCheckIns = [...h.recentCheckIns];
        
        if (isQuantityType) {
          // QUANTITY 类型：如果已完成，点击则删除记录（重置为 0/n）
          if (status === 'completed') {
            // 已达到目标，点击删除记录
            if (existingCheckInIndex >= 0) {
              updatedCheckIns.splice(existingCheckInIndex, 1);
            }
          } else if (existingCheckInIndex >= 0) {
            // 已存在记录但未达到目标，累加 quantity
            const existingCheckIn = updatedCheckIns[existingCheckInIndex];
            const currentQuantity = existingCheckIn.quantity || 1;
            const goalAmount = habit.goalAmount || 0;
            const newQuantity = goalAmount > 0 ? Math.min(currentQuantity + 1, goalAmount) : currentQuantity + 1;
            updatedCheckIns[existingCheckInIndex] = {
              ...existingCheckIn,
              quantity: newQuantity,
              completed: true,
            };
          } else {
            // 新记录，quantity 初始化为 1
            updatedCheckIns.push({
              id: 'temp-' + Date.now(),
              habitId: habitId,
              date: checkInDate,
              completed: true,
              quantity: 1,
            });
          }
        } else {
          // CHECK_IN 类型：原有的逻辑
          if (status === 'none') {
            // 未打卡：标记为已完成
            updatedCheckIns.push({
              id: 'temp-' + Date.now(),
              habitId: habitId,
              date: checkInDate,
              completed: true,
            });
          } else {
            // 已完成或未完成：删除记录（恢复空白）
            if (existingCheckInIndex >= 0) {
              updatedCheckIns.splice(existingCheckInIndex, 1);
            }
          }
        }

        return {
          ...h,
          recentCheckIns: updatedCheckIns,
        };
      }
      return h;
    });
    setHabitsWithStats(updatedHabitsWithStats);

    // 后台静默请求
    try {
      if (isQuantityType) {
        // QUANTITY 类型
        if (status === 'completed') {
          // 已完成状态，点击删除记录
          const existingCheckIn = habit.recentCheckIns.find(
            ci => {
              const ciDate = normalizeDate(ci.date);
              return ciDate === dateStr;
            }
          );
          if (existingCheckIn && existingCheckIn.id) {
            const checkInId = existingCheckIn.id;
            // 如果是临时ID（temp-开头），说明是刚创建的，还没有保存到后端，不需要调用删除API
            if (String(checkInId).startsWith('temp-')) {
              // 临时记录，直接删除本地状态即可，不需要调用API
              console.log('跳过临时记录的删除API调用');
            } else {
              // 确保传递数字类型给后端
              const numericId = typeof checkInId === 'string' ? parseInt(checkInId, 10) : checkInId;
              if (isNaN(numericId as number)) {
                console.error('无效的打卡记录ID:', checkInId);
                throw new Error('无效的打卡记录ID');
              }
              await habitApi.deleteCheckIn(numericId);
            }
          }
        } else {
          // 未完成状态，累加 quantity
          const goalAmount = habit.goalAmount || 0;
          const existingCheckIn = habit.recentCheckIns.find(
            ci => {
              const ciDate = normalizeDate(ci.date);
              return ciDate === dateStr;
            }
          );
          const currentQuantity = existingCheckIn?.quantity || 0;
          const newQuantity = goalAmount > 0 ? Math.min(currentQuantity + 1, goalAmount) : currentQuantity + 1;
          await habitApi.checkIn({
            habitId,
            date: dateStr,
            completed: true,
            quantity: newQuantity,
          });
        }
      } else {
        // CHECK_IN 类型：原有的逻辑
        if (status === 'none') {
          // 创建已完成记录
          await habitApi.checkIn({
            habitId,
            date: dateStr,
            completed: true,
          });
        } else {
          // 删除记录：需要找到对应的checkIn ID
          const existingCheckIn = habit.recentCheckIns.find(
            ci => {
              const ciDate = normalizeDate(ci.date);
              return ciDate === dateStr;
            }
          );
          if (existingCheckIn && existingCheckIn.id) {
            const checkInId = existingCheckIn.id;
            // 如果是临时ID（temp-开头），说明是刚创建的，还没有保存到后端，不需要调用删除API
            if (String(checkInId).startsWith('temp-')) {
              // 临时记录，直接删除本地状态即可，不需要调用API
              console.log('跳过临时记录的删除API调用');
            } else {
              // 确保传递数字类型给后端
              const numericId = typeof checkInId === 'string' ? parseInt(checkInId, 10) : checkInId;
              if (isNaN(numericId as number)) {
                console.error('无效的打卡记录ID:', checkInId);
                throw new Error('无效的打卡记录ID');
              }
              await habitApi.deleteCheckIn(numericId);
            }
          }
        }
      }
      // 成功：什么都不用做，界面已经是正确的了
    } catch (error: any) {
      console.error('操作失败:', error);
      // 失败：回滚界面状态
      setHabitsWithStats(originalHabitsWithStats);
      // 显示错误提示
      const errorMessage = error?.message || '操作失败，请重试';
      setToast({ message: errorMessage, type: 'error' });
      // 3秒后自动关闭提示
      setTimeout(() => setToast(null), 3000);
    }
  };

  // 标记为未完成
  const markAsFailed = async (habitId: string, dateStr: string) => {
    const habit = habitsWithStats.find(h => h.id === habitId);
    if (!habit) return;

    // 保存原始状态用于回滚
    const originalHabitsWithStats = JSON.parse(JSON.stringify(habitsWithStats));

    // 立即更新本地状态（乐观更新）
    const updatedHabitsWithStats = habitsWithStats.map(h => {
      if (h.id === habitId) {
        const checkInDate = dateStr;
        const existingCheckInIndex = h.recentCheckIns.findIndex(
          ci => {
            const ciDate = normalizeDate(ci.date);
            return ciDate === checkInDate;
          }
        );

        let updatedCheckIns = [...h.recentCheckIns];
        
        if (existingCheckInIndex >= 0) {
          // 如果已存在，更新为未完成
          updatedCheckIns[existingCheckInIndex] = {
            ...updatedCheckIns[existingCheckInIndex],
            completed: false,
          };
        } else {
          // 如果不存在，添加未完成记录
          updatedCheckIns.push({
            id: 'temp-' + Date.now(),
            habitId: habitId,
            date: checkInDate,
            completed: false,
          });
        }

        return {
          ...h,
          recentCheckIns: updatedCheckIns,
        };
      }
      return h;
    });
    setHabitsWithStats(updatedHabitsWithStats);

    // 后台静默请求
    try {
      await habitApi.checkIn({
        habitId,
        date: dateStr,
        completed: false,
      });
      // 成功：什么都不用做，界面已经是正确的了
      setContextMenu(null); // 关闭右键菜单
    } catch (error) {
      console.error('标记失败:', error);
      // 失败：回滚界面状态
      setHabitsWithStats(originalHabitsWithStats);
      // 显示错误提示
      setToast({ message: '操作失败，请重试', type: 'error' });
      // 3秒后自动关闭提示
      setTimeout(() => setToast(null), 3000);
    }
  };

  // 检查某天是否已打卡（已完成）
  const isCheckedIn = (habit: HabitWithStats, dateStr: string): boolean => {
    return habit.recentCheckIns.some(
      checkIn => {
        const checkInDate = normalizeDate(checkIn.date);
        // 确保正确处理 completed 字段（可能是布尔值或数字）
        const isCompleted = checkIn.completed === true || checkIn.completed === 1;
        return checkInDate === dateStr && isCompleted;
      }
    );
  };

  // 检查某天是否标记为未完成
  const isMarkedFailed = (habit: HabitWithStats, dateStr: string): boolean => {
    return habit.recentCheckIns.some(
      checkIn => {
        const checkInDate = normalizeDate(checkIn.date);
        // 检查是否有 completed === false 或 completed === 0 的记录
        const isNotCompleted = checkIn.completed === false || checkIn.completed === 0;
        return checkInDate === dateStr && isNotCompleted;
      }
    );
  };

  // 获取打卡状态：'none' | 'completed' | 'failed'
  const getCheckInStatus = (habit: HabitWithStats, dateStr: string): 'none' | 'completed' | 'failed' => {
    // 对于 QUANTITY 类型，只有达到目标数量才算完成
    if (habit.goalType === HabitGoalType.QUANTITY && habit.goalAmount) {
      const quantity = getQuantityForDate(habit, dateStr);
      // 只有 quantity >= goalAmount 才算完成
      if (quantity >= habit.goalAmount) {
        return 'completed';
      }
      // 如果 quantity > 0 但 < goalAmount，返回 'none'（未完成，但已有进度）
      // 如果 quantity === 0，也返回 'none'
      return 'none';
    }
    // CHECK_IN 类型：使用原有逻辑
    if (isCheckedIn(habit, dateStr)) return 'completed';
    if (isMarkedFailed(habit, dateStr)) return 'failed';
    return 'none';
  };

  // 获取某天的打卡数量（用于 QUANTITY 类型习惯）
  const getQuantityForDate = (habit: HabitWithStats, dateStr: string): number => {
    const checkIn = habit.recentCheckIns.find(
      ci => {
        const ciDate = normalizeDate(ci.date);
        return ciDate === dateStr && (ci.completed === true || ci.completed === 1);
      }
    );
    return checkIn?.quantity || 0;
  };

  // 获取本周打卡天数
  const getWeekCheckInCount = (habit: HabitWithStats): number => {
    return weekDates.filter(dateStr => isCheckedIn(habit, dateStr)).length;
  };

  // 打开编辑模态框
  const openEditModal = (habit: HabitWithStats) => {
    // 从color中提取颜色名称（处理多种格式：bg-blue-500, blue-500, blue）
    let colorName = 'blue';
    if (habit.color) {
      // 去掉 bg- 前缀
      let color = habit.color.replace(/^bg-/, '');
      // 去掉 -500 后缀
      color = color.replace(/-500$/, '');
      // 检查是否是有效的颜色名称
      if (colorOptions.find(c => c.value === color)) {
        colorName = color;
      }
    }
    
    // 格式化开始日期为 YYYY-MM-DD 格式（HTML date input 需要的格式）
    // 重要：使用 UTC 方法提取日期部分，避免时区转换导致的日期偏移
    let formattedStartDate = formatLocalDate(new Date());
    if (habit.startDate) {
      // 如果已经是 YYYY-MM-DD 格式，直接使用（这是最理想的情况）
      if (habit.startDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        formattedStartDate = habit.startDate;
      } else if (habit.startDate.includes('T')) {
        // 如果是 ISO 格式（包含 T），直接提取日期部分
        // 这是最安全的方法，避免时区转换导致的日期偏移
        // 例如：2025-12-14T00:00:00Z 或 2025-12-14T16:00:00Z 都提取为 2025-12-14
        const datePart = habit.startDate.split('T')[0];
        // 验证提取的日期格式是否正确
        if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
          formattedStartDate = datePart;
        }
      } else if (habit.startDate.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
        // 如果是 YYYY/MM/DD 格式，转换为 YYYY-MM-DD
        formattedStartDate = habit.startDate.replace(/\//g, '-');
      } else {
        // 对于其他格式，尝试解析但使用 UTC 方法（避免时区问题）
        const date = new Date(habit.startDate);
        if (!isNaN(date.getTime())) {
          // 使用 UTC 方法获取日期部分
          const year = date.getUTCFullYear();
          const month = String(date.getUTCMonth() + 1).padStart(2, '0');
          const day = String(date.getUTCDate()).padStart(2, '0');
          formattedStartDate = `${year}-${month}-${day}`;
        }
      }
    }
    
    setEditingHabitId(habit.id);
    setNewHabit({
      name: habit.name || "",
      description: habit.description || "",
      iconName: habit.icon || "Activity",
      color: colorName,
      goalType: habit.goalType || HabitGoalType.CHECK_IN,
      goalAmount: habit.goalAmount || 1,
      goalUnit: habit.goalUnit || "次",
      startDate: formattedStartDate,
      durationType: habit.durationType || HabitDurationType.FOREVER,
      customDuration: habit.customDuration || 30,
      targetDays: habit.targetDays || 7,
      reminderTime: habit.reminderTime || "",
    });
    setShowAddModal(true);
  };

  // 添加或更新习惯
  const handleAddHabit = async () => {
    if (!newHabit.name) return;
    
    try {
      if (editingHabitId) {
        // 编辑模式
        const habit: Partial<Habit> & { id: string } = {
          id: editingHabitId,
          name: newHabit.name,
          description: newHabit.description || undefined,
          icon: newHabit.iconName,
          color: `${newHabit.color}-500`,
          targetDays: newHabit.targetDays || 7,
          reminderTime: newHabit.reminderTime || undefined,
          goalType: newHabit.goalType,
          goalAmount: newHabit.goalType === HabitGoalType.QUANTITY ? newHabit.goalAmount : undefined,
          goalUnit: newHabit.goalType === HabitGoalType.QUANTITY ? newHabit.goalUnit : undefined,
          startDate: newHabit.startDate,
          durationType: newHabit.durationType,
          customDuration: newHabit.durationType === HabitDurationType.CUSTOM ? newHabit.customDuration : undefined,
          isActive: true,
        };
        
        await habitApi.updateHabit(habit);
      } else {
        // 创建模式
        const habit: Omit<Habit, 'id' | 'createTime' | 'updateTime'> = {
          name: newHabit.name,
          description: newHabit.description || undefined,
          icon: newHabit.iconName,
          color: `${newHabit.color}-500`,
          targetDays: newHabit.targetDays || 7,
          reminderTime: newHabit.reminderTime || undefined,
          goalType: newHabit.goalType,
          goalAmount: newHabit.goalType === HabitGoalType.QUANTITY ? newHabit.goalAmount : undefined,
          goalUnit: newHabit.goalType === HabitGoalType.QUANTITY ? newHabit.goalUnit : undefined,
          startDate: newHabit.startDate,
          durationType: newHabit.durationType,
          customDuration: newHabit.durationType === HabitDurationType.CUSTOM ? newHabit.customDuration : undefined,
          isActive: true,
        };
        
        await habitApi.addHabit(habit);
      }
      
      await loadHabits();
      setShowAddModal(false);
      setEditingHabitId(null);
      setShowColorPicker(false);
      setNewHabit({
        name: "",
        description: "",
        iconName: "Activity",
        color: "blue",
        goalType: HabitGoalType.CHECK_IN,
        goalAmount: 1,
        goalUnit: "次",
        startDate: formatLocalDate(new Date()),
        durationType: HabitDurationType.FOREVER,
        customDuration: 30,
        targetDays: 7,
        reminderTime: "",
      });
      setShowIconPicker(false);
      setIconSearchQuery("");
    } catch (error) {
      console.error(editingHabitId ? '更新习惯失败:' : '创建习惯失败:', error);
    }
  };

  // 过滤图标：根据搜索关键词和分类
  const filteredIcons = AVAILABLE_ICONS.filter(icon => {
    const matchesSearch = icon.name.toLowerCase().includes(iconSearchQuery.toLowerCase());
    const matchesCategory = selectedIconCategory === '全部' || icon.category === selectedIconCategory;
    return matchesSearch && matchesCategory;
  });

  // 获取所有分类（去重）
  const iconCategories = ['全部', ...Array.from(new Set(AVAILABLE_ICONS.map(icon => icon.category).filter(Boolean)))];

  // 删除习惯
  const handleDeleteClick = (id: string) => {
    setHabitToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!habitToDelete) return;
    
    try {
      await habitApi.deleteHabit(habitToDelete);
      await loadHabits();
      setShowDeleteConfirm(false);
      setHabitToDelete(null);
    } catch (error) {
      console.error('删除习惯失败:', error);
      setToast({ message: '删除失败，请重试', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setHabitToDelete(null);
  };

  // 日历视图相关
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    return { daysInMonth, startOffset, year, month };
  };

  const renderCalendar = () => {
    const { daysInMonth, startOffset, year, month } = getDaysInMonth(currentDate);
    const blanks = Array(startOffset).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => setCurrentDate(new Date(year, month - 1))} 
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-gray-900 dark:text-slate-100">{year}年 {month + 1}月</span>
          <button 
            onClick={() => setCurrentDate(new Date(year, month + 1))} 
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-400 mb-2">
          {weekDaysLabel.map(d => <div key={d}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {blanks.map((_, i) => <div key={`blank-${i}`} />)}
          {days.map(day => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            // 过滤出在该日期应该显示的习惯（开始日期小于等于该日期）
            const activeHabitsForDate = habitsWithStats.filter((habit) => {
              // 如果习惯没有设置开始日期，则显示（向后兼容）
              if (!habit.startDate) {
                return true;
              }
              // 只显示开始日期小于等于该日期的习惯
              const startDate = normalizeDate(habit.startDate);
              const dateStrNormalized = normalizeDate(dateStr);
              return startDate <= dateStrNormalized;
            });
            const totalHabits = activeHabitsForDate.length;
            if (totalHabits === 0) {
              return (
                <div key={day} className="h-10 flex items-center justify-center text-sm text-gray-400">
                  {day}
                </div>
              );
            }

            const completedCount = activeHabitsForDate.filter(h => isCheckedIn(h, dateStr)).length;
            const opacity = completedCount / totalHabits;

            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === formatLocalDate(new Date());
            
            return (
              <div 
                key={day} 
                onClick={() => setSelectedDate(dateStr)}
                className={`h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all relative group cursor-pointer ${
                  isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
                }`}
                style={{ 
                  backgroundColor: isSelected 
                    ? 'rgba(37, 99, 235, 0.8)' 
                    : opacity > 0 
                    ? `rgba(37, 99, 235, ${Math.max(0.1, opacity)})` 
                    : 'transparent',
                  color: isSelected || opacity > 0.5 ? 'white' : '#374151'
                }}
                title={`完成 ${completedCount}/${totalHabits}`}
              >
                {day}
                {completedCount === totalHabits && completedCount > 0 && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-yellow-400 rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-100 rounded-sm"></div> 少
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div> 多
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center text-slate-500">加载中...</div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">习惯打卡</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">滴水穿石，贵在坚持</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode('week')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'week' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-gray-400'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'calendar' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-gray-400'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft size={20} className="text-slate-500 dark:text-slate-400" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {viewMode === 'calendar' ? (
            <>
              {renderCalendar()}
              {/* 日历视图下也显示选中日期的习惯列表 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 左侧：习惯列表 */}
                <div className="lg:col-span-2 space-y-4">
                  {/* 选中日期显示 */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 px-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>
                      {(() => {
                        const date = new Date(selectedDate + 'T00:00:00');
                        const month = date.getMonth() + 1;
                        const day = date.getDate();
                        return `${month}月${day}日`;
                      })()}
                    </span>
                  </div>

                  {/* 习惯列表 */}
                  {habitsWithStats
                    .filter((habit) => {
                      // 如果习惯没有设置开始日期，则显示（向后兼容）
                      if (!habit.startDate) {
                        return true;
                      }
                      // 只显示开始日期小于等于选中日期的习惯
                      const startDate = normalizeDate(habit.startDate);
                      const selectedDateNormalized = normalizeDate(selectedDate);
                      return startDate <= selectedDateNormalized;
                    })
                .map((habit) => {
                const checkInStatus = getCheckInStatus(habit, selectedDate);
                const isQuantityType = habit.goalType === HabitGoalType.QUANTITY;
                const currentQuantity = isQuantityType ? getQuantityForDate(habit, selectedDate) : 0;
                const goalAmount = habit.goalAmount || 0;
                
                return (
                  <div
                    key={habit.id}
                    onClick={() => setSelectedHabitId(habit.id)}
                    className={`bg-white dark:bg-slate-800 rounded-2xl p-4 border transition-all cursor-pointer ${
                      selectedHabitId === habit.id 
                        ? 'border-blue-500 dark:border-blue-400 shadow-md ring-2 ring-blue-200 dark:ring-blue-800' 
                        : 'border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${getColorClass(habit.color)}`}>
                        {getIcon(habit.icon || 'Activity')}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-slate-100 text-base">{habit.name}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          {isQuantityType && goalAmount > 0 ? (
                            <div className="flex items-center gap-2 text-xs">
                              <span className={`${currentQuantity >= goalAmount ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-600 dark:text-slate-400'}`}>
                                {currentQuantity}/{goalAmount}{habit.goalUnit || '次'}
                              </span>
                              <div className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden max-w-[100px]">
                                <div 
                                  className={`h-full transition-all ${currentQuantity >= goalAmount ? 'bg-green-500 dark:bg-green-400' : 'bg-blue-500 dark:bg-blue-400'}`}
                                  style={{ width: `${Math.min((currentQuantity / goalAmount) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400">
                                <Zap className="w-3 h-3" />
                                <span>{habit.currentStreak || 0}天</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-orange-500 dark:text-orange-400">
                                <Flame className="w-3 h-3" />
                                <span>{habit.longestStreak || 0}天</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            openEditModal(habit);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleDeleteClick(habit.id); 
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {isQuantityType ? (
                          (() => {
                            const isCompleted = checkInStatus === 'completed';
                            if (isCompleted) {
                              // 已完成：显示完成图标，可以点击取消
                              return (
                                <div 
                                  className="w-10 h-10 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center cursor-pointer hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleHabit(habit.id, selectedDate);
                                  }}
                                  title="点击取消打卡"
                                >
                                  <CheckCircle2 className="w-5 h-5 text-white" />
                                </div>
                              );
                            } else {
                              // 未完成：显示 +1次 按钮
                              return (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleHabit(habit.id, selectedDate);
                                  }}
                                  className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span>+1{habit.goalUnit || '次'}</span>
                                </button>
                              );
                            }
                          })()
                        ) : (
                          <div 
                            className="cursor-pointer relative"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleHabit(habit.id, selectedDate);
                            }}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setContextMenu({
                                x: e.clientX,
                                y: e.clientY,
                                habitId: habit.id,
                                dateStr: selectedDate,
                              });
                            }}
                          >
                            {checkInStatus === 'completed' ? (
                              <div className="w-10 h-10 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              </div>
                            ) : checkInStatus === 'failed' ? (
                              <div className="w-10 h-10 rounded-full border-2 border-red-300 dark:border-red-500 flex items-center justify-center bg-red-50 dark:bg-red-900/20">
                                <X className="w-5 h-5 text-red-500 dark:text-red-400" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-slate-600 flex items-center justify-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                                {/* 未打卡时保持空白 */}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
                </div>

                {/* 右侧：习惯详情面板 */}
                {selectedHabitId && (() => {
                  const selectedHabit = habitsWithStats.find(h => h.id === selectedHabitId);
                  if (!selectedHabit) return null;

                  // 计算月度统计数据
                  const now = new Date();
                  const currentMonth = now.getMonth();
                  const currentYear = now.getFullYear();
                  const monthStart = new Date(currentYear, currentMonth, 1);
                  const monthEnd = new Date(currentYear, currentMonth + 1, 0);
                  
                  const monthCheckIns = selectedHabit.recentCheckIns.filter(ci => {
                    const ciDate = new Date(ci.date);
                    return ciDate >= monthStart && ciDate <= monthEnd && ci.completed;
                  }).length;
                  
                  const totalCheckIns = selectedHabit.totalCheckIns || 0;
                  const monthlyCompletionRate = monthCheckIns > 0 
                    ? Math.round((monthCheckIns / monthEnd.getDate()) * 100) 
                    : 0;
                  const currentStreak = selectedHabit.currentStreak || 0;

                  // 渲染该习惯的月度日历
                  const renderHabitCalendar = () => {
                    const { daysInMonth, startOffset, year, month } = getDaysInMonth(currentDate);
                    const blanks = Array(startOffset).fill(null);
                    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

                    return (
                      <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {blanks.map((_, i) => <div key={`blank-${i}`} />)}
                        {days.map(day => {
                          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const checkIn = selectedHabit.recentCheckIns.find(ci => {
                            const ciDate = normalizeDate(ci.date);
                            return ciDate === normalizeDate(dateStr);
                          });
                          const isSelected = dateStr === selectedDate;
                          const isToday = dateStr === formatLocalDate(new Date());
                          
                          return (
                            <div
                              key={day}
                              onClick={() => setSelectedDate(dateStr)}
                              className={`h-8 rounded-lg flex items-center justify-center text-sm cursor-pointer transition-all ${
                                isSelected 
                                  ? 'bg-blue-500 text-white font-semibold' 
                                  : isToday
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                                  : checkIn?.completed
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                  : checkIn?.completed === false
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                  : 'text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700'
                              }`}
                            >
                              {day}
                            </div>
                          );
                        })}
                      </div>
                    );
                  };

                  return (
                    <div className="lg:col-span-1 space-y-4">
                      {/* 习惯信息卡片 */}
                      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm sticky top-6">
                        <div className="flex items-center gap-4 mb-6">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md ${getColorClass(selectedHabit.color)}`}>
                            {getIcon(selectedHabit.icon || 'Activity')}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-slate-100">{selectedHabit.name}</h3>
                            {selectedHabit.description && (
                              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{selectedHabit.description}</p>
                            )}
                          </div>
                        </div>

                        {/* 统计数据 */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                            <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 mb-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>月打卡</span>
                            </div>
                            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{monthCheckIns}天</div>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                            <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 mb-1">
                              <Zap className="w-3.5 h-3.5" />
                              <span>总打卡</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalCheckIns}天</div>
                          </div>
                          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                            <div className="flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 mb-1">
                              <Target className="w-3.5 h-3.5" />
                              <span>月完成率</span>
                            </div>
                            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{monthlyCompletionRate}%</div>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                            <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 mb-1">
                              <Flame className="w-3.5 h-3.5" />
                              <span>当前连续</span>
                            </div>
                            <div className="text-2xl font-bold text-red-700 dark:text-red-300">{currentStreak}天</div>
                          </div>
                        </div>

                        {/* 月度日历 */}
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-gray-900 dark:text-slate-100">
                              {currentYear}年 {currentMonth + 1}月
                            </h4>
                          </div>
                          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400 mb-2">
                            {['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d}>{d}</div>)}
                          </div>
                          {renderHabitCalendar()}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左侧：习惯列表 */}
              <div className="lg:col-span-2 space-y-4">
              {/* 日期选择器 */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm">
                <div className="grid grid-cols-7 gap-2">
                  {weekDates.map((dateStr, idx) => {
                    const date = new Date(dateStr + 'T00:00:00');
                    const dayNumber = date.getDate();
                    const isToday = dateStr === formatLocalDate(new Date());
                    const isSelected = dateStr === selectedDate;
                    // 过滤出在该日期应该显示的习惯（开始日期小于等于该日期）
                    const activeHabitsForDate = habitsWithStats.filter((habit) => {
                      // 如果习惯没有设置开始日期，则显示（向后兼容）
                      if (!habit.startDate) {
                        return true;
                      }
                      // 只显示开始日期小于等于该日期的习惯
                      const startDate = normalizeDate(habit.startDate);
                      const dateStrNormalized = normalizeDate(dateStr);
                      return startDate <= dateStrNormalized;
                    });
                    const totalHabits = activeHabitsForDate.length;
                    const completedCount = activeHabitsForDate.filter(h => isCheckedIn(h, dateStr)).length;
                    const allCompleted = completedCount === totalHabits && totalHabits > 0;
                    const hasProgress = completedCount > 0 && completedCount < totalHabits;
                    
                    return (
                      <div 
                        key={idx} 
                        className={`flex flex-col items-center gap-1.5 cursor-pointer transition-all rounded-lg p-2 ${
                          isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                        }`}
                        onClick={() => setSelectedDate(dateStr)}
                      >
                        <div className={`text-xs font-medium ${
                          isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400'
                        }`}>
                          {weekDaysLabel[idx]}
                        </div>
                        <div className={`text-sm font-semibold ${
                          isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-slate-300'
                        }`}>
                          {dayNumber}
                        </div>
                        <div className="relative w-8 h-8 flex items-center justify-center">
                          {allCompleted ? (
                            <div className="w-8 h-8 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                          ) : hasProgress ? (
                            <div className="w-8 h-8 rounded-full border-2 border-blue-500 dark:border-blue-400 relative overflow-hidden">
                              <div 
                                className="absolute bottom-0 left-0 right-0 bg-blue-500 dark:bg-blue-600 transition-all"
                                style={{ height: `${(completedCount / totalHabits) * 100}%` }}
                              />
                            </div>
                          ) : (
                            <div className={`w-8 h-8 rounded-full border-2 ${
                              isToday ? 'border-blue-400 dark:border-blue-500' : 'border-gray-200 dark:border-slate-600'
                            }`} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 选中日期显示 */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 px-2">
                <CalendarIcon className="w-4 h-4" />
                <span>
                  {(() => {
                    const date = new Date(selectedDate + 'T00:00:00');
                    const month = date.getMonth() + 1;
                    const day = date.getDate();
                    return `${month}月${day}日`;
                  })()}
                </span>
              </div>

              {/* 习惯列表 */}
              {habitsWithStats
                .filter((habit) => {
                  // 如果习惯没有设置开始日期，则显示（向后兼容）
                  if (!habit.startDate) {
                    return true;
                  }
                  // 只显示开始日期小于等于选中日期的习惯
                  const startDate = normalizeDate(habit.startDate);
                  const selectedDateNormalized = normalizeDate(selectedDate);
                  return startDate <= selectedDateNormalized;
                })
                .map((habit) => {
                const checkInStatus = getCheckInStatus(habit, selectedDate);
                
                return (
                  <div
                    key={habit.id}
                    onClick={() => setSelectedHabitId(habit.id)}
                    className={`bg-white dark:bg-slate-800 rounded-2xl p-4 border transition-all cursor-pointer ${
                      selectedHabitId === habit.id 
                        ? 'border-blue-500 dark:border-blue-400 shadow-md ring-2 ring-blue-200 dark:ring-blue-800' 
                        : 'border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${getColorClass(habit.color)}`}>
                        {getIcon(habit.icon || 'Activity')}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-slate-100 text-base">{habit.name}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          {(() => {
                            const isQuantityType = habit.goalType === HabitGoalType.QUANTITY;
                            const currentQuantity = isQuantityType ? getQuantityForDate(habit, selectedDate) : 0;
                            const goalAmount = habit.goalAmount || 0;
                            
                            if (isQuantityType && goalAmount > 0) {
                              return (
                                <div className="flex items-center gap-2 text-xs">
                                  <span className={`${currentQuantity >= goalAmount ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-600 dark:text-slate-400'}`}>
                                    {currentQuantity}/{goalAmount}{habit.goalUnit || '次'}
                                  </span>
                                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden max-w-[100px]">
                                    <div 
                                      className={`h-full transition-all ${currentQuantity >= goalAmount ? 'bg-green-500 dark:bg-green-400' : 'bg-blue-500 dark:bg-blue-400'}`}
                                      style={{ width: `${Math.min((currentQuantity / goalAmount) * 100, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            } else {
                              return (
                                <>
                                  <div className="flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400">
                                    <Zap className="w-3 h-3" />
                                    <span>{habit.currentStreak || 0}天</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-orange-500 dark:text-orange-400">
                                    <Flame className="w-3 h-3" />
                                    <span>{habit.longestStreak || 0}天</span>
                                  </div>
                                </>
                              );
                            }
                          })()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            openEditModal(habit);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleDeleteClick(habit.id); 
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {(() => {
                          const isQuantityType = habit.goalType === HabitGoalType.QUANTITY;
                          const currentQuantity = isQuantityType ? getQuantityForDate(habit, selectedDate) : 0;
                          const goalAmount = habit.goalAmount || 0;
                          
                          if (isQuantityType) {
                            const isCompleted = checkInStatus === 'completed';
                            if (isCompleted) {
                              // 已完成：显示完成图标，可以点击取消
                              return (
                                <div 
                                  className="w-10 h-10 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center cursor-pointer hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleHabit(habit.id, selectedDate);
                                  }}
                                  title="点击取消打卡"
                                >
                                  <CheckCircle2 className="w-5 h-5 text-white" />
                                </div>
                              );
                            } else {
                              // 未完成：显示 +1次 按钮
                              return (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleHabit(habit.id, selectedDate);
                                  }}
                                  className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span>+1{habit.goalUnit || '次'}</span>
                                </button>
                              );
                            }
                          } else {
                            return (
                              <div 
                                className="cursor-pointer relative"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleHabit(habit.id, selectedDate);
                                }}
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setContextMenu({
                                    x: e.clientX,
                                    y: e.clientY,
                                    habitId: habit.id,
                                    dateStr: selectedDate,
                                  });
                                }}
                              >
                                {checkInStatus === 'completed' ? (
                                  <div className="w-10 h-10 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                  </div>
                                ) : checkInStatus === 'failed' ? (
                                  <div className="w-10 h-10 rounded-full border-2 border-red-300 dark:border-red-500 flex items-center justify-center bg-red-50 dark:bg-red-900/20">
                                    <X className="w-5 h-5 text-red-500 dark:text-red-400" />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-slate-600 flex items-center justify-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                                    {/* 未打卡时保持空白 */}
                                  </div>
                                )}
                              </div>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add Habit Button */}
              {!showAddModal && (
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-3xl text-gray-400 dark:text-slate-500 font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" /> 添加新习惯
                </button>
              )}
              </div>

              {/* 右侧：习惯详情面板 */}
              {selectedHabitId && (() => {
                const selectedHabit = habitsWithStats.find(h => h.id === selectedHabitId);
                if (!selectedHabit) return null;

                // 计算月度统计数据
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();
                const monthStart = new Date(currentYear, currentMonth, 1);
                const monthEnd = new Date(currentYear, currentMonth + 1, 0);
                
                const monthCheckIns = selectedHabit.recentCheckIns.filter(ci => {
                  const ciDate = new Date(ci.date);
                  return ciDate >= monthStart && ciDate <= monthEnd && ci.completed;
                }).length;
                
                const totalCheckIns = selectedHabit.totalCheckIns || 0;
                const monthlyCompletionRate = monthCheckIns > 0 
                  ? Math.round((monthCheckIns / monthEnd.getDate()) * 100) 
                  : 0;
                const currentStreak = selectedHabit.currentStreak || 0;

                // 渲染该习惯的月度日历
                const renderHabitCalendar = () => {
                  const { daysInMonth, startOffset, year, month } = getDaysInMonth(currentDate);
                  const blanks = Array(startOffset).fill(null);
                  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

                  return (
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      {blanks.map((_, i) => <div key={`blank-${i}`} />)}
                      {days.map(day => {
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const checkIn = selectedHabit.recentCheckIns.find(ci => {
                          const ciDate = normalizeDate(ci.date);
                          return ciDate === normalizeDate(dateStr);
                        });
                        const isSelected = dateStr === selectedDate;
                        const isToday = dateStr === formatLocalDate(new Date());
                        
                        return (
                          <div
                            key={day}
                            onClick={() => setSelectedDate(dateStr)}
                            className={`h-8 rounded-lg flex items-center justify-center text-sm cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-blue-500 text-white font-semibold' 
                                : isToday
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                                : checkIn?.completed
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                : checkIn?.completed === false
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                : 'text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  );
                };

                return (
                  <div className="lg:col-span-1 space-y-4">
                    {/* 习惯信息卡片 */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm sticky top-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md ${getColorClass(selectedHabit.color)}`}>
                          {getIcon(selectedHabit.icon || 'Activity')}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-slate-100">{selectedHabit.name}</h3>
                          {selectedHabit.description && (
                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{selectedHabit.description}</p>
                          )}
                        </div>
                      </div>

                      {/* 统计数据 */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                          <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 mb-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>月打卡</span>
                          </div>
                          <div className="text-2xl font-bold text-green-700 dark:text-green-300">{monthCheckIns}天</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                          <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 mb-1">
                            <Zap className="w-3.5 h-3.5" />
                            <span>总打卡</span>
                          </div>
                          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalCheckIns}天</div>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                          <div className="flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 mb-1">
                            <Target className="w-3.5 h-3.5" />
                            <span>月完成率</span>
                          </div>
                          <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{monthlyCompletionRate}%</div>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                          <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 mb-1">
                            <Flame className="w-3.5 h-3.5" />
                            <span>当前连续</span>
                          </div>
                          <div className="text-2xl font-bold text-red-700 dark:text-red-300">{currentStreak}天</div>
                        </div>
                      </div>

                      {/* 月度日历 */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold text-gray-900 dark:text-slate-100">
                            {currentYear}年 {currentMonth + 1}月
                          </h4>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400 mb-2">
                          {['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d}>{d}</div>)}
                        </div>
                        {renderHabitCalendar()}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* 弹窗 - 使用Portal渲染到body */}
      {showAddModal && (
            <div 
              className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowAddModal(false);
                  setEditingHabitId(null);
                  setShowIconPicker(false);
                  setShowColorPicker(false);
                  setIconSearchQuery("");
                  setSelectedIconCategory('全部');
                }
              }}
            >
              {/* 背景遮罩 */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              
              {/* 弹窗内容 */}
              <div className="relative w-full max-w-4xl max-h-[90vh] md:max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col transform translate-y-0 transition-transform duration-300 ease-out">
                {/* 标题栏 */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {editingHabitId ? '编辑习惯' : '创建新习惯'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingHabitId(null);
                      setShowIconPicker(false);
                      setShowColorPicker(false);
                      setIconSearchQuery("");
                      setSelectedIconCategory('全部');
                      setNewHabit({
                        name: "",
                        description: "",
                        iconName: "Activity",
                        color: "blue",
                        goalType: HabitGoalType.CHECK_IN,
                        goalAmount: 1,
                        goalUnit: "次",
                        startDate: formatLocalDate(new Date()),
                        durationType: HabitDurationType.FOREVER,
                        customDuration: 30,
                        targetDays: 7,
                        reminderTime: "",
                      });
                    }}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  </button>
                </div>

                {/* 可滚动内容区域 */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <div className="space-y-5">
                    {/* 第一行：习惯名称和描述 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2.5">
                          习惯名称 <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text"
                          placeholder="例如：每天阅读30分钟"
                          className="w-full bg-gray-50 dark:bg-slate-800 border-0 rounded-2xl px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                          value={newHabit.name}
                          onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2.5">
                          描述 <span className="text-slate-400 dark:text-slate-500 font-normal">（可选）</span>
                        </label>
                        <textarea
                          placeholder="添加一些描述..."
                          rows={1}
                          className="w-full bg-gray-50 dark:bg-slate-800 border-0 rounded-2xl px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none transition-all"
                          value={newHabit.description}
                          onChange={(e) => setNewHabit({...newHabit, description: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* 第二行：图标、颜色和目标天数 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* 图标选择 */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2.5">
                          图标
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowIconPicker(!showIconPicker)}
                            className="w-full flex items-center gap-3 bg-gray-50 dark:bg-slate-800 border-0 rounded-2xl px-4 py-3.5 text-[15px] hover:bg-gray-100 dark:hover:bg-slate-700 active:scale-[0.98] transition-all"
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${getColorClass(newHabit.color)}`}>
                              {getIcon(newHabit.iconName)}
                            </div>
                            <span className="text-slate-900 dark:text-slate-100 font-medium flex-1 text-left text-sm truncate">{newHabit.iconName}</span>
                            <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          </button>
                    
                        {showIconPicker && (
                          <div ref={iconPickerRef} className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-800 border-0 rounded-2xl shadow-2xl p-4 max-h-[500px] overflow-hidden flex flex-col">
                            {/* 搜索栏 */}
                            <div className="mb-3 flex-shrink-0">
                              <input
                                type="text"
                                placeholder="搜索图标..."
                                className="w-full bg-gray-50 dark:bg-slate-700 border-0 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                                value={iconSearchQuery}
                                onChange={(e) => {
                                  setIconSearchQuery(e.target.value);
                                  // 搜索时自动切换到"全部"分类
                                  if (e.target.value) {
                                    setSelectedIconCategory('全部');
                                  }
                                }}
                              />
                            </div>
                            
                            {/* 分类标签 */}
                            {!iconSearchQuery && (
                              <div className="mb-3 flex-shrink-0 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {iconCategories.map((category) => (
                                  <button
                                    key={category}
                                    type="button"
                                    onClick={() => setSelectedIconCategory(category)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                                      selectedIconCategory === category
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                                    }`}
                                  >
                                    {category}
                                  </button>
                                ))}
                              </div>
                            )}
                            
                            {/* 图标网格 */}
                            <div className="flex-1 overflow-y-auto">
                              <div className="grid grid-cols-6 gap-2">
                                {filteredIcons.map((icon) => {
                                  const IconComp = icon.component;
                                  return (
                                    <button
                                      key={icon.name}
                                      type="button"
                                      onClick={() => {
                                        setNewHabit({...newHabit, iconName: icon.name});
                                        setShowIconPicker(false);
                                        setIconSearchQuery("");
                                        setSelectedIconCategory('全部');
                                      }}
                                      className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all active:scale-95 ${
                                        newHabit.iconName === icon.name
                                          ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500'
                                          : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                                      }`}
                                    >
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getColorClass(newHabit.color)}`}>
                                        <IconComp className="w-4 h-4 text-white" />
                                      </div>
                                      <span className="text-[10px] text-slate-600 dark:text-slate-400 truncate w-full text-center">
                                        {icon.name}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                    )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2.5">
                          颜色主题
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="w-full flex items-center gap-3 bg-gray-50 dark:bg-slate-800 border-0 rounded-2xl px-4 py-3.5 text-[15px] hover:bg-gray-100 dark:hover:bg-slate-700 active:scale-[0.98] transition-all"
                          >
                            <div className={`w-6 h-6 rounded-lg ${getColorClass(newHabit.color)} shadow-sm`}></div>
                            <span className="text-slate-900 dark:text-slate-100 font-medium flex-1 text-left text-sm">
                              {colorOptions.find(c => c.value === newHabit.color)?.label || '蓝色'}
                            </span>
                            <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          </button>
                    
                          {showColorPicker && (
                            <div ref={colorPickerRef} className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-800 border-0 rounded-2xl shadow-2xl p-4">
                              <div className="grid grid-cols-4 gap-2">
                                {colorOptions.map((color) => (
                                  <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => {
                                      setNewHabit({...newHabit, color: color.value});
                                      setShowColorPicker(false);
                                    }}
                                    className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95 ${
                                      newHabit.color === color.value
                                        ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500'
                                        : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                                    }`}
                                  >
                                    <div className={`w-10 h-10 rounded-xl ${color.class} shadow-md`}></div>
                                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                                      {color.label}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2.5">
                          目标天数/周
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="7"
                          className="w-full bg-gray-50 dark:bg-slate-800 border-0 rounded-2xl px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-700 text-slate-900 dark:text-slate-100 transition-all"
                          value={newHabit.targetDays}
                          onChange={(e) => setNewHabit({...newHabit, targetDays: parseInt(e.target.value) || 7})}
                        />
                      </div>
                    </div>

                    {/* 目标类型 */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2.5">
                        目标类型
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setNewHabit({...newHabit, goalType: HabitGoalType.CHECK_IN})}
                          className={`p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
                            newHabit.goalType === HabitGoalType.CHECK_IN
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm'
                              : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">打卡类型</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">当天完成打卡即可</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewHabit({...newHabit, goalType: HabitGoalType.QUANTITY})}
                          className={`p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
                            newHabit.goalType === HabitGoalType.QUANTITY
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm'
                              : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">数量类型</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">需要完成一定量</div>
                        </button>
                      </div>
                    </div>

                    {/* 目标数量（当选择数量类型时显示） */}
                    {newHabit.goalType === HabitGoalType.QUANTITY && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2.5">
                            目标数量
                          </label>
                          <input
                            type="number"
                            min="1"
                            className="w-full bg-gray-50 dark:bg-slate-800 border-0 rounded-2xl px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-700 text-slate-900 dark:text-slate-100 transition-all"
                            value={newHabit.goalAmount}
                            onChange={(e) => setNewHabit({...newHabit, goalAmount: parseInt(e.target.value) || 1})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2.5">
                            单位
                          </label>
                          <input
                            type="text"
                            placeholder="次、分钟、页等"
                            className="w-full bg-gray-50 dark:bg-slate-800 border-0 rounded-2xl px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                            value={newHabit.goalUnit}
                            onChange={(e) => setNewHabit({...newHabit, goalUnit: e.target.value})}
                          />
                        </div>
                      </div>
                    )}

                    {/* 第三行：开始日期、坚持天数和提醒时间 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2.5">
                          开始日期
                        </label>
                        <input
                          type="date"
                          className="w-full bg-gray-50 dark:bg-slate-800 border-0 rounded-2xl px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-700 text-slate-900 dark:text-slate-100 transition-all"
                          value={newHabit.startDate}
                          onChange={(e) => setNewHabit({...newHabit, startDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2.5">
                          坚持天数
                        </label>
                        <select
                          className="w-full bg-gray-50 dark:bg-slate-800 border-0 rounded-2xl px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-700 text-slate-900 dark:text-slate-100 transition-all appearance-none"
                          value={newHabit.durationType}
                          onChange={(e) => setNewHabit({...newHabit, durationType: e.target.value as HabitDurationType})}
                        >
                          <option value={HabitDurationType.FOREVER}>永远</option>
                          <option value={HabitDurationType.ONE_MONTH}>一个月</option>
                          <option value={HabitDurationType.THREE_MONTHS}>三个月</option>
                          <option value={HabitDurationType.SIX_MONTHS}>六个月</option>
                          <option value={HabitDurationType.ONE_YEAR}>一年</option>
                          <option value={HabitDurationType.CUSTOM}>自定义</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2.5">
                          提醒时间 <span className="text-slate-400 dark:text-slate-500 font-normal">（可选）</span>
                        </label>
                        <input
                          type="time"
                          className="w-full bg-gray-50 dark:bg-slate-800 border-0 rounded-2xl px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-700 text-slate-900 dark:text-slate-100 transition-all"
                          value={newHabit.reminderTime}
                          onChange={(e) => setNewHabit({...newHabit, reminderTime: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* 自定义天数（当选择自定义时显示） */}
                    {newHabit.durationType === HabitDurationType.CUSTOM && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2.5">
                          自定义天数
                        </label>
                        <input
                          type="number"
                          min="1"
                          placeholder="输入天数"
                          className="w-full bg-gray-50 dark:bg-slate-800 border-0 rounded-2xl px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                          value={newHabit.customDuration}
                          onChange={(e) => setNewHabit({...newHabit, customDuration: parseInt(e.target.value) || 30})}
                        />
                      </div>
                    )}

                  </div>
                </div>

                {/* 底部操作按钮 */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setEditingHabitId(null);
                        setShowIconPicker(false);
                        setShowColorPicker(false);
                        setIconSearchQuery("");
                        setNewHabit({
                          name: "",
                          description: "",
                          iconName: "Activity",
                          color: "blue",
                          goalType: HabitGoalType.CHECK_IN,
                          goalAmount: 1,
                          goalUnit: "次",
                          startDate: formatLocalDate(new Date()),
                          durationType: HabitDurationType.FOREVER,
                          customDuration: 30,
                          targetDays: 7,
                          reminderTime: "",
                        });
                      }}
                      className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-semibold hover:bg-gray-200 dark:hover:bg-slate-700 active:scale-[0.98] transition-all"
                    >
                      取消
                    </button>
                    <button 
                      type="button"
                      onClick={handleAddHabit}
                      className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-600 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/30"
                    >
                      创建习惯
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
      
      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="删除习惯"
        message="确定删除这个习惯吗？历史记录也将被删除。"
        confirmText="删除"
        cancelText="取消"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* 右键菜单 */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div 
            className="fixed z-50 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 py-2 min-w-[120px]"
            style={{
              left: `${Math.min(contextMenu.x, window.innerWidth - 140)}px`,
              top: `${Math.min(contextMenu.y + 10, window.innerHeight - 60)}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                markAsFailed(contextMenu.habitId, contextMenu.dateStr);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>未完成</span>
            </button>
          </div>
        </>
      )}
      
      {/* Toast 提示 */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg transition-all duration-300 ${
          toast.type === 'error' 
            ? 'bg-red-500 text-white' 
            : 'bg-green-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'error' ? (
              <X className="w-5 h-5" />
            ) : (
              <Check className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
      </>
  );
};
