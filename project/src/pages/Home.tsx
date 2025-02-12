import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Users, Globe, Award, PlusSquare } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 via-accent-50 to-secondary-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">{t('home.title')}</span>
            <span className="block text-accent-600">{t('home.subtitle')}</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            {t('home.description')}
          </p>
          <div className="mt-5 max-w-md mx-auto flex justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                to="/create"
                className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-accent-600 hover:bg-accent-700 md:py-4 md:text-lg md:px-10"
              >
                <PlusSquare className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2" />
                {t('nav.createPoll')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="relative p-6 bg-white/90 rounded-lg border border-accent-200 hover:shadow-lg hover:shadow-accent-100/50 transition-shadow">
              <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center mb-4">
                <BarChart2 className="h-6 w-6 text-accent-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">{t('features.analytics')}</h3>
              <p className="mt-2 text-gray-500">
                {t('features.analyticsDesc')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="relative p-6 bg-white/90 rounded-lg border border-primary-200 hover:shadow-lg hover:shadow-primary-100/50 transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">{t('features.geolocation')}</h3>
              <p className="mt-2 text-gray-500">
                {t('features.geolocationDesc')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="relative p-6 bg-white/90 rounded-lg border border-secondary-200 hover:shadow-lg hover:shadow-secondary-100/50 transition-shadow">
              <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-secondary-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">{t('features.social')}</h3>
              <p className="mt-2 text-gray-500">
                {t('features.socialDesc')}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="relative p-6 bg-white/90 rounded-lg border border-accent-200 hover:shadow-lg hover:shadow-accent-100/50 transition-shadow">
              <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-accent-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">{t('features.rewards')}</h3>
              <p className="mt-2 text-gray-500">
                {t('features.rewardsDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}