// ============================================
// HOLIDAY CAMPAIGN PAUSER - Czech Holidays
// ============================================

const LABEL_NAME = 'Holiday_Paused';
const LABEL_COLOR = '#FF6B6B';
const EMAIL_RECIPIENT = 'tvuj.mail@gmail.com'; // Tvůj email

// Fixní svátky ČR (MM-dd)
const FIXED_HOLIDAYS = [
  '01-01', // Nový rok
  '05-01', // Svátek práce
  '05-08', // Den vítězství
  '07-05', // Cyril a Metoděj
  '07-06', // Jan Hus
  '09-28', // Den české státnosti
  '10-28', // Vznik Československa
  '11-17', // Den boje za svobodu
  '12-24', // Štědrý den
  '12-25', // 1. svátek vánoční
  '12-26'  // 2. svátek vánoční
];

function main() {
  ensureLabelExists();
  
  const accountName = AdsApp.currentAccount().getName();
  const today = Utilities.formatDate(new Date(), 'Europe/Prague', 'dd.MM.yyyy');
  
  if (isHolidayToday()) {
    Logger.log('🎄 Dnes je svátek - pauzuji kampaně');
    const pausedCampaigns = pauseAllCampaigns();
    
    if (pausedCampaigns.length > 0) {
      sendNotification(
        `⏸️ Svátek ${today} - Kampaně pozastaveny`,
        accountName,
        'pozastaveno',
        pausedCampaigns
      );
    }
  } else {
    Logger.log('📅 Běžný den - kontroluji, zda reaktivovat kampaně');
    const reactivatedCampaigns = reactivatePausedCampaigns();
    
    if (reactivatedCampaigns.length > 0) {
      sendNotification(
        `▶️ Konec svátku - Kampaně reaktivovány`,
        accountName,
        'reaktivováno',
        reactivatedCampaigns
      );
    }
  }
}

// ============================================
// EMAIL NOTIFICATION
// ============================================

function sendNotification(subject, accountName, action, campaigns) {
  const campaignList = campaigns
    .map(c => `• [${c.type}] ${c.name}`)
    .join('\n');
  
  const body = `
Účet: ${accountName}
Datum: ${Utilities.formatDate(new Date(), 'Europe/Prague', 'dd.MM.yyyy HH:mm')}
Akce: ${action}

Kampaně (${campaigns.length}):
${campaignList}

---
Holiday Campaign Pauser Script
  `.trim();
  
  MailApp.sendEmail({
    to: EMAIL_RECIPIENT,
    subject: `[Google Ads] ${subject}`,
    body: body
  });
  
  Logger.log(`📧 Email odeslán na ${EMAIL_RECIPIENT}`);
}

// ============================================
// LABEL MANAGEMENT
// ============================================

function ensureLabelExists() {
  const labels = AdsApp.labels()
    .withCondition(`label.name = "${LABEL_NAME}"`)
    .get();
  
  if (!labels.hasNext()) {
    AdsApp.createLabel(LABEL_NAME, 'Kampaně pauznuté skriptem o svátcích', LABEL_COLOR);
    Logger.log(`✅ Label "${LABEL_NAME}" vytvořen`);
  }
}

// ============================================
// PAUSE LOGIC
// ============================================

function pauseAllCampaigns() {
  const pausedCampaigns = [];
  
  // 1. Search & Display kampaně
  pausedCampaigns.push(...pauseCampaignsFromIterator(
    AdsApp.campaigns()
      .withCondition('campaign.status = ENABLED')
      .get(),
    'Search/Display'
  ));
  
  // 2. Performance Max kampaně
  pausedCampaigns.push(...pauseCampaignsFromIterator(
    AdsApp.performanceMaxCampaigns()
      .withCondition('campaign.status = ENABLED')
      .get(),
    'PMax'
  ));
  
  // 3. Shopping kampaně
  pausedCampaigns.push(...pauseCampaignsFromIterator(
    AdsApp.shoppingCampaigns()
      .withCondition('campaign.status = ENABLED')
      .get(),
    'Shopping'
  ));
  
  // 4. Video kampaně
  pausedCampaigns.push(...pauseCampaignsFromIterator(
    AdsApp.videoCampaigns()
      .withCondition('campaign.status = ENABLED')
      .get(),
    'Video'
  ));
  
  Logger.log(`🔴 Celkem pauzováno: ${pausedCampaigns.length} kampaní`);
  return pausedCampaigns;
}

