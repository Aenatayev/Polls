import React, { useState, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home,
  Edit3,
  PlusSquare,
  BarChart2,
  Users,
  User,
  HelpCircle,
  FileText, 
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Sidebar = React.memo(() => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const navItems = useMemo(() => [
    { icon: Home, label: 'sidebar.dashboard', path: '/dashboard' },
    {
      icon: ClipboardList,
      label: 'sidebar.polls',
      path: '/polls',
      subItems: [
        { icon: PlusSquare, label: 'sidebar.createPoll', path: '/create' },
        { icon: ClipboardList, label: 'sidebar.myPolls', path: '/polls' }
      ],
    },
    {
      icon: FileText,
      label: 'sidebar.surveys',
      path: '/surveys',
      subItems: [
        { icon: PlusSquare, label: 'sidebar.createSurvey', path: '/create-survey' },
        { icon: ClipboardList, label: 'sidebar.mySurveys', path: '/surveys' }
      ],
    },
    { icon: BarChart2, label: 'sidebar.results', path: '/results' },
    { icon: Users, label: 'sidebar.users', path: '/users' },
    { icon: User, label: 'sidebar.account', path: '/account' },
    { icon: HelpCircle, label: 'sidebar.help', path: '/help' },
  ], []);

  const isActive = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  const toggleSubmenu = useCallback((label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  }, []);


  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsExpanded(true)}
        className={`fixed top-4 left-4 z-20 p-2 rounded-lg bg-gray-900 text-white md:hidden ${
          isExpanded ? 'hidden' : 'block'
        }`}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isExpanded ? 'w-64' : 'w-20'
        } fixed left-0 top-0 z-30 bg-gray-900 min-h-screen transition-all duration-200 ease-in-out`}
      >
        {/* Logo Section */}
        <div className="flex items-center h-16 px-4">
          <Link to="/" className="flex items-center">
            <BarChart2 className={`h-8 w-8 text-accent-400 transition-colors duration-200`} />
            <span className={`ml-2 text-xl font-bold text-white transition-opacity duration-200 ${
              isExpanded ? 'opacity-100' : 'opacity-0 hidden'
            }`}>
              {t('app.name')}
            </span>
          </Link>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-4 top-20 bg-gray-900 text-gray-400 hover:text-white p-2 rounded-full shadow-lg transition-colors"
        >
          {isExpanded ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* Navigation */}
        <nav className="px-4 mt-8">
          {navItems.map((item) => (
            <div key={item.label} className="mb-4">
              <button
                onClick={() => item.subItems ? toggleSubmenu(item.label) : null}
                className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-accent-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                } w-full`}
                title={!isExpanded ? t(item.label) : undefined}
              >
                <item.icon className="h-5 w-5 min-w-5" />
                {isExpanded && (
                  <span className="ml-3 flex-1 text-left">{t(item.label)}</span>
                )}
                {item.subItems && isExpanded && (
                  <ChevronRight className={`h-4 w-4 transition-transform ${
                    expandedMenus.includes(item.label) ? 'rotate-90' : ''
                  }`} />
                )}
              </button>
              {isExpanded && item.subItems && expandedMenus.includes(item.label) && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <div key={subItem.label}>
                      {subItem.path === '#' ? (
                        <button
                          onClick={() => toggleSubmenu(subItem.label)}
                          className="flex items-center w-full px-4 py-2 text-sm rounded-lg transition-colors text-gray-400 hover:text-white hover:bg-gray-800"
                        >
                          <subItem.icon className="h-4 w-4 mr-3" />
                          <span className="flex-1 text-left">{t(subItem.label)}</span>
                          <ChevronRight className={`h-4 w-4 transition-transform ${
                            expandedMenus.includes(subItem.label) ? 'rotate-90' : ''
                          }`} />
                        </button>
                      ) : (
                        <Link
                          to={subItem.path}
                          className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                            isActive(subItem.path)
                              ? 'bg-accent-600 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800'
                          }`}
                        >
                          <subItem.icon className="h-4 w-4 mr-3" />
                          {t(subItem.label)}
                        </Link>
                      )}
                      {subItem.subItems && expandedMenus.includes(subItem.label) && (
                        <div className="ml-4 mt-1 space-y-1">
                          {subItem.subItems.map((nestedItem) => (
                            <Link
                              key={nestedItem.label}
                              to={nestedItem.path}
                              className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                                isActive(nestedItem.path)
                                  ? 'bg-accent-600 text-white'
                                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                              }`}
                            >
                              <nestedItem.icon className="h-4 w-4 mr-3" />
                              {t(nestedItem.label)}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
});

Sidebar.displayName = 'Sidebar';
export default Sidebar;