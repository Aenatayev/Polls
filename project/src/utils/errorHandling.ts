import { useLanguage } from '../contexts/LanguageContext';
import { DatabaseError } from '../types';

// Create a singleton instance for the language context
let languageContext: ReturnType<typeof useLanguage> | null = null;

export function setLanguageContext(context: ReturnType<typeof useLanguage>) {
  languageContext = context;
}

export function getTranslation(key: string, params?: Record<string, any>): string {
  if (!languageContext) {
    console.warn('Language context not set, returning key');
    return key;
  }

  let translation = languageContext.t(key);
  
  // Replace parameters if provided
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      translation = translation.replace(`{${key}}`, String(value));
    });
  }
  
  return translation;
}

export function handlePollError(error: Error | DatabaseError): string {
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('foreign key') || errorMessage.includes('not found')) {
    return getTranslation('error.poll.invalidReference');
  }
  
  if (errorMessage.includes('duplicate')) {
    return getTranslation('error.poll.duplicate');
  }
  
  if (errorMessage.includes('timeout') || errorMessage.includes('abort')) {
    return getTranslation('error.poll.timeout');
  }
  
  if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
    return getTranslation('error.auth.unauthorized');
  }
  
  if ('code' in error && error.code === '23505') {
    return getTranslation('error.poll.duplicate');
  }
  
  return `${getTranslation('error.poll.creation')}: ${error.message}`;
}

export function handleSurveyError(error: Error | DatabaseError): string {
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('foreign key') || errorMessage.includes('not found')) {
    return getTranslation('error.survey.invalidReference');
  }
  
  if (errorMessage.includes('duplicate')) {
    return getTranslation('error.survey.duplicate');
  }
  
  if (errorMessage.includes('timeout') || errorMessage.includes('abort')) {
    return getTranslation('error.survey.timeout');
  }
  
  if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
    return getTranslation('error.auth.unauthorized');
  }

  if ('code' in error && error.code === '23505') {
    return getTranslation('error.survey.duplicate');
  }
  
  return `${getTranslation('error.survey.creation')}: ${error.message}`;
}