function pauseCampaignsFromIterator(iterator, type) {
  const paused = [];
  
  while (iterator.hasNext()) {
    const campaign = iterator.next();
    
    if (hasLabel(campaign)) {
      continue;
    }
    
    campaign.pause();
    campaign.applyLabel(LABEL_NAME);
    Logger.log(`  ⏸️ [${type}] ${campaign.getName()}`);
    paused.push({ name: campaign.getName(), type: type });
  }
  
  return paused;
}

// ============================================
// REACTIVATE LOGIC
// ============================================

function reactivatePausedCampaigns() {
  const reactivatedCampaigns = [];
  
  // 1. Search & Display
  reactivatedCampaigns.push(...reactivateCampaignsFromIterator(
    AdsApp.campaigns()
      .withCondition(`LabelNames CONTAINS_ANY ["${LABEL_NAME}"]`)
      .get(),
    'Search/Display'
  ));
  
  // 2. Performance Max
  reactivatedCampaigns.push(...reactivateCampaignsFromIterator(
    AdsApp.performanceMaxCampaigns()
      .withCondition(`LabelNames CONTAINS_ANY ["${LABEL_NAME}"]`)
      .get(),
    'PMax'
  ));
  
  // 3. Shopping
  reactivatedCampaigns.push(...reactivateCampaignsFromIterator(
    AdsApp.shoppingCampaigns()
      .withCondition(`LabelNames CONTAINS_ANY ["${LABEL_NAME}"]`)
      .get(),
    'Shopping'
  ));
  
  // 4. Video
  reactivatedCampaigns.push(...reactivateCampaignsFromIterator(
    AdsApp.videoCampaigns()
      .withCondition(`LabelNames CONTAINS_ANY ["${LABEL_NAME}"]`)
      .get(),
    'Video'
  ));
  
  if (reactivatedCampaigns.length > 0) {
    Logger.log(`🟢 Celkem reaktivováno: ${reactivatedCampaigns.length} kampaní`);
  } else {
    Logger.log(`ℹ️ Žádné kampaně k reaktivaci`);
  }
  
  return reactivatedCampaigns;
}

function reactivateCampaignsFromIterator(iterator, type) {
  const reactivated = [];
  
  while (iterator.hasNext()) {
    const campaign = iterator.next();
    campaign.enable();
    campaign.removeLabel(LABEL_NAME);
    Logger.log(`  ▶️ [${type}] ${campaign.getName()}`);
    reactivated.push({ name: campaign.getName(), type: type });
  }
  
  return reactivated;
}

// ============================================
// HELPER: Check if campaign has label
// ============================================

function hasLabel(campaign) {
  const labels = campaign.labels()
    .withCondition(`label.name = "${LABEL_NAME}"`)
    .get();
  return labels.hasNext();
}

// ============================================
// HOLIDAY DETECTION
// ============================================

function isHolidayToday() {
  const today = new Date();
  const year = today.getFullYear();
  const monthDay = Utilities.formatDate(today, 'Europe/Prague', 'MM-dd');
  
  if (FIXED_HOLIDAYS.includes(monthDay)) {
    Logger.log(`  📌 Fixní svátek: ${monthDay}`);
    return true;
  }
  
  const movable = getMovableHolidays(year);
  for (const holiday of movable) {
    const holidayStr = Utilities.formatDate(holiday, 'Europe/Prague', 'MM-dd');
    if (holidayStr === monthDay) {
      Logger.log(`  📌 Pohyblivý svátek (Velikonoce): ${monthDay}`);
      return true;
    }
  }
  
  return false;
}

function getEasterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month - 1, day);
}

function getMovableHolidays(year) {
  const easter = getEasterSunday(year);
  
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);
  
  return [goodFriday, easterMonday];
}
