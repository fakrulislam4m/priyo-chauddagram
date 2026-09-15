package com.priyodigitallab.priyochauddagram.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.priyodigitallab.priyochauddagram.data.model.*
import com.priyodigitallab.priyochauddagram.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    profile: UpazilaProfile?,
    unions: List<UnionItem>,
    notices: List<GovernmentNotice>,
    campaigns: List<SponsoredCampaign>,
    isAdmin: Boolean,
    language: String,
    onToggleLanguage: () -> Unit,
    onNavigateAdmin: () -> Unit,
    onSelectUnion: (UnionItem) -> Unit,
    onSelectNotice: (GovernmentNotice) -> Unit,
    onSelectCampaign: (SponsoredCampaign) -> Unit,
    onOpenCategory: (String) -> Unit
) {
    val context = LocalContext.current
    val isBn = language == "bn"
    val publishedUnions = unions.filter { it.status == "Published" }
    val publishedNotices = notices.filter { it.status == "Published" }
    val publishedCampaigns = campaigns.filter { 
        it.publication_status == "Published" && it.payment_status == "Verified" && it.approval_status == "Approved" 
    }

    Scaffold(
        topBar = {
            // Header App Bar: Bengali name "প্রিয় চৌদ্দগ্রাম", NO "কুমিল্লা" beside app name!
            TopAppBar(
                title = {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = if (isBn) "প্রিয় চৌদ্দগ্রাম" else "Priyo Chauddagram",
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp,
                                color = White
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(White.copy(alpha = 0.2f))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = if (isBn) "উপজেলা" else "Upazila",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = White
                                )
                            }
                        }
                        Text(
                            text = if (isBn) "নাগরিক তথ্য ও সেবা পোর্টাল" else "Civic Information & Portal",
                            fontSize = 11.sp,
                            color = PaleBlue
                        )
                    }
                },
                actions = {
                    // Language Switcher Button
                    TextButton(
                        onClick = onToggleLanguage,
                        colors = ButtonDefaults.textButtonColors(contentColor = White)
                    ) {
                        Text(
                            text = if (isBn) "বাং/EN" else "EN/বাং",
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp
                        )
                    }

                    // Admin Shortcut icon
                    IconButton(onClick = onNavigateAdmin) {
                        Icon(
                            imageVector = Icons.Default.Shield,
                            contentDescription = "Admin",
                            tint = if (isAdmin) BrandOrange else White.copy(alpha = 0.7f)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = DeepTeal
                )
            )
        },
        containerColor = SlateBackground
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(bottom = 32.dp)
        ) {
            // 1. Hero Section (Tagline: "আমাদের উপজেলা, আমাদের গর্ব")
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(DeepTeal, DeepTealDark)
                        )
                    )
                    .padding(16.dp)
            ) {
                Column {
                    Text(
                        text = if (isBn) "আমাদের উপজেলা, আমাদের গর্ব" else "Our Upazila, Our Pride",
                        color = GreenLight,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = if (isBn) "ঐতিহাসিক চৌদ্দগ্রামের ডিজিটাল বাতায়ন" else "Digital Gateway of Historic Chauddagram",
                        color = White,
                        fontSize = 19.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = if (isBn) 
                            "প্রশাসনিক তথ্য, সরকারি নোটিশ ও স্থানীয় সেবা এক ক্লিকেই জানুন।" 
                            else "Official notices, administrative details & citizen updates.",
                        color = White.copy(alpha = 0.85f),
                        fontSize = 13.sp
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    // 2 Stat Badges
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Surface(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            color = White.copy(alpha = 0.12f)
                        ) {
                            Column(
                                modifier = Modifier.padding(vertical = 8.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text("১ টি", color = White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                Text(if (isBn) "পৌরসভা" else "Municipality", color = White.copy(alpha = 0.8f), fontSize = 11.sp)
                            }
                        }

                        Surface(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            color = White.copy(alpha = 0.12f)
                        ) {
                            Column(
                                modifier = Modifier.padding(vertical = 8.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text("১৩ টি", color = White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                Text(if (isBn) "ইউনিয়ন" else "Unions", color = White.copy(alpha = 0.8f), fontSize = 11.sp)
                            }
                        }
                    }
                }
            }

            // 2. Admin Management Card (Prominently placed below hero section)
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 10.dp)
                    .clickable { onNavigateAdmin() },
                shape = RoundedCornerShape(16.dp),
                color = White,
                shadowElevation = 1.dp
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .clip(CircleShape)
                            .background(BrandOrange.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.AdminPanelSettings,
                            contentDescription = "Admin",
                            tint = OrangeDark
                        )
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = if (isBn) "এডমিন ম্যানেজমেন্ট প্যানেল" else "Admin Management Panel",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = SlateText
                        )
                        Text(
                            text = if (isAdmin) 
                                (if (isBn) "ডাটাবেজ ও নোটিশ নিয়ন্ত্রণ করুন" else "Manage database, notices & campaigns")
                                else (if (isBn) "শুধুমাত্র অনুমোদিত এডমিনদের জন্য" else "Restricted to authorized administrators"),
                            fontSize = 11.sp,
                            color = SlateMuted
                        )
                    }

                    Icon(
                        imageVector = Icons.Default.ChevronRight,
                        contentDescription = "Go",
                        tint = SlateMuted
                    )
                }
            }

            // 3. Bounded Horizontal Sponsored Carousel (Strictly isolated horizontal scroll)
            if (publishedCampaigns.isNotEmpty()) {
                Column(modifier = Modifier.padding(top = 8.dp, bottom = 4.dp)) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(BrandOrange)
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = if (isBn) "বিজ্ঞাপন / SPONSORED" else "SPONSORED",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = White
                                )
                            }
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (isBn) "প্রচারণা ও সেবা" else "Commercial Feature",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = SlateMuted
                            )
                        }
                    }

                    // Horizontal Banner Row
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState())
                            .padding(horizontal = 16.dp, vertical = 6.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        publishedCampaigns.forEach { camp ->
                            Surface(
                                modifier = Modifier
                                    .width(280.dp)
                                    .clickable { onSelectCampaign(camp) },
                                shape = RoundedCornerShape(16.dp),
                                color = White,
                                shadowElevation = 1.dp
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(4.dp))
                                                .background(BrandOrange)
                                                .padding(horizontal = 5.dp, vertical = 1.dp)
                                        ) {
                                            Text("বিজ্ঞাপন", fontSize = 8.sp, color = White, fontWeight = FontWeight.Bold)
                                        }
                                        Text(camp.advertiser_type, fontSize = 10.sp, color = DeepTeal, fontWeight = FontWeight.Bold)
                                    }
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = camp.title_bn,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp,
                                        color = SlateText,
                                        maxLines = 1
                                    )
                                    if (!camp.specialty_bn.isNullOrBlank()) {
                                        Text(
                                            text = camp.specialty_bn,
                                            fontSize = 11.sp,
                                            color = SlateMuted,
                                            maxLines = 1
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.Phone, contentDescription = null, tint = EmeraldGreen, modifier = Modifier.size(12.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(camp.phone, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = SlateText)
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // 4. 6-Category Grid (Icon above Bengali label, English subtitle below)
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = if (isBn) "সেবা ও তথ্য বিভাগ" else "Service Categories",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = SlateText
                )
                Spacer(modifier = Modifier.height(10.dp))

                val categories = listOf(
                    Triple("profile", if (isBn) "উপজেলা পরিচিতি" else "Upazila Profile", if (isBn) "ইতিহাস ও ঐতিহ্য" else "History & Details"),
                    Triple("unions", if (isBn) "ইউনিয়নসমূহ" else "Unions", if (isBn) "১৩টি ইউনিয়ন" else "13 Clean Unions"),
                    Triple("notices", if (isBn) "সরকারি নোটিশ" else "Govt Notices", if (isBn) "লাইভ আপডেট" else "Portal Synced"),
                    Triple("links", if (isBn) "সরকারি লিংক" else "Official Links", if (isBn) "জাতীয় বাতায়ন" else "Verified Portals"),
                    Triple("doctors", if (isBn) "ডাক্তার ও হাসপাতাল" else "Doctors & Clinics", if (isBn) "বাণিজ্যিক বিজ্ঞাপন" else "Sponsored"),
                    Triple("shops", if (isBn) "দোকান ও ব্যবসা" else "Shops & Business", if (isBn) "স্থানীয় প্রতিষ্ঠান" else "Local Directory")
                )

                // 2x3 Grid
                for (i in categories.indices step 2) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        for (j in 0..1) {
                            val idx = i + j
                            if (idx < categories.size) {
                                val cat = categories[idx]
                                Surface(
                                    modifier = Modifier
                                        .weight(1f)
                                        .padding(vertical = 5.dp)
                                        .clickable { onOpenCategory(cat.first) },
                                    shape = RoundedCornerShape(14.dp),
                                    color = White,
                                    shadowElevation = 1.dp
                                ) {
                                    Column(
                                        modifier = Modifier.padding(12.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(36.dp)
                                                .clip(CircleShape)
                                                .background(PaleBlue),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            val icon = when (cat.first) {
                                                "profile" -> Icons.Default.AccountBalance
                                                "unions" -> Icons.Default.Layers
                                                "notices" -> Icons.Default.Description
                                                "links" -> Icons.Default.Language
                                                "doctors" -> Icons.Default.LocalHospital
                                                else -> Icons.Default.Store
                                            }
                                            Icon(icon, contentDescription = null, tint = DeepTeal, modifier = Modifier.size(18.dp))
                                        }
                                        Spacer(modifier = Modifier.height(6.dp))
                                        Text(
                                            text = cat.second,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 12.sp,
                                            color = SlateText,
                                            textAlign = TextAlign.Center
                                        )
                                        Text(
                                            text = cat.third,
                                            fontSize = 10.sp,
                                            color = SlateMuted,
                                            textAlign = TextAlign.Center
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // 5. Government Notices Section
            Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (isBn) "সরকারি নোটিশ (লাইভ)" else "Government Notices",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = SlateText
                    )
                    TextButton(onClick = { onOpenCategory("notices") }) {
                        Text(if (isBn) "সব দেখুন" else "View All", fontSize = 12.sp, color = DeepTeal)
                    }
                }

                publishedNotices.take(4).forEach { notice ->
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                            .clickable { onSelectNotice(notice) },
                        shape = RoundedCornerShape(12.dp),
                        color = White,
                        shadowElevation = 1.dp
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(
                                text = notice.source_title_bn,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                color = SlateText
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(notice.published_date, fontSize = 10.sp, color = SlateMuted)
                                Text(notice.attribution_bn, fontSize = 10.sp, color = DeepTeal)
                            }
                        }
                    }
                }
            }

            // 6. 13 Unions Section (Clean Display Names ONLY)
            Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (isBn) "ইউনিয়নসমূহ (১৩টি)" else "Unions of Chauddagram",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = SlateText
                    )
                    TextButton(onClick = { onOpenCategory("unions") }) {
                        Text(if (isBn) "তালিকা" else "List", fontSize = 12.sp, color = EmeraldGreen)
                    }
                }

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    publishedUnions.forEach { union ->
                        Surface(
                            modifier = Modifier.clickable { onSelectUnion(union) },
                            shape = RoundedCornerShape(10.dp),
                            color = PaleBlue.copy(alpha = 0.6f)
                        ) {
                            Text(
                                text = if (isBn) union.name_bn else union.name_en,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = DeepTealDark
                            )
                        }
                    }
                }
            }

            // 7. Developer & Civic Community Initiative Disclaimer
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(16.dp),
                color = White,
                shadowElevation = 1.dp
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = if (isBn) "অ্যাপ সম্পর্কিত তথ্য" else "About the Application",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = SlateText
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "পরিকল্পনা ও বাস্তবায়ন: ফখরুল ইসলাম (Fakrul Islam)\nPriyo Digital Lab, চৌদ্দগ্রাম, কুমিল্লা\nইমেইল: matelecom.cb71@gmail.com",
                        fontSize = 11.sp,
                        color = SlateMuted,
                        lineHeight = 16.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "ঘোষণা: এটি চৌদ্দগ্রামের সর্বসাধারণের জন্য একটি উন্মুক্ত নাগরিক সেবা উদ্যোগ। এটি বাংলাদেশ সরকারের কোনো সরকারি দপ্তর বা প্রতিনিধির অফিসিয়াল অ্যাপ্লিকেশন নয়।",
                        fontSize = 10.sp,
                        color = SlateMuted.copy(alpha = 0.8f),
                        lineHeight = 14.sp
                    )
                }
            }
        }
    }
}
