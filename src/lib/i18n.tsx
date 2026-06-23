/**
 * i18n — TerraInfra360 multi-language support.
 *
 * Provides:
 *   • LanguageProvider — wraps the app and keeps the active locale in state.
 *   • useT()           — returns t(key) for translating UI strings + setLanguage().
 *   • LANGUAGES        — list shown in the picker (matches Flutter's AppLanguages).
 *
 * Mirrors the Flutter `AppLocaleController` behaviour:
 *   – Persists the choice in localStorage (`tf360_language`).
 *   – Re-renders every consumer the instant the language changes.
 *   – Falls back to English when a key is missing in the target language.
 *
 * Supported languages: English, हिन्दी, ಕನ್ನಡ, తెలుగు, தமிழ், മലയാളം, मराठी, ગુજરાતી.
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { setDocumentLanguage } from './domTranslator';

export type LangCode =
  | 'en' | 'hi' | 'kn' | 'te' | 'ta' | 'ml' | 'mr' | 'gu';

export interface LanguageDef {
  code: LangCode;
  label: string;      // e.g. "हिन्दी"
  english: string;    // e.g. "Hindi"
  letter: string;     // single-glyph badge letter for the picker
}

export const LANGUAGES: LanguageDef[] = [
  { code: 'en', label: 'English',  english: 'English',  letter: 'A' },
  { code: 'hi', label: 'हिन्दी',     english: 'Hindi',    letter: 'ह' },
  { code: 'kn', label: 'ಕನ್ನಡ',     english: 'Kannada',  letter: 'ಕ' },
  { code: 'te', label: 'తెలుగు',    english: 'Telugu',   letter: 'త' },
  { code: 'ta', label: 'தமிழ்',     english: 'Tamil',    letter: 'த' },
  { code: 'ml', label: 'മലയാളം',   english: 'Malayalam',letter: 'മ' },
  { code: 'mr', label: 'मराठी',     english: 'Marathi',  letter: 'म' },
  { code: 'gu', label: 'ગુજરાતી',   english: 'Gujarati', letter: 'ગ' },
];

// ─── Translation dictionary ──────────────────────────────────────────
// Only English is fully required — every other language overrides the
// keys it has translations for, and falls back to English elsewhere.
type Dict = Record<string, string>;

const en: Dict = {
  // ── Nav / global
  home: 'Home',
  services: 'Services',
  properties: 'Properties',
  shop: 'Shop',
  signUp: 'Sign Up',
  signIn: 'Sign In',
  downloadApp: 'Download App',
  postProperty: 'Post Property',

  // ── Profile sections
  myProfile: 'My Profile',
  memberSince: 'Member since',
  noContactNumber: 'No contact number',
  b2bPremiumMember: 'B2B PREMIUM MEMBER',

  // Quick tiles
  orders: 'Orders',
  wishlist: 'Wishlist',
  coupons: 'Coupons',
  helpCenter: 'Help Center',

  // B2B
  unlockBulkPricing: 'Unlock Premium Bulk Pricing',
  joinAsBusiness: 'Join as a verified business for bulk rates.',
  join: 'Join',

  // My Activity
  myActivity: 'My Activity',
  myPropertyListings: 'My Property Listings',
  myServiceRequests: 'My Service Requests',
  myQuoteRequests: 'My Quote Requests',

  // Languages card
  tryInLanguages: 'Try TI360 in your languages',
  currentlySetTo: 'Currently set to',
  choose: 'CHOOSE',
  tryInLanguage: 'Try TI360 in your language',
  continueBtn: 'Continue',

  // Account & Settings
  accountSettings: 'Account & Settings',
  editProfileDetails: 'Edit Profile Details',
  savedAddressLedger: 'Saved Address Ledger',
  manageDevices: 'Manage Devices',
  notificationSettings: 'Notification Settings',
  privacyCenter: 'Privacy Center',
  updateSecuredPassword: 'Update Secured Password',

  // Support
  supportCorporate: 'Support & Corporate Info',
  aboutTI: 'About TerraInfra360',
  termsConditions: 'Terms & Conditions',
  rateOurApp: 'Rate Our App (Playstore)',

  // Sign out
  signOut: 'Sign Out',
  signOutConfirm: 'Sign out of TerraInfra360?',

  // Edit profile sheet
  editProfile: 'Edit Profile',
  fullName: 'Full name',
  yourName: 'Your name',
  email: 'Email',
  mobileNumber: 'Mobile number',
  saveChanges: 'Save Changes',
  saving: 'Saving…',

  // Common stub copy for sub-sheets
  comingSoon: 'Coming Soon',
  thisSectionDescription:
    'This section is being prepared for you. Premium features land here in the next release.',
  close: 'Close',

  // Sub-sheet copies
  ordersDesc: 'Track every TerraInfra360 shop order — pending dispatches, in-transit packages and delivered milestones, all in one ledger.',
  wishlistDesc: 'Your shortlisted properties and saved shop items live here. Add anything to wishlist and revisit it anytime.',
  couponsDesc: 'Active coupons, festive offers and exclusive credits applied to your account will appear here.',
  helpDesc: 'Search FAQs, raise a support ticket or reach our concierge desk. Average response time is under 4 hours.',
  serviceRequestsDesc: 'Construction, interior and architect service requests you have raised. Track quotes, vendor responses and project milestones.',
  quoteRequestsDesc: 'Live quote requests sent to verified TerraInfra360 vendors. Compare bids and award the project to your chosen contractor.',
  addressesDesc: 'Add and verify your delivery + property addresses for faster checkout and instant property posting.',
  devicesDesc: 'Devices currently signed in to your account. Revoke any session you do not recognise.',
  notificationDesc: 'Choose what we ping you about — listing alerts, price drops, order updates and concierge messages.',
  privacyDesc: 'Control what TerraInfra360 shares with vendors, download your data and manage cookie preferences.',
  passwordDesc: 'Set a strong password for your account. Required for all admin and vendor portal access.',
  aboutDesc: 'TerraInfra360 — India\'s premier real estate, construction and material commerce ecosystem since 2024.',
  termsDesc: 'Read the latest user agreement, refund policy and listing guidelines that govern your TerraInfra360 account.',
  rateAppDesc: 'Enjoying TerraInfra360? Rate us 5 stars on Google Play Store — it really helps us reach more builders.',

  // Language toast
  languageChanged: 'App language set to',

  // ── Home page (FlutterHome) — visible labels
  buildYourLegacy: 'Build Your Legacy',
  premierEcosystem: "India's premier construction & real estate ecosystem",
  exploreServices: 'Explore Services',
  viewProperties: 'View Properties',
  ourServices: 'Our Services',
  premiumServices: 'Premium Services',
  shopMaterials: 'Shop Materials',
  postYourProperty: 'Post Your Property',
  flashSale: 'Flash Sale',
  recommended: 'Recommended For You',
  exploreByIntent: 'Explore By Intent',
  popularServices: 'Popular Services',
  customerReviews: 'Customer Reviews',
  aboutUs: 'About Us',
  contactUs: 'Contact Us',
  customerSupport: 'Customer Support',
  recentlyViewed: 'Recently Viewed',
  marketSentiment: 'Market Sentiment',
  quickUtilities: 'Quick Utilities',
  materialPrices: 'Material Price Index',
  shopByCategory: 'Shop By Category',
  trustedByThousands: 'Trusted by Thousands Across India',
  byTheNumbers: 'By The Numbers',
  projectsDelivered: 'Projects Delivered',
  verifiedVendors: 'Verified Vendors',
  industryAwards: 'Industry Awards',
  clientSatisfaction: 'Client Satisfaction',
  viewAll: 'View All',
  seeMore: 'See More',
  bookNow: 'Book Now',
  getQuote: 'Get Quote',
  sendMessage: 'Send Message',
  learnMore: 'Learn More',

  // ── Properties section
  searchProperties: 'Search Premium Properties',
  searchPlaceholder: 'Search by location, BHK, builder…',
  allProperties: 'All Properties',
  land: 'Land',
  residential: 'Residential',
  commercial: 'Commercial',
  filter: 'Filter',
  sort: 'Sort',
  view: 'View',
  featured: 'Featured',
  forSale: 'For Sale',
  forRent: 'For Rent',
  beds: 'Beds',
  baths: 'Baths',
  area: 'Area',
  parking: 'Parking',
  amenities: 'Amenities',
  noProperties: 'No properties found',
  tryAdjusting: 'Try adjusting your filters or search again.',
  myListings: 'My Listings',
  shortlist: 'Shortlist',
  notifications: 'Notifications',
  voiceSearch: 'Voice Search',

  // ── Services section
  servicesHero: 'Architectural Excellence & Construction Services',
  architectureDesign: 'Architecture & Design',
  interiorDesign: 'Interior Design',
  construction: 'Construction',
  packages: 'Packages',
  selectPackage: 'Select Package',

  // ── Common
  back: 'Back',
  next: 'Next',
  save: 'Save',
  cancel: 'Cancel',
  confirm: 'Confirm',
  submit: 'Submit',
  search: 'Search',
  loading: 'Loading…',
  noData: 'No data yet',

  // ── Profile sub-screens
  noOrdersYet: 'No orders yet',
  noOrdersHint: 'Your TerraInfra360 shop orders will appear here.',
  noAddresses: 'No saved addresses',
  noAddressesHint: 'Add a delivery address for faster checkout.',
  addNewAddress: 'Add New Address',
  noWishlist: 'Your wishlist is empty',
  noWishlistHint: 'Tap the heart on any property or shop item to save it.',
  noNotifications: 'No notifications yet',
  noNotificationsHint: 'Property alerts and order updates appear here.',
  noDevices: 'No active sessions',
  noDevicesHint: 'You have only this browser signed in right now.',
  noCoupons: 'No coupons available',
  noCouponsHint: 'New offers drop every Friday — check back soon.',
  noRequests: 'No requests yet',
  thisDevice: 'This device',
  signOutDevice: 'Sign out',
  changePasswordTitle: 'Change Password',
  currentPassword: 'Current password',
  newPassword: 'New password',
  confirmPassword: 'Confirm new password',
  notifPropertyAlerts: 'Property alerts',
  notifPriceDrops: 'Price drops',
  notifOrderUpdates: 'Order updates',
  notifPromotions: 'Promotions & offers',
  privacyShareWithVendors: 'Share my contact with vendors',
  privacyAnalytics: 'Allow analytics cookies',
  privacyDownload: 'Download my data',
  on: 'On',
  off: 'Off',
};

const hi: Dict = {
  home: 'होम', services: 'सेवाएँ', properties: 'प्रॉपर्टी', shop: 'दुकान',
  signUp: 'साइन अप', signIn: 'साइन इन', downloadApp: 'ऐप डाउनलोड', postProperty: 'प्रॉपर्टी पोस्ट करें',
  myProfile: 'मेरी प्रोफ़ाइल', memberSince: 'सदस्य बने', noContactNumber: 'कोई संपर्क नंबर नहीं',
  orders: 'ऑर्डर', wishlist: 'विशलिस्ट', coupons: 'कूपन', helpCenter: 'सहायता केंद्र',
  unlockBulkPricing: 'प्रीमियम बल्क मूल्य अनलॉक करें', joinAsBusiness: 'थोक दरों के लिए सत्यापित व्यवसाय के रूप में जुड़ें।', join: 'जुड़ें',
  myActivity: 'मेरी गतिविधि', myPropertyListings: 'मेरी प्रॉपर्टी लिस्टिंग', myServiceRequests: 'मेरी सेवा अनुरोध', myQuoteRequests: 'मेरे कोट अनुरोध',
  tryInLanguages: 'TI360 अपनी भाषा में आज़माएँ', currentlySetTo: 'वर्तमान में', choose: 'चुनें', tryInLanguage: 'TI360 अपनी भाषा में आज़माएँ', continueBtn: 'जारी रखें',
  accountSettings: 'खाता और सेटिंग्स', editProfileDetails: 'प्रोफ़ाइल विवरण संपादित करें',
  savedAddressLedger: 'सहेजे गए पते', manageDevices: 'डिवाइस प्रबंधन', notificationSettings: 'सूचना सेटिंग्स',
  privacyCenter: 'गोपनीयता केंद्र', updateSecuredPassword: 'सुरक्षित पासवर्ड अपडेट करें',
  supportCorporate: 'सहायता और कंपनी जानकारी', aboutTI: 'TerraInfra360 के बारे में', termsConditions: 'नियम और शर्तें', rateOurApp: 'ऐप को रेट करें',
  signOut: 'साइन आउट', signOutConfirm: 'क्या आप साइन आउट करना चाहते हैं?',
  editProfile: 'प्रोफ़ाइल संपादित करें', fullName: 'पूरा नाम', yourName: 'आपका नाम',
  email: 'ईमेल', mobileNumber: 'मोबाइल नंबर', saveChanges: 'परिवर्तन सहेजें', saving: 'सहेज रहा है…',
  comingSoon: 'जल्द ही आ रहा है', close: 'बंद करें', languageChanged: 'ऐप भाषा सेट:',
  buildYourLegacy: 'अपनी विरासत बनाएँ', premierEcosystem: 'भारत का प्रमुख निर्माण और रियल एस्टेट इकोसिस्टम',
  exploreServices: 'सेवाएँ देखें', viewProperties: 'प्रॉपर्टी देखें', ourServices: 'हमारी सेवाएँ',
  premiumServices: 'प्रीमियम सेवाएँ', shopMaterials: 'सामग्री खरीदें', postYourProperty: 'अपनी प्रॉपर्टी पोस्ट करें',
  flashSale: 'फ्लैश सेल', recommended: 'आपके लिए सुझाव', exploreByIntent: 'उद्देश्य से खोजें',
  popularServices: 'लोकप्रिय सेवाएँ', customerReviews: 'ग्राहक समीक्षाएँ', aboutUs: 'हमारे बारे में',
  contactUs: 'संपर्क करें', customerSupport: 'ग्राहक सहायता', recentlyViewed: 'हाल ही में देखा',
  marketSentiment: 'बाज़ार धारणा', quickUtilities: 'त्वरित उपयोगिताएँ', materialPrices: 'सामग्री मूल्य सूचकांक',
  shopByCategory: 'श्रेणी से खरीदें', trustedByThousands: 'भारत भर में हजारों ने भरोसा किया',
  byTheNumbers: 'आंकड़ों में', projectsDelivered: 'पूर्ण परियोजनाएँ', verifiedVendors: 'सत्यापित विक्रेता',
  industryAwards: 'उद्योग पुरस्कार', clientSatisfaction: 'ग्राहक संतुष्टि',
  viewAll: 'सभी देखें', seeMore: 'और देखें', bookNow: 'अभी बुक करें', getQuote: 'मूल्य प्राप्त करें', sendMessage: 'संदेश भेजें', learnMore: 'और जानें',
  searchProperties: 'प्रीमियम प्रॉपर्टी खोजें', searchPlaceholder: 'स्थान, BHK, बिल्डर...',
  allProperties: 'सभी प्रॉपर्टी', land: 'भूमि', residential: 'आवासीय', commercial: 'वाणिज्यिक',
  filter: 'फ़िल्टर', sort: 'क्रम', view: 'देखें', featured: 'विशेष', forSale: 'बिक्री के लिए', forRent: 'किराए पर',
  beds: 'बिस्तर', baths: 'बाथरूम', area: 'क्षेत्रफल', parking: 'पार्किंग', amenities: 'सुविधाएँ',
  noProperties: 'कोई प्रॉपर्टी नहीं मिली', tryAdjusting: 'अपने फ़िल्टर समायोजित करके पुनः प्रयास करें।',
  myListings: 'मेरी लिस्टिंग', shortlist: 'शॉर्टलिस्ट', notifications: 'सूचनाएँ', voiceSearch: 'वॉयस खोज',
  servicesHero: 'वास्तुशिल्प उत्कृष्टता और निर्माण सेवाएँ', architectureDesign: 'वास्तुकला और डिज़ाइन',
  interiorDesign: 'इंटीरियर डिज़ाइन', construction: 'निर्माण', packages: 'पैकेज', selectPackage: 'पैकेज चुनें',
  back: 'वापस', next: 'अगला', save: 'सहेजें', cancel: 'रद्द', confirm: 'पुष्टि', submit: 'भेजें',
  search: 'खोजें', loading: 'लोड हो रहा है…', noData: 'अभी कोई डेटा नहीं',
  noOrdersYet: 'अभी तक कोई ऑर्डर नहीं', noOrdersHint: 'आपके TerraInfra360 शॉप ऑर्डर यहाँ दिखाई देंगे।',
  noAddresses: 'कोई पता सहेजा नहीं गया', noAddressesHint: 'तेज़ चेकआउट के लिए पता जोड़ें।',
  addNewAddress: 'नया पता जोड़ें', noWishlist: 'विशलिस्ट खाली है', noWishlistHint: 'सहेजने के लिए ❤ टैप करें।',
  noNotifications: 'कोई सूचना नहीं', noNotificationsHint: 'प्रॉपर्टी अलर्ट और ऑर्डर अपडेट यहाँ आएँगे।',
  noDevices: 'कोई सक्रिय सत्र नहीं', noDevicesHint: 'अभी केवल यह ब्राउज़र साइन इन है।',
  noCoupons: 'कोई कूपन उपलब्ध नहीं', noCouponsHint: 'हर शुक्रवार नए ऑफर — जल्द ही जाँचें।',
  noRequests: 'अभी कोई अनुरोध नहीं', thisDevice: 'यह डिवाइस', signOutDevice: 'साइन आउट',
  changePasswordTitle: 'पासवर्ड बदलें', currentPassword: 'वर्तमान पासवर्ड', newPassword: 'नया पासवर्ड', confirmPassword: 'नया पासवर्ड पुष्टि करें',
  notifPropertyAlerts: 'प्रॉपर्टी अलर्ट', notifPriceDrops: 'मूल्य घटना', notifOrderUpdates: 'ऑर्डर अपडेट', notifPromotions: 'प्रचार और ऑफर',
  privacyShareWithVendors: 'विक्रेताओं के साथ संपर्क साझा करें', privacyAnalytics: 'एनालिटिक्स कुकीज़ की अनुमति दें', privacyDownload: 'मेरा डेटा डाउनलोड करें',
  on: 'चालू', off: 'बंद',
};

const kn: Dict = {
  home: 'ಮುಖಪುಟ', services: 'ಸೇವೆಗಳು', properties: 'ಆಸ್ತಿ', shop: 'ಅಂಗಡಿ',
  signUp: 'ಸೈನ್ ಅಪ್', signIn: 'ಸೈನ್ ಇನ್', downloadApp: 'ಆಪ್ ಡೌನ್‌ಲೋಡ್', postProperty: 'ಆಸ್ತಿ ಪೋಸ್ಟ್ ಮಾಡಿ',
  myProfile: 'ನನ್ನ ಪ್ರೊಫೈಲ್', memberSince: 'ಸದಸ್ಯ', noContactNumber: 'ಸಂಪರ್ಕ ಸಂಖ್ಯೆ ಇಲ್ಲ',
  orders: 'ಆದೇಶಗಳು', wishlist: 'ಇಷ್ಟಪಟ್ಟಿ', coupons: 'ಕೂಪನ್‌ಗಳು', helpCenter: 'ಸಹಾಯ ಕೇಂದ್ರ',
  unlockBulkPricing: 'ಪ್ರೀಮಿಯಂ ಬೃಹತ್ ಬೆಲೆ ಅನ್‌ಲಾಕ್', joinAsBusiness: 'ಬೃಹತ್ ದರಗಳಿಗಾಗಿ ಪರಿಶೀಲಿತ ವ್ಯಾಪಾರವಾಗಿ ಸೇರಿ.', join: 'ಸೇರಿ',
  myActivity: 'ನನ್ನ ಚಟುವಟಿಕೆ', myPropertyListings: 'ನನ್ನ ಆಸ್ತಿ ಪಟ್ಟಿಗಳು', myServiceRequests: 'ನನ್ನ ಸೇವಾ ವಿನಂತಿಗಳು', myQuoteRequests: 'ನನ್ನ ದರ ವಿನಂತಿಗಳು',
  tryInLanguages: 'TI360 ಅನ್ನು ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಪ್ರಯತ್ನಿಸಿ', currentlySetTo: 'ಪ್ರಸ್ತುತ', choose: 'ಆಯ್ಕೆಮಾಡಿ', tryInLanguage: 'TI360 ಅನ್ನು ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಪ್ರಯತ್ನಿಸಿ', continueBtn: 'ಮುಂದುವರಿಸಿ',
  accountSettings: 'ಖಾತೆ ಮತ್ತು ಸೆಟ್ಟಿಂಗ್‌ಗಳು', editProfileDetails: 'ಪ್ರೊಫೈಲ್ ವಿವರಗಳನ್ನು ಸಂಪಾದಿಸಿ',
  savedAddressLedger: 'ಉಳಿಸಿದ ವಿಳಾಸಗಳು', manageDevices: 'ಸಾಧನಗಳನ್ನು ನಿರ್ವಹಿಸಿ', notificationSettings: 'ಅಧಿಸೂಚನೆ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
  privacyCenter: 'ಗೌಪ್ಯತೆ ಕೇಂದ್ರ', updateSecuredPassword: 'ಸುರಕ್ಷಿತ ಪಾಸ್‌ವರ್ಡ್ ನವೀಕರಿಸಿ',
  supportCorporate: 'ಬೆಂಬಲ ಮತ್ತು ಕಂಪನಿ ಮಾಹಿತಿ', aboutTI: 'TerraInfra360 ಬಗ್ಗೆ', termsConditions: 'ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು', rateOurApp: 'ನಮ್ಮ ಆಪ್ ಅನ್ನು ರೇಟ್ ಮಾಡಿ',
  signOut: 'ಸೈನ್ ಔಟ್', signOutConfirm: 'ಸೈನ್ ಔಟ್ ಮಾಡಬೇಕೆ?',
  editProfile: 'ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ', fullName: 'ಪೂರ್ಣ ಹೆಸರು', yourName: 'ನಿಮ್ಮ ಹೆಸರು',
  email: 'ಇಮೇಲ್', mobileNumber: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ', saveChanges: 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ', saving: 'ಉಳಿಸಲಾಗುತ್ತಿದೆ…',
  comingSoon: 'ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ', close: 'ಮುಚ್ಚಿ', languageChanged: 'ಆಪ್ ಭಾಷೆ ಸೆಟ್:',
  buildYourLegacy: 'ನಿಮ್ಮ ಪರಂಪರೆ ನಿರ್ಮಿಸಿ', premierEcosystem: 'ಭಾರತದ ಪ್ರಮುಖ ನಿರ್ಮಾಣ ಮತ್ತು ರಿಯಲ್ ಎಸ್ಟೇಟ್ ಪರಿಸರ',
  exploreServices: 'ಸೇವೆಗಳನ್ನು ನೋಡಿ', viewProperties: 'ಆಸ್ತಿಗಳನ್ನು ನೋಡಿ', ourServices: 'ನಮ್ಮ ಸೇವೆಗಳು',
  premiumServices: 'ಪ್ರೀಮಿಯಂ ಸೇವೆಗಳು', shopMaterials: 'ಸಾಮಗ್ರಿಗಳನ್ನು ಖರೀದಿಸಿ', postYourProperty: 'ನಿಮ್ಮ ಆಸ್ತಿ ಪೋಸ್ಟ್ ಮಾಡಿ',
  flashSale: 'ಫ್ಲ್ಯಾಷ್ ಸೇಲ್', recommended: 'ನಿಮಗಾಗಿ ಶಿಫಾರಸುಗಳು', exploreByIntent: 'ಉದ್ದೇಶದಿಂದ ಅನ್ವೇಷಿಸಿ',
  popularServices: 'ಜನಪ್ರಿಯ ಸೇವೆಗಳು', customerReviews: 'ಗ್ರಾಹಕ ವಿಮರ್ಶೆಗಳು', aboutUs: 'ನಮ್ಮ ಬಗ್ಗೆ',
  contactUs: 'ಸಂಪರ್ಕಿಸಿ', customerSupport: 'ಗ್ರಾಹಕ ಬೆಂಬಲ', recentlyViewed: 'ಇತ್ತೀಚೆಗೆ ನೋಡಿದ',
  marketSentiment: 'ಮಾರುಕಟ್ಟೆ ಭಾವನೆ', quickUtilities: 'ತ್ವರಿತ ಉಪಯುಕ್ತತೆಗಳು', materialPrices: 'ಸಾಮಗ್ರಿ ಬೆಲೆ ಸೂಚ್ಯಂಕ',
  shopByCategory: 'ವರ್ಗದಿಂದ ಖರೀದಿಸಿ', trustedByThousands: 'ಭಾರತದಾದ್ಯಂತ ಸಾವಿರಾರು ಜನರು ನಂಬುತ್ತಾರೆ',
  byTheNumbers: 'ಸಂಖ್ಯೆಗಳಲ್ಲಿ', projectsDelivered: 'ಪೂರ್ಣಗೊಂಡ ಯೋಜನೆಗಳು', verifiedVendors: 'ಪರಿಶೀಲಿತ ಮಾರಾಟಗಾರರು',
  industryAwards: 'ಉದ್ಯಮ ಪ್ರಶಸ್ತಿಗಳು', clientSatisfaction: 'ಗ್ರಾಹಕ ತೃಪ್ತಿ',
  viewAll: 'ಎಲ್ಲವನ್ನು ನೋಡಿ', seeMore: 'ಮತ್ತಷ್ಟು ನೋಡಿ', bookNow: 'ಈಗಲೇ ಬುಕ್ ಮಾಡಿ', getQuote: 'ಬೆಲೆ ಪಡೆಯಿರಿ', sendMessage: 'ಸಂದೇಶ ಕಳುಹಿಸಿ', learnMore: 'ಮತ್ತಷ್ಟು ತಿಳಿಯಿರಿ',
  searchProperties: 'ಪ್ರೀಮಿಯಂ ಆಸ್ತಿಗಳನ್ನು ಹುಡುಕಿ', searchPlaceholder: 'ಸ್ಥಳ, BHK, ಬಿಲ್ಡರ್...',
  allProperties: 'ಎಲ್ಲಾ ಆಸ್ತಿಗಳು', land: 'ಭೂಮಿ', residential: 'ವಸತಿ', commercial: 'ವಾಣಿಜ್ಯ',
  filter: 'ಫಿಲ್ಟರ್', sort: 'ವಿಂಗಡಿಸಿ', view: 'ನೋಟ', featured: 'ವೈಶಿಷ್ಟ್ಯ', forSale: 'ಮಾರಾಟಕ್ಕೆ', forRent: 'ಬಾಡಿಗೆಗೆ',
  beds: 'ಹಾಸಿಗೆ', baths: 'ಸ್ನಾನಗೃಹ', area: 'ಪ್ರದೇಶ', parking: 'ಪಾರ್ಕಿಂಗ್', amenities: 'ಸೌಲಭ್ಯಗಳು',
  noProperties: 'ಯಾವುದೇ ಆಸ್ತಿಗಳಿಲ್ಲ', tryAdjusting: 'ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಸರಿಹೊಂದಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
  myListings: 'ನನ್ನ ಪಟ್ಟಿಗಳು', shortlist: 'ಶಾರ್ಟ್‌ಲಿಸ್ಟ್', notifications: 'ಅಧಿಸೂಚನೆಗಳು', voiceSearch: 'ಧ್ವನಿ ಹುಡುಕಾಟ',
  servicesHero: 'ವಾಸ್ತುಶಿಲ್ಪ ಶ್ರೇಷ್ಠತೆ ಮತ್ತು ನಿರ್ಮಾಣ ಸೇವೆಗಳು', architectureDesign: 'ವಾಸ್ತುಶಿಲ್ಪ ಮತ್ತು ವಿನ್ಯಾಸ',
  interiorDesign: 'ಒಳಾಂಗಣ ವಿನ್ಯಾಸ', construction: 'ನಿರ್ಮಾಣ', packages: 'ಪ್ಯಾಕೇಜುಗಳು', selectPackage: 'ಪ್ಯಾಕೇಜ್ ಆಯ್ಕೆಮಾಡಿ',
  back: 'ಹಿಂದೆ', next: 'ಮುಂದೆ', save: 'ಉಳಿಸಿ', cancel: 'ರದ್ದು', confirm: 'ದೃಢೀಕರಿಸಿ', submit: 'ಸಲ್ಲಿಸಿ',
  search: 'ಹುಡುಕಿ', loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ…', noData: 'ಯಾವುದೇ ಡೇಟಾ ಇಲ್ಲ',
  noOrdersYet: 'ಯಾವುದೇ ಆದೇಶಗಳಿಲ್ಲ', noOrdersHint: 'ನಿಮ್ಮ TerraInfra360 ಶಾಪ್ ಆದೇಶಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.',
  noAddresses: 'ಉಳಿಸಿದ ವಿಳಾಸಗಳಿಲ್ಲ', noAddressesHint: 'ವೇಗದ ಚೆಕ್‌ಔಟ್‌ಗೆ ವಿಳಾಸ ಸೇರಿಸಿ.',
  addNewAddress: 'ಹೊಸ ವಿಳಾಸ ಸೇರಿಸಿ', noWishlist: 'ವಿಷ್‌ಲಿಸ್ಟ್ ಖಾಲಿ ಇದೆ', noWishlistHint: 'ಉಳಿಸಲು ❤ ಟ್ಯಾಪ್ ಮಾಡಿ.',
  noNotifications: 'ಯಾವುದೇ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ', noNotificationsHint: 'ಆಸ್ತಿ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಆದೇಶ ಅಪ್‌ಡೇಟ್‌ಗಳು ಇಲ್ಲಿ ಬರುತ್ತವೆ.',
  noDevices: 'ಯಾವುದೇ ಸಕ್ರಿಯ ಸೆಷನ್‌ಗಳಿಲ್ಲ', noDevicesHint: 'ಪ್ರಸ್ತುತ ಈ ಬ್ರೌಸರ್ ಮಾತ್ರ ಸೈನ್ ಇನ್ ಆಗಿದೆ.',
  noCoupons: 'ಯಾವುದೇ ಕೂಪನ್‌ಗಳಿಲ್ಲ', noCouponsHint: 'ಪ್ರತಿ ಶುಕ್ರವಾರ ಹೊಸ ಆಫರ್‌ಗಳು — ಶೀಘ್ರದಲ್ಲೇ ಪರಿಶೀಲಿಸಿ.',
  noRequests: 'ಯಾವುದೇ ವಿನಂತಿಗಳಿಲ್ಲ', thisDevice: 'ಈ ಸಾಧನ', signOutDevice: 'ಸೈನ್ ಔಟ್',
  changePasswordTitle: 'ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಯಿಸಿ', currentPassword: 'ಪ್ರಸ್ತುತ ಪಾಸ್‌ವರ್ಡ್', newPassword: 'ಹೊಸ ಪಾಸ್‌ವರ್ಡ್', confirmPassword: 'ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಪರಿಶೀಲಿಸಿ',
  notifPropertyAlerts: 'ಆಸ್ತಿ ಎಚ್ಚರಿಕೆಗಳು', notifPriceDrops: 'ಬೆಲೆ ಇಳಿಕೆಗಳು', notifOrderUpdates: 'ಆದೇಶ ಅಪ್‌ಡೇಟ್‌ಗಳು', notifPromotions: 'ಪ್ರಚಾರಗಳು ಮತ್ತು ಆಫರ್‌ಗಳು',
  privacyShareWithVendors: 'ಮಾರಾಟಗಾರರೊಂದಿಗೆ ಸಂಪರ್ಕ ಹಂಚಿಕೊಳ್ಳಿ', privacyAnalytics: 'ಅನಾಲಿಟಿಕ್ಸ್ ಕುಕೀಸ್ ಅನುಮತಿಸಿ', privacyDownload: 'ನನ್ನ ಡೇಟಾ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
  on: 'ಆನ್', off: 'ಆಫ್',
};

const te: Dict = {
  home: 'హోమ్', services: 'సేవలు', properties: 'ఆస్తులు', shop: 'షాప్',
  signUp: 'సైన్ అప్', signIn: 'సైన్ ఇన్', downloadApp: 'యాప్ డౌన్‌లోడ్', postProperty: 'ఆస్తి పోస్ట్ చేయండి',
  myProfile: 'నా ప్రొఫైల్', memberSince: 'సభ్యుడు', noContactNumber: 'సంప్రదింపు సంఖ్య లేదు',
  orders: 'ఆర్డర్‌లు', wishlist: 'విష్‌లిస్ట్', coupons: 'కూపన్‌లు', helpCenter: 'సహాయ కేంద్రం',
  myActivity: 'నా కార్యకలాపం', myPropertyListings: 'నా ఆస్తి జాబితాలు', myServiceRequests: 'నా సేవ అభ్యర్థనలు', myQuoteRequests: 'నా కొటేషన్ అభ్యర్థనలు',
  tryInLanguages: 'మీ భాషలో TI360 ప్రయత్నించండి', currentlySetTo: 'ప్రస్తుతం', choose: 'ఎంచుకోండి', tryInLanguage: 'మీ భాషలో TI360', continueBtn: 'కొనసాగించు',
  accountSettings: 'ఖాతా & సెట్టింగ్‌లు', editProfileDetails: 'ప్రొఫైల్ సవరించు', savedAddressLedger: 'సేవ్ చేసిన చిరునామాలు',
  manageDevices: 'పరికరాలు నిర్వహించు', notificationSettings: 'నోటిఫికేషన్ సెట్టింగ్‌లు', privacyCenter: 'గోప్యత కేంద్రం', updateSecuredPassword: 'పాస్‌వర్డ్ నవీకరించండి',
  supportCorporate: 'మద్దతు & కంపెనీ సమాచారం', aboutTI: 'TerraInfra360 గురించి', termsConditions: 'నిబంధనలు', rateOurApp: 'మా యాప్‌ను రేట్ చేయండి',
  signOut: 'సైన్ అవుట్', signOutConfirm: 'సైన్ అవుట్ చేయాలా?',
  editProfile: 'ప్రొఫైల్ సవరించు', fullName: 'పూర్తి పేరు', yourName: 'మీ పేరు', email: 'ఇమెయిల్', mobileNumber: 'మొబైల్ సంఖ్య', saveChanges: 'మార్పులు సేవ్ చేయండి', saving: 'సేవ్ చేస్తోంది…',
  comingSoon: 'త్వరలో రాబోతోంది', close: 'మూసివేయి', languageChanged: 'యాప్ భాష:',
};

const ta: Dict = {
  home: 'முகப்பு', services: 'சேவைகள்', properties: 'சொத்துக்கள்', shop: 'கடை',
  signUp: 'பதிவு', signIn: 'உள்நுழை', downloadApp: 'பயன்பாடு பதிவிறக்கு', postProperty: 'சொத்து இடு',
  myProfile: 'எனது சுயவிவரம்', memberSince: 'உறுப்பினர்', noContactNumber: 'தொடர்பு எண் இல்லை',
  orders: 'ஆர்டர்கள்', wishlist: 'விருப்பப்பட்டியல்', coupons: 'கூப்பன்கள்', helpCenter: 'உதவி மையம்',
  myActivity: 'எனது செயல்பாடு', myPropertyListings: 'எனது சொத்து பட்டியல்கள்', myServiceRequests: 'எனது சேவை கோரிக்கைகள்', myQuoteRequests: 'எனது விலை கோரிக்கைகள்',
  tryInLanguages: 'உங்கள் மொழியில் TI360', currentlySetTo: 'தற்போது', choose: 'தேர்வுசெய்', tryInLanguage: 'உங்கள் மொழியில் TI360', continueBtn: 'தொடரவும்',
  accountSettings: 'கணக்கு & அமைப்புகள்', editProfileDetails: 'சுயவிவரத்தை திருத்து', savedAddressLedger: 'சேமித்த முகவரிகள்',
  manageDevices: 'சாதனங்களை நிர்வகி', notificationSettings: 'அறிவிப்பு அமைப்புகள்', privacyCenter: 'தனியுரிமை மையம்', updateSecuredPassword: 'கடவுச்சொல் புதுப்பி',
  supportCorporate: 'ஆதரவு & நிறுவன தகவல்', aboutTI: 'TerraInfra360 பற்றி', termsConditions: 'விதிமுறைகள்', rateOurApp: 'பயன்பாட்டை மதிப்பிடு',
  signOut: 'வெளியேறு', signOutConfirm: 'வெளியேற விரும்புகிறீர்களா?',
  editProfile: 'சுயவிவரத்தை திருத்து', fullName: 'முழு பெயர்', yourName: 'உங்கள் பெயர்', email: 'மின்னஞ்சல்', mobileNumber: 'மொபைல் எண்', saveChanges: 'மாற்றங்களை சேமி', saving: 'சேமிக்கப்படுகிறது…',
  comingSoon: 'விரைவில்', close: 'மூடு', languageChanged: 'பயன்பாட்டு மொழி:',
};

const ml: Dict = {
  home: 'ഹോം', services: 'സേവനങ്ങൾ', properties: 'പ്രോപ്പർട്ടികൾ', shop: 'ഷോപ്പ്',
  signUp: 'സൈൻ അപ്', signIn: 'സൈൻ ഇൻ', downloadApp: 'ആപ്പ് ഡൗൺലോഡ്', postProperty: 'പ്രോപ്പർട്ടി പോസ്റ്റ്',
  myProfile: 'എന്റെ പ്രൊഫൈൽ', memberSince: 'അംഗം', noContactNumber: 'കോൺടാക്റ്റ് നമ്പർ ഇല്ല',
  orders: 'ഓർഡറുകൾ', wishlist: 'വിഷ്‌ലിസ്റ്റ്', coupons: 'കൂപ്പണുകൾ', helpCenter: 'സഹായ കേന്ദ്രം',
  myActivity: 'എന്റെ പ്രവർത്തനം', myPropertyListings: 'എന്റെ പ്രോപ്പർട്ടി ലിസ്റ്റിംഗുകൾ', myServiceRequests: 'എന്റെ സേവന അഭ്യർത്ഥനകൾ', myQuoteRequests: 'എന്റെ കോട്ട് അഭ്യർത്ഥനകൾ',
  tryInLanguages: 'നിങ്ങളുടെ ഭാഷയിൽ TI360', currentlySetTo: 'നിലവിൽ', choose: 'തിരഞ്ഞെടുക്കുക', tryInLanguage: 'നിങ്ങളുടെ ഭാഷയിൽ TI360', continueBtn: 'തുടരുക',
  accountSettings: 'അക്കൗണ്ട് & ക്രമീകരണങ്ങൾ', editProfileDetails: 'പ്രൊഫൈൽ എഡിറ്റ് ചെയ്യുക', savedAddressLedger: 'സംരക്ഷിച്ച വിലാസങ്ങൾ',
  manageDevices: 'ഉപകരണങ്ങൾ കൈകാര്യം ചെയ്യുക', notificationSettings: 'അറിയിപ്പ് ക്രമീകരണങ്ങൾ', privacyCenter: 'സ്വകാര്യത കേന്ദ്രം', updateSecuredPassword: 'പാസ്‌വേഡ് അപ്ഡേറ്റ് ചെയ്യുക',
  supportCorporate: 'പിന്തുണ & കമ്പനി വിവരം', aboutTI: 'TerraInfra360 നെക്കുറിച്ച്', termsConditions: 'നിബന്ധനകൾ', rateOurApp: 'ഞങ്ങളുടെ ആപ്പ് റേറ്റ് ചെയ്യുക',
  signOut: 'സൈൻ ഔട്ട്', signOutConfirm: 'സൈൻ ഔട്ട് ചെയ്യണോ?',
  editProfile: 'പ്രൊഫൈൽ എഡിറ്റ്', fullName: 'പൂർണ്ണ നാമം', yourName: 'നിങ്ങളുടെ പേര്', email: 'ഇമെയിൽ', mobileNumber: 'മൊബൈൽ നമ്പർ', saveChanges: 'മാറ്റങ്ങൾ സംരക്ഷിക്കുക', saving: 'സംരക്ഷിക്കുന്നു…',
  comingSoon: 'ഉടൻ വരുന്നു', close: 'അടയ്ക്കുക', languageChanged: 'ആപ്പ് ഭാഷ:',
};

const mr: Dict = {
  home: 'मुख्यपृष्ठ', services: 'सेवा', properties: 'मालमत्ता', shop: 'दुकान',
  signUp: 'साइन अप', signIn: 'साइन इन', downloadApp: 'ॲप डाउनलोड', postProperty: 'मालमत्ता पोस्ट करा',
  myProfile: 'माझे प्रोफाइल', memberSince: 'सदस्य', noContactNumber: 'संपर्क क्रमांक नाही',
  orders: 'ऑर्डर', wishlist: 'विशलिस्ट', coupons: 'कूपन', helpCenter: 'मदत केंद्र',
  myActivity: 'माझी क्रिया', myPropertyListings: 'माझी मालमत्ता यादी', myServiceRequests: 'माझ्या सेवा विनंत्या', myQuoteRequests: 'माझ्या कोट विनंत्या',
  tryInLanguages: 'तुमच्या भाषेत TI360', currentlySetTo: 'सध्या', choose: 'निवडा', tryInLanguage: 'तुमच्या भाषेत TI360', continueBtn: 'पुढे चला',
  accountSettings: 'खाते आणि सेटिंग्ज', editProfileDetails: 'प्रोफाइल संपादित करा', savedAddressLedger: 'जतन केलेले पत्ते',
  manageDevices: 'डिव्हाइसेस व्यवस्थापित करा', notificationSettings: 'सूचना सेटिंग्ज', privacyCenter: 'गोपनीयता केंद्र', updateSecuredPassword: 'सुरक्षित पासवर्ड अपडेट करा',
  supportCorporate: 'समर्थन आणि कंपनी माहिती', aboutTI: 'TerraInfra360 बद्दल', termsConditions: 'अटी व शर्ती', rateOurApp: 'आमचे ॲप रेट करा',
  signOut: 'साइन आउट', signOutConfirm: 'साइन आउट करायचे?',
  editProfile: 'प्रोफाइल संपादित करा', fullName: 'पूर्ण नाव', yourName: 'तुमचे नाव', email: 'ईमेल', mobileNumber: 'मोबाइल क्रमांक', saveChanges: 'बदल जतन करा', saving: 'जतन करत आहे…',
  comingSoon: 'लवकरच येत आहे', close: 'बंद करा', languageChanged: 'ॲप भाषा:',
};

const gu: Dict = {
  home: 'હોમ', services: 'સેવાઓ', properties: 'મિલકતો', shop: 'દુકાન',
  signUp: 'સાઇન અપ', signIn: 'સાઇન ઇન', downloadApp: 'એપ ડાઉનલોડ', postProperty: 'મિલકત પોસ્ટ કરો',
  myProfile: 'મારી પ્રોફાઇલ', memberSince: 'સભ્ય', noContactNumber: 'સંપર્ક નંબર નથી',
  orders: 'ઓર્ડર', wishlist: 'વિશલિસ્ટ', coupons: 'કૂપન', helpCenter: 'મદદ કેન્દ્ર',
  myActivity: 'મારી પ્રવૃત્તિ', myPropertyListings: 'મારી મિલકત યાદી', myServiceRequests: 'મારી સેવા વિનંતીઓ', myQuoteRequests: 'મારી ભાવ વિનંતીઓ',
  tryInLanguages: 'તમારી ભાષામાં TI360', currentlySetTo: 'હાલમાં', choose: 'પસંદ કરો', tryInLanguage: 'તમારી ભાષામાં TI360', continueBtn: 'ચાલુ રાખો',
  accountSettings: 'એકાઉન્ટ અને સેટિંગ્સ', editProfileDetails: 'પ્રોફાઇલ સંપાદિત કરો', savedAddressLedger: 'સાચવેલા સરનામા',
  manageDevices: 'ઉપકરણો સંચાલિત કરો', notificationSettings: 'સૂચના સેટિંગ્સ', privacyCenter: 'ગોપનીયતા કેન્દ્ર', updateSecuredPassword: 'સુરક્ષિત પાસવર્ડ અપડેટ કરો',
  supportCorporate: 'સહાય અને કંપની માહિતી', aboutTI: 'TerraInfra360 વિશે', termsConditions: 'નિયમો અને શરતો', rateOurApp: 'અમારી એપને રેટ કરો',
  signOut: 'સાઇન આઉટ', signOutConfirm: 'સાઇન આઉટ કરવું છે?',
  editProfile: 'પ્રોફાઇલ સંપાદિત કરો', fullName: 'પૂરું નામ', yourName: 'તમારું નામ', email: 'ઇમેઇલ', mobileNumber: 'મોબાઇલ નંબર', saveChanges: 'ફેરફારો સાચવો', saving: 'સાચવી રહ્યું છે…',
  comingSoon: 'જલ્દી આવી રહ્યું છે', close: 'બંધ કરો', languageChanged: 'એપ ભાષા:',
};

const DICTS: Record<LangCode, Dict> = { en, hi, kn, te, ta, ml, mr, gu };

// ─── Context ────────────────────────────────────────────────────────────
interface LanguageCtx {
  lang: LangCode;
  langDef: LanguageDef;
  setLanguage: (code: LangCode) => void;
  t: (key: string) => string;
}

const Ctx = createContext<LanguageCtx | null>(null);

const STORAGE_KEY = 'tf360_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(() => {
    if (typeof window === 'undefined') return 'en';
    const saved = window.localStorage.getItem(STORAGE_KEY) as LangCode | null;
    return saved && DICTS[saved] ? saved : 'en';
  });

  // Persist + run the DOM translator so every screen flips.
  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, lang); } catch {}
    document.documentElement.lang = lang;
    // Defer slightly so React has finished its current commit.
    const id = window.setTimeout(() => { void setDocumentLanguage(lang); }, 50);
    return () => window.clearTimeout(id);
  }, [lang]);

  const value = useMemo<LanguageCtx>(() => ({
    lang,
    langDef: LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0],
    setLanguage: setLangState,
    t: (key: string) => DICTS[lang]?.[key] ?? en[key] ?? key,
  }), [lang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useT(): LanguageCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useT must be used inside <LanguageProvider>');
  return ctx;
}
