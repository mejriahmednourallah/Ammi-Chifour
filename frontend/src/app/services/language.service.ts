import { Injectable, signal, computed, effect } from '@angular/core';

export type Language = 'fr' | 'ar';

export interface Translations {
  appName: string;
  appSubtitle: string;
  searchTab: string;
  boardTab: string;
  favoritesTab: string;
  staffTab: string;
  searchPlaceholder: string;
  nearMe: string;
  stationsNearMe: string;
  allDestinations: string;
  seats: string;
  seatSingular: string;
  seatsRemaining: string;
  boarding: string;
  available: string;
  full: string;
  departed: string;
  waitingQueue: string;
  fare: string;
  duration: string;
  distance: string;
  departureScheduled: string;
  updatedJustNow: string;
  updatedSecondsAgo: string;
  streamPaused: string;
  pullToRefresh: string;
  stationDetails: string;
  operatingHours: string;
  address: string;
  phone: string;
  officialTariff: string;
  close: string;
  // Staff view translations
  staffStationHeader: string;
  staffStationRole: string;
  activeBoardingLouage: string;
  addSeat: string;
  removeSeat: string;
  confirmDepart: string;
  confirmDepartPrompt: string;
  cancel: string;
  confirm: string;
  joinQueueTitle: string;
  enterMatricule: string;
  enterDriver: string;
  selectDestination: string;
  addVehicle: string;
  reorderHint: string;
  undo: string;
  actionUndone: string;
  seatUpdatedToast: string;
  offlineMode: string;
  offlineActionQueued: string;
  onlineReplayed: string;
}

