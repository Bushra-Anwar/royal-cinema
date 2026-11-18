const { getCompanies, saveCompanies } = require('../database/db');
const branchService = require('./branchService');
const { getAdvertisements } = require('./saasWebsiteService');

function getSaaSBusinessAnalytics() {
  const companies = getCompanies();
  const branches = [];
  companies.forEach(c => {
    try {
      const bList = branchService.getCompanyBranches(c.id);
      if (Array.isArray(bList)) branches.push(...bList);
    } catch (_) {}
  });
  const ads = getAdvertisements();

  let totalRevenue = 0;
  let activeClients = 0;
  let suspendedClients = 0;
  let activeSubscriptions = 0;
  let expiredSubscriptions = 0;

  const planDistribution = {
    '1 Screen Starter Plan': 0,
    '2 Screen Twin Multiplex': 0,
    '4 Screen Multiplex Pro': 0,
    'Other': 0
  };

  const featureUsage = {
    'Box Office POS': 0,
    'Food Counter POS': 0,
    'Command Center Ledger': 0,
    'Customer Kiosk & Online App': 0,
    '4K Laser Projection': 0,
    'Dolby Atmos 7.1': 0
  };

  companies.forEach(c => {
    const isAct = c.status !== 'suspended';
    if (isAct) activeClients++;
    else suspendedClients++;

    const sub = c.subscription || {};
    const amtStr = String(sub.amountPaid || '0');
    const amt = parseInt(amtStr.replace(/[^0-9]/g, '')) || 0;
    totalRevenue += amt;

    const plan = sub.planName || '';
    if (plan.includes('1 Screen') || plan.includes('Starter')) {
      planDistribution['1 Screen Starter Plan']++;
    } else if (plan.includes('2 Screen') || plan.includes('Twin')) {
      planDistribution['2 Screen Twin Multiplex']++;
    } else if (plan.includes('4 Screen') || plan.includes('Pro') || plan.includes('Multiplex')) {
      planDistribution['4 Screen Multiplex Pro']++;
    } else {
      planDistribution['Other']++;
    }

    // Default feature entitlements based on tier
    featureUsage['Box Office POS']++;
    featureUsage['Command Center Ledger']++;
    if (!plan.includes('1 Screen')) {
      featureUsage['Food Counter POS']++;
      featureUsage['Customer Kiosk & Online App']++;
    }
    if (plan.includes('4 Screen') || plan.includes('Pro')) {
      featureUsage['4K Laser Projection']++;
      featureUsage['Dolby Atmos 7.1']++;
    }
  });

  branches.forEach(b => {
    if (b.status === 'active' && (!b.subscription || b.subscription.status === 'active')) {
      activeSubscriptions++;
    } else {
      expiredSubscriptions++;
    }
  });

  // Calculate MRR (Monthly Recurring Revenue)
  const mrr = Math.round(totalRevenue / 12);

  // Ad performance aggregate
  const totalAdImpressions = ads.reduce((acc, a) => acc + (a.impressions || 0), 0);
  const totalAdClicks = ads.reduce((acc, a) => acc + (a.clicks || 0), 0);

  return {
    overview: {
      totalClients: companies.length,
      activeClients,
      suspendedClients,
      totalBranches: branches.length,
      activeSubscriptions,
      expiredSubscriptions,
      totalRevenue,
      mrr,
      currency: 'INR'
    },
    planDistribution,
    featureUsage,
    advertising: {
      totalCampaigns: ads.length,
      activeCampaigns: ads.filter(a => a.status === 'active').length,
      totalImpressions: totalAdImpressions,
      totalClicks: totalAdClicks,
      ctr: totalAdImpressions > 0 ? ((totalAdClicks / totalAdImpressions) * 100).toFixed(2) + '%' : '0.00%'
    },
    timestamp: new Date().toISOString()
  };
}

function updateClientFeatures(companyId, featureToggles) {
  const companies = getCompanies();
  const cmp = companies.find(c => c.id === companyId);
  if (!cmp) return null;

  cmp.featurePackages = {
    ...(cmp.featurePackages || {}),
    ...featureToggles,
    updatedAt: new Date().toISOString()
  };

  saveCompanies(companies);
  return cmp;
}

module.exports = {
  getSaaSBusinessAnalytics,
  updateClientFeatures
};
