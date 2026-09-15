import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  collection,
  getDocs
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { runNoticeSync } from './noticeSync.ts';

async function seed() {
  console.log('Seeding Priyo Chauddagram database...');
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  const app = initializeApp({
    apiKey: config.apiKey,
    projectId: config.projectId,
    appId: config.appId,
    authDomain: config.authDomain
  }, 'seed-app');
  const db = getFirestore(app, config.firestoreDatabaseId);

  const now = new Date().toISOString();

  // 1. Seed Admin Users
  console.log('Setting up Primary Admin user...');
  const primaryAdminEmail = 'matelecom.cb71@gmail.com';
  await setDoc(doc(db, 'admin_users', primaryAdminEmail), {
    email: primaryAdminEmail,
    name: 'Fakrul Islam',
    role: 'primary_admin',
    phone: '',
    designation: 'Founder & Primary Admin',
    organization: 'Priyo Digital Lab',
    location: 'চৌদ্দগ্রাম, কুমিল্লা',
    created_at: now,
    created_by: 'system',
    admin_signature: 'fakrul_islam_priyo_chauddagram_auth'
  });

  // Also support fallback dev admin
  await setDoc(doc(db, 'admin_users', 'fakrul.islam'), {
    email: 'fakrul@priyodigitallab.com',
    name: 'Fakrul Islam',
    role: 'primary_admin',
    phone: '',
    designation: 'Developer & Admin',
    organization: 'Priyo Digital Lab',
    location: 'চৌদ্দগ্রাম, কুমিল্লা',
    created_at: now,
    created_by: 'system',
    admin_signature: 'fakrul_islam_priyo_chauddagram_auth'
  });

  // 2. Seed Upazila Profile (chauddagram_profile)
  console.log('Setting up Upazila Profile...');
  const profileRef = doc(db, 'upazila_profile', 'chauddagram_profile');
  await setDoc(profileRef, {
    id: 'chauddagram_profile',
    name_bn: 'চৌদ্দগ্রাম',
    name_en: 'Chauddagram',
    district_bn: 'কুমিল্লা',
    district_en: 'Cumilla',
    division_bn: 'চট্টগ্রাম',
    division_en: 'Chattogram',
    tagline_bn: 'আমাদের উপজেলা, আমাদের গর্ব',
    tagline_en: 'Our Upazila, Our Pride',
    description_bn: 'চৌদ্দগ্রাম বাংলাদেশের কুমিল্লা জেলার দক্ষিণ-পূর্বাংশে অবস্থিত একটি ঐতিহাসিক, অর্থনৈতিক ও শিক্ষা-সংস্কৃতিতে সমৃদ্ধ উপজেলা। ঢাকা-চট্টগ্রাম মহাসড়কের কোল ঘেঁষে অবস্থিত এই জনপদ ব্যবসা-বাণিজ্য, শিক্ষা ও সংস্কৃতির ক্ষেত্রে এক অনন্য গৌরব বহন করে।',
    description_en: 'Chauddagram is a historic, economically vibrant, and culturally rich upazila located in the southeastern region of Cumilla district, Bangladesh. Nestled beside the Dhaka-Chattogram highway, it carries a unique heritage of trade and education.',
    history_bn: 'প্রাচীন সমতট ও ত্রিপুরা রাজ্যের ঐতিহ্যবাহী জনপদ হিসেবে চৌদ্দগ্রামের রয়েছে সুপ্রাচীন সমৃদ্ধ ইতিহাস। ব্রিটিশবিরোধী আন্দোলন এবং ১৯৭১ সালের মহান মুক্তিযুদ্ধে চৌদ্দগ্রামের মানুষের বীরত্বপূর্ণ ভূমিকা ইতিহাসের পাতায় অমলিন হয়ে আছে।',
    history_en: 'As part of ancient Samatata and the historical Tripura realm, Chauddagram boasts deep roots. The courageous citizens of Chauddagram played historic roles during the anti-colonial resistance and the glorious 1971 Liberation War.',
    geography_bn: 'চৌদ্দগ্রামের মোট আয়তন ২৬৮.৪৮ বর্গকিলোমিটার। এর উত্তরে কুমিল্লা সদর দক্ষিণ উপজেলা, দক্ষিণে ফেনী জেলা, পূর্বে ভারতের ত্রিপুরা রাজ্য সীমান্ত এবং পশ্চিমে লাকসাম ও নাঙ্গলকোট উপজেলা অবস্থিত।',
    geography_en: 'Chauddagram spans 268.48 square kilometers. It is bordered by Cumilla Sadar Dakshin to the north, Feni district to the south, the Indian state of Tripura to the east, and Laksam and Nangalkot upazilas to the west.',
    administration_bn: '১৯০৫ সালে চৌদ্দগ্রাম থানা হিসেবে আত্মপ্রকাশ করে এবং ১৯৮৩ সালে এটিকে উপজেলায় রূপান্তর করা হয়। বর্তমানে এটি ১টি পৌরসভা ও ১৩টি ইউনিয়ন নিয়ে গঠিত।',
    administration_en: 'Chauddagram Thana was founded in 1905 and upgraded to an upazila in 1983. It currently comprises 1 municipality and 13 unions.',
    municipality_count: 1,
    union_count: 13,
    population_information: 'মোট জনসংখ্যা প্রায় ৪,৪৩,৬৪৮ জন (আদমশুমারি প্রতিবেদন অনুযায়ী)',
    important_places_bn: 'ঐতিহাসিক জগন্নাথ দিঘি, নোয়াব বাজার জামে মসজিদ, হযরত শাহ আব্দুল্লাহ (রহ.) মাজার, ঐতিহ্যবাহী বাতিসা হাট এবং বনশ্রী পার্ক।',
    important_places_en: 'Historic Jagannath Dighi, Nawab Bazar Jame Mosque, Hazrat Shah Abdullah Mazar, heritage Batisha Hat, and Bonoshree Park.',
    map_url: 'https://www.google.com/maps/place/Chauddagram+Upazila/@23.2201946,91.2618991,12z',
    official_website_url: 'https://chauddagram.comilla.gov.bd/',
    image_url: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=80',
    updated_at: now,
    updated_by: 'Fakrul Islam',
    publication_status: 'Published',
    admin_signature: 'fakrul_islam_priyo_chauddagram_auth'
  });

  // 3. Seed 13 Unions (NO SERIAL PREFIXES!)
  console.log('Setting up 13 Unions (clean names only)...');
  const unionData = [
    { id: 'alkara', bn: 'আলকরা', en: 'Alkara', order: 1 },
    { id: 'batisha', bn: 'বাতিসা', en: 'Batisha', order: 2 },
    { id: 'cheora', bn: 'চিওড়া', en: 'Cheora', order: 3 },
    { id: 'gholpasha', bn: 'ঘোলপাশা', en: 'Gholpasha', order: 4 },
    { id: 'gunabati', bn: 'গুনবতী', en: 'Gunabati', order: 5 },
    { id: 'jagannath_dighi', bn: 'জগন্নাথদিঘী', en: 'Jagannath Dighi', order: 6 },
    { id: 'kalikapur', bn: 'কালিকাপুর', en: 'Kalikapur', order: 7 },
    { id: 'kankapait', bn: 'কনকাপৈত', en: 'Kankapait', order: 8 },
    { id: 'kashinagar', bn: 'কাশিনগর', en: 'Kashinagar', order: 9 },
    { id: 'munshirhat', bn: 'মুন্সীরহাট', en: 'Munshirhat', order: 10 },
    { id: 'shuvapur', bn: 'শুভপুর', en: 'Shuvapur', order: 11 },
    { id: 'sreepur', bn: 'শ্রীপুর', en: 'Sreepur', order: 12 },
    { id: 'ujirpur', bn: 'উজিরপুর', en: 'Ujirpur', order: 13 },
  ];

  for (const u of unionData) {
    await setDoc(doc(db, 'unions', u.id), {
      id: u.id,
      name_bn: u.bn,
      name_en: u.en,
      order: u.order,
      status: 'Published',
      created_at: now,
      updated_at: now,
      admin_signature: 'fakrul_islam_priyo_chauddagram_auth'
    });
  }

  // 4. Seed Audit Log for initial setup
  await setDoc(doc(db, 'audit_logs', `audit_init_${Date.now()}`), {
    id: `audit_init_${Date.now()}`,
    admin_email: 'matelecom.cb71@gmail.com',
    admin_name: 'Fakrul Islam',
    action: 'INITIALIZE_SYSTEM',
    target_collection: 'system',
    target_id: 'init',
    details: 'Database seeded with Upazila profile, 13 unions, and primary admin configuration.',
    timestamp: now,
    admin_signature: 'fakrul_islam_priyo_chauddagram_auth'
  });

  // 5. Trigger live notice sync from chauddagram.comilla.gov.bd
  console.log('Triggering initial Government Notice synchronization...');
  try {
    const syncRes = await runNoticeSync('initial_database_seed');
    console.log('Notice Sync result:', syncRes.message);
  } catch (syncErr: any) {
    console.error('Notice Sync error (will keep non-fatal):', syncErr.message);
  }

  console.log('Database initialization completed successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed fatal error:', err);
  process.exit(1);
});
