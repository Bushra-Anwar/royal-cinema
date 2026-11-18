const fs = require('node:fs');
const path = require('node:path');
const paths = require('../config/paths');

function getWebsiteContentFile() {
  return path.join(paths.getDataDir(), 'saas_website_content.json');
}

function getAdvertisementsFile() {
  return path.join(paths.getDataDir(), 'saas_advertisements.json');
}

// Default initial SaaS Website CMS content
const DEFAULT_CONTENT = {
  hero: {
    badge: 'ROYAL CINEMA ERP & CLOUD SAAS',
    headline: 'Modern Multiplex Management, Box Office & Concessions POS',
    subheadline: 'All-in-one cinema operating system engineered for single-screen theatres and 4-screen multiplex chains across India.',
    primaryCtaText: 'Schedule a Live Demo',
    primaryCtaLink: '#demo',
    secondaryCtaText: 'View Pricing Plans',
    secondaryCtaLink: '#pricing',
    bannerImageUrl: 'cinema-hall.jpg'
  },
  features: [
    { id: 'f1', title: 'Box Office Multi-Counter POS', description: 'Fast offline-first ticket issuing with instant thermal receipt & QR generation.', icon: 'ticket' },
    { id: 'f2', title: 'Concession & Food KDS', description: 'Real-time kitchen display, recipe stock deduction, and mobile seat ordering.', icon: 'utensils' },
    { id: 'f3', title: 'Cinema Command Center', description: 'Statutory distributor ledger, daily vault reconciliation, and multi-screen scheduler.', icon: 'layout-dashboard' },
    { id: 'f4', title: 'Customer Kiosk & Web App', description: 'Self-service booking with dynamic interactive seat matrix and combo upselling.', icon: 'smartphone' }
  ],
  pricing: [
    { id: 'plan-1', name: 'Starter Single Screen', price: '₹9,999/yr', screens: '1 Screen', features: ['Box Office POS', '1-Device License', 'Offline Sync', 'Standard Reports'] },
    { id: 'plan-2', name: 'Twin Multiplex', price: '₹16,999/yr', screens: '2 Screens', features: ['Box Office + Food POS', '4-Device Licenses', 'Dual Screen Scheduler', 'Distributor Ledger'] },
    { id: 'plan-3', name: 'Multiplex Pro Suite', price: '₹24,999/yr', screens: '4 Screens ★', features: ['All 4 Operational Modules', 'Unlimited Devices', 'Customer Kiosk', '15-Min SLA Support'] }
  ],
  seo: {
    metaTitle: 'Royal Cinema ERP — Premier Cinema Management & POS Platform',
    metaDescription: 'India\'s fastest cloud & desktop ERP platform for single-screen and multiplex cinema chains.',
    keywords: 'cinema software, box office pos, movie ticketing system, multiplex erp india'
  },
  publication: {
    isPublished: true,
    publishedAt: '2026-11-17T18:00:00.000Z',
    publishedBy: 'Service Provider / SaaS Owner',
    version: '1.2.0'
  }
};

// Default initial Advertisements
const DEFAULT_ADS = [
  {
    id: 'ad_001',
    title: 'Weekend Popcorn & Cola Combo Fest',
    placement: 'booking_kiosk',
    bannerUrl: 'popcorn-banner.jpg',
    targetUrl: '#offers',
    startDate: '2026-11-15',
    endDate: '2026-12-31',
    status: 'active',
    impressions: 4820,
    clicks: 642,
    createdAt: '2026-11-15T10:00:00.000Z'
  },
  {
    id: 'ad_002',
    title: 'IMAX Laser Experience Special Launch',
    placement: 'home_hero',
    bannerUrl: 'imax-laser.jpg',
    targetUrl: '#experience',
    startDate: '2026-11-01',
    endDate: '2026-12-15',
    status: 'active',
    impressions: 12940,
    clicks: 1850,
    createdAt: '2026-11-01T08:00:00.000Z'
  }
];

function getWebsiteContent() {
  const file = getWebsiteContentFile();
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(DEFAULT_CONTENT, null, 2), 'utf8');
      return DEFAULT_CONTENT;
    }
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    return DEFAULT_CONTENT;
  }
}

function updateWebsiteContent(updates, publishedBy = 'Service Provider') {
  const file = getWebsiteContentFile();
  const current = getWebsiteContent();
  const updated = {
    ...current,
    ...updates,
    publication: {
      ...current.publication,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      publishedBy
    }
  };
  fs.writeFileSync(file, JSON.stringify(updated, null, 2), 'utf8');
  return updated;
}

function setWebsitePublishedStatus(isPublished, publishedBy = 'Service Provider') {
  const file = getWebsiteContentFile();
  const current = getWebsiteContent();
  current.publication = {
    ...current.publication,
    isPublished: Boolean(isPublished),
    publishedAt: new Date().toISOString(),
    publishedBy
  };
  fs.writeFileSync(file, JSON.stringify(current, null, 2), 'utf8');
  return current.publication;
}

function getAdvertisements() {
  const file = getAdvertisementsFile();
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(DEFAULT_ADS, null, 2), 'utf8');
      return DEFAULT_ADS;
    }
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    return DEFAULT_ADS;
  }
}

function saveAdvertisements(ads) {
  const file = getAdvertisementsFile();
  fs.writeFileSync(file, JSON.stringify(ads, null, 2), 'utf8');
  return ads;
}

function createAdvertisement(adData) {
  const ads = getAdvertisements();
  const newAd = {
    id: 'ad_' + Date.now(),
    title: adData.title || 'Special Promotion',
    placement: adData.placement || 'home_hero',
    bannerUrl: adData.bannerUrl || 'promo-banner.jpg',
    targetUrl: adData.targetUrl || '#',
    startDate: adData.startDate || new Date().toISOString().slice(0, 10),
    endDate: adData.endDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    status: adData.status || 'active',
    impressions: 0,
    clicks: 0,
    createdAt: new Date().toISOString()
  };
  ads.unshift(newAd);
  saveAdvertisements(ads);
  return newAd;
}

function updateAdvertisement(adId, updates) {
  const ads = getAdvertisements();
  const idx = ads.findIndex(a => a.id === adId);
  if (idx === -1) return null;
  ads[idx] = { ...ads[idx], ...updates, updatedAt: new Date().toISOString() };
  saveAdvertisements(ads);
  return ads[idx];
}

function deleteAdvertisement(adId) {
  let ads = getAdvertisements();
  const len = ads.length;
  ads = ads.filter(a => a.id !== adId);
  saveAdvertisements(ads);
  return ads.length < len;
}

module.exports = {
  getWebsiteContent,
  updateWebsiteContent,
  setWebsitePublishedStatus,
  getAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement
};
