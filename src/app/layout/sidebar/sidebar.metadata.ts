import { ROLES } from '@core/models/enums';

export interface RouteInfo {
  path: string;
  title: string;
  iconType: string;
  icon: string;
  class: string;
  groupTitle: boolean;
  badge: string;
  badgeClass: string;
  submenu: RouteInfo[];
  rolAuthority: ROLES[];
}

export const ROUTES: RouteInfo[] = [
  {
    path: '/dashboard/main',
    title: 'Inicio',
    iconType: 'material-icons-outlined',
    icon: 'home',
    class: '',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    submenu: [],
    rolAuthority: [ROLES.ADMIN, ROLES.USER]
  },
  {
    path: '',
    title: 'Gestión',
    iconType: '',
    icon: '',
    class: '',
    groupTitle: true,
    badge: '',
    badgeClass: '',
    submenu: [],
    rolAuthority: []
  },
  {
    path: '/page/projects',
    title: 'Gestión de proyectos',
    iconType: 'material-icons-outlined',
    icon: 'assessment',
    class: '',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    submenu: [],
    rolAuthority: [ROLES.ADMIN]
  },
  {
    path: '/page/users',
    title: 'Gestión de usuarios',
    iconType: 'material-icons-outlined',
    icon: 'person',
    class: '',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    submenu: [],
    rolAuthority: [ROLES.ADMIN]
  },
  {
    path: '',
    title: 'Mis cosas',
    iconType: '',
    icon: '',
    class: '',
    groupTitle: true,
    badge: '',
    badgeClass: '',
    submenu: [],
    rolAuthority: []
  },
  
  {
    path: '/page/super-admin',
    title: 'Super Admin',
    iconType: 'material-icons-outlined',
    icon: 'security',
    class: '',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    submenu: [],
    rolAuthority: [ROLES.ADMIN]
  }
];
