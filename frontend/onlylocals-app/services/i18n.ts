import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  it: {
    translation: {
      profile_info: 'Informazioni profilo:',
      email: 'E-mail',
      birth_date: 'Data di nascita',
      edit_profile: 'Modifica profilo',
      first_name: 'Nome',
      last_name: 'Cognome',
      cancel: 'Annulla',
      save: 'Salva',
      success: 'Successo',
      profile_updated: 'Profilo aggiornato!',
      settings: 'Impostazioni',
      appearance: 'Dark/Light mode',
      language: 'Lingua',
      notifications: 'Notifiche',
    }
  },
  en: {
    translation: {
      profile_info: 'Profile information:',
      email: 'E-mail',
      birth_date: 'Date of birth',
      edit_profile: 'Edit profile',
      first_name: 'First name',
      last_name: 'Last name',
      cancel: 'Cancel',
      save: 'Save',
      success: 'Success',
      profile_updated: 'Profile updated!',
      settings: 'Settings',
      appearance: 'Dark/Light mode',
      language: 'Language',
      notifications: 'Notifications',
    }
  },
  fr: {
    translation: {
      profile_info: 'Informations du profil:',
      email: 'E-mail',
      birth_date: 'Date de naissance',
      edit_profile: 'Modifier le profil',
      first_name: 'Prénom',
      last_name: 'Nom',
      cancel: 'Annuler',
      save: 'Sauvegarder',
      success: 'Succès',
      profile_updated: 'Profil mis à jour!',
      settings: 'Paramètres',
      appearance: 'Dark/Light mode',
      language: 'Langue',
      notifications: 'Notifications',
    }
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'it',         // lingua di default
    fallbackLng: 'it',
    interpolation: { escapeValue: false },
  });

export default i18n;