const DICTIONARY: Record<Language, Translations> = {
  fr: {
    appName: 'Ami Chifour',
    appSubtitle: 'Louage Live Tunisie',
    searchTab: 'Destinations',
    boardTab: 'Tableau Gare',
    favoritesTab: 'Favoris',
    staffTab: 'Espace Chifour',
    searchPlaceholder: 'Rechercher ville, gare, gouvernorat...',
    nearMe: 'Autour de moi',
    stationsNearMe: 'Gares à proximité',
    allDestinations: 'Tous',
    seats: 'places',
    seatSingular: 'place',
    seatsRemaining: 'restantes',
    boarding: 'En embarquement',
    available: 'Places libres',
    full: 'Complet',
    departed: 'Parti',
    waitingQueue: 'File d\'attente',
    fare: 'Tarif officiel',
    duration: 'Durée est.',
    distance: 'Distance',
    departureScheduled: 'Départ estimé',
    updatedJustNow: 'À l\'instant',
    updatedSecondsAgo: 'Mis à jour il y a {s} s',
    streamPaused: 'Flux en pause (tirer pour actualiser)',
    pullToRefresh: 'Tirer pour actualiser',
    stationDetails: 'Tarifs & Gare',
    operatingHours: 'Horaires d\'exploitation',
    address: 'Adresse de la station',
    phone: 'Standard / Bureau',
    officialTariff: 'Grille tarifaire homologuée',
    close: 'Fermer',
    staffStationHeader: 'Gare Bab Alioua - Régulation',
    staffStationRole: 'Chef de quai / Ammi Chifour',
    activeBoardingLouage: 'Louage en tête (Embarquement)',
    addSeat: '+1 Passager',
    removeSeat: '-1 Passager',
    confirmDepart: 'Faire partir le louage',
    confirmDepartPrompt: 'Confirmer le départ immédiat de ce louage avec {count} passagers ?',
    cancel: 'Annuler',
    confirm: 'Confirmer le départ',
    joinQueueTitle: 'Enregistrer un nouveau louage',
    enterMatricule: 'Matricule (ex: 198 تونس 4521)',
    enterDriver: 'Nom du chauffeur',
    selectDestination: 'Choisir la destination',
    addVehicle: 'Ajouter à la file',
    reorderHint: 'Glisser pour réorganiser la priorité',
    undo: 'Annuler (Undo)',
    actionUndone: 'Dernière action annulée !',
    seatUpdatedToast: 'Passagers mis à jour ({count}/8)',
    offlineMode: 'Mode hors-ligne actif (synchronisation automatique)',
    offlineActionQueued: 'Action enregistrée hors-ligne',
    onlineReplayed: 'Actions locales synchronisées avec succès !'
  },
  ar: {
    appName: 'عمّي الشيفور',
    appSubtitle: 'لوّاج لايف تونس',
    searchTab: 'الوجهات',
    boardTab: 'لوحة المحطة',
    favoritesTab: 'المفضلة',
    staffTab: 'فضاء الشيفور',
    searchPlaceholder: 'ابحث عن مدينة، محطة، ولاية...',
    nearMe: 'المحطات القريبة',
    stationsNearMe: 'محطات حولك',
    allDestinations: 'الكل',
    seats: 'مقاعد',
    seatSingular: 'مقعد',
    seatsRemaining: 'متبقية',
    boarding: 'في طور الركوب',
    available: 'مقاعد شاغرة',
    full: 'مكتمل (معبّي)',
    departed: 'انطلق',
    waitingQueue: 'طابور الانتظار',
    fare: 'التعريفة الرسمية',
    duration: 'الوقت المقدر',
    distance: 'المسافة',
    departureScheduled: 'الانطلاق المتوقع',
    updatedJustNow: 'الآن',
    updatedSecondsAgo: 'تم التحديث منذ {s} ثانية',
    streamPaused: 'البث متوقف (اسحب للتحديث)',
    pullToRefresh: 'اسحب للأسفل للتحديث',
    stationDetails: 'التعريفة والمحطة',
    operatingHours: 'أوقات العمل',
    address: 'عنوان المحطة',
    phone: 'رقم الإدارة / المكتب',
    officialTariff: 'قائمة الأسعار الرسمية',
    close: 'إغلاق',
    staffStationHeader: 'محطة باب عليوة - التنظيم',
    staffStationRole: 'مسؤول الرصيف / عمّي الشيفور',
    activeBoardingLouage: 'اللوّاج المتصدر (ركوب المسافرين)',
    addSeat: '+1 راكب',
    removeSeat: '-1 راكب',
    confirmDepart: 'تأكيد الانطلاق',
    confirmDepartPrompt: 'هل تؤكد انطلاق هذا اللوّاج على الفور مع {count} ركاب؟',
    cancel: 'إلغاء',
    confirm: 'تأكيد الخروج',
    joinQueueTitle: 'تسجيل لوّاج جديد في الرصيف',
    enterMatricule: 'الترقيم المنجمي (مثال: 198 تونس 4521)',
    enterDriver: 'اسم الشيفور',
    selectDestination: 'اختر الوجهة',
    addVehicle: 'إدراج في الطابور',
    reorderHint: 'اسحب لتغيير أولوية الدور',
    undo: 'تراجع (Undo)',
    actionUndone: 'تم التراجع عن العملية السابقة!',
    seatUpdatedToast: 'تم تحديث عدد الركاب ({count}/8)',
    offlineMode: 'وضع عدم الاتصال (حفظ محلي فوري)',
    offlineActionQueued: 'تم حفظ التعديل محلياً',
    onlineReplayed: 'تمت مزامنة جميع العمليات بنجاح!'
  }
};

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  readonly currentLanguage = signal<Language>('fr');

  readonly t = computed(() => DICTIONARY[this.currentLanguage()]);
  readonly isRtl = computed(() => this.currentLanguage() === 'ar');

  constructor() {
    effect(() => {
      const lang = this.currentLanguage();
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      }
    });
  }

  setLanguage(lang: Language) {
    this.currentLanguage.set(lang);
  }

  toggle() {
    this.setLanguage(this.currentLanguage() === 'fr' ? 'ar' : 'fr');
  }
}
