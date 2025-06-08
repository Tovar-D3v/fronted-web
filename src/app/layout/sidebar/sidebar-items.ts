import { ROLES } from '@core/models/enums';
import { RouteInfo } from './sidebar.metadata';

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
    icon: 'people',
    class: '',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    submenu: [],
    rolAuthority: [ROLES.ADMIN]
  },
  {
    path: '/page/projects',
    title: 'Mis proyectos',
    iconType: 'material-icons-outlined',
    icon: 'folder_open',
    class: '',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    submenu: [],
    rolAuthority: [ROLES.USER]
  },
  {
    path: '/page/super-admin',
    title: 'Super Admin',
    iconType: 'material-icons-outlined',
    icon: 'admin_panel_settings',
    class: '',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    submenu: [],
    rolAuthority: [ROLES.ADMIN]
  }
];
