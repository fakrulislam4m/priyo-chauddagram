package com.priyodigitallab.priyochauddagram.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.priyodigitallab.priyochauddagram.data.model.*
import com.priyodigitallab.priyochauddagram.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminManagementScreen(
    profile: UpazilaProfile?,
    unions: List<UnionItem>,
    notices: List<GovernmentNotice>,
    campaigns: List<SponsoredCampaign>,
    syncRuns: List<SyncRun>,
    adminUsers: List<AdminUser>,
    onSaveProfile: (UpazilaProfile) -> Unit,
    onSaveUnion: (UnionItem) -> Unit,
    onToggleNoticeStatus: (String, String) -> Unit,
    onSaveCampaign: (SponsoredCampaign) -> Unit,
    onBack: () -> Unit
) {
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf(
        "উপজেলা তথ্য",
        "ইউনিয়নসমূহ",
        "সরকারি নোটিশ",
        "নোটিশ Sync",
        "Sponsored Slides",
        "Users & Roles",
        "Audit Log"
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("এডমিন ম্যানেজমেন্ট", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = White)
                        Text("Fakrul Islam (Primary Admin)", fontSize = 11.sp, color = White.copy(alpha = 0.8f))
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = OrangeDark)
            )
        },
        containerColor = SlateBackground
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Horizontal Tab Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(White)
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                tabs.forEachIndexed { index, title ->
                    val isSelected = selectedTab == index
                    Surface(
                        modifier = Modifier.clickable { selectedTab = index },
                        shape = RoundedCornerShape(10.dp),
                        color = if (isSelected) OrangeDark else SlateBackground
                    ) {
                        Text(
                            text = title,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                            color = if (isSelected) White else SlateText,
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                        )
                    }
                }
            }

            // Tab Content
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp)
            ) {
                when (selectedTab) {
                    0 -> UpazilaInfoPanel(profile, onSaveProfile)
                    1 -> UnionsPanel(unions, onSaveUnion)
                    2 -> NoticesPanel(notices, onToggleNoticeStatus)
                    3 -> NoticeSyncPanel(syncRuns)
                    4 -> SponsoredPanel(campaigns, onSaveCampaign)
                    5 -> UsersAndRolesPanel(adminUsers)
                    6 -> AuditLogPanel()
                }
            }
        }
    }
}

@Composable
fun UpazilaInfoPanel(profile: UpazilaProfile?, onSave: (UpazilaProfile) -> Unit) {
    var nameBn by remember { mutableStateOf(profile?.name_bn ?: "চৌদ্দগ্রাম") }
    var nameEn by remember { mutableStateOf(profile?.name_en ?: "Chauddagram") }
    var taglineBn by remember { mutableStateOf(profile?.tagline_bn ?: "আমাদের উপজেলা, আমাদের গর্ব") }
    var descBn by remember { mutableStateOf(profile?.description_bn ?: "") }

    Surface(shape = RoundedCornerShape(16.dp), color = White, shadowElevation = 1.dp) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("উপজেলা পরিচিতি সম্পাদনা", fontWeight = FontWeight.Bold, fontSize = 14.sp)

            OutlinedTextField(
                value = nameBn,
                onValueChange = { nameBn = it },
                label = { Text("উপজেলার নাম (বাংলা)") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = nameEn,
                onValueChange = { nameEn = it },
                label = { Text("Name (English)") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = taglineBn,
                onValueChange = { taglineBn = it },
                label = { Text("ট্যাগলাইন (বাংলা)") },
                modifier = Modifier.fillMaxWidth()
            )

            OutlinedTextField(
                value = descBn,
                onValueChange = { descBn = it },
                label = { Text("সংক্ষিপ্ত বিবরণ") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 3
            )

            Button(
                onClick = {
                    val updated = (profile ?: UpazilaProfile()).copy(
                        name_bn = nameBn,
                        name_en = nameEn,
                        tagline_bn = taglineBn,
                        description_bn = descBn
                    )
                    onSave(updated)
                },
                colors = ButtonDefaults.buttonColors(containerColor = DeepTeal),
                modifier = Modifier.align(Alignment.End)
            ) {
                Text("সংরক্ষণ করুন")
            }
        }
    }
}

@Composable
fun UnionsPanel(unions: List<UnionItem>, onSave: (UnionItem) -> Unit) {
    Surface(shape = RoundedCornerShape(16.dp), color = White, shadowElevation = 1.dp) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("১৩টি ইউনিয়ন পরিচালনা (কোনো ক্রমিক উপসর্গ ছাড়া)", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Spacer(modifier = Modifier.height(10.dp))
            unions.forEach { union ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(union.name_bn, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                    Text(union.name_en, fontSize = 12.sp, color = SlateMuted)
                }
                Divider(color = SlateBackground)
            }
        }
    }
}

@Composable
fun NoticesPanel(notices: List<GovernmentNotice>, onToggleStatus: (String, String) -> Unit) {
    Surface(shape = RoundedCornerShape(16.dp), color = White, shadowElevation = 1.dp) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("সরকারি নোটিশ প্রকাশনা ও নিয়ন্ত্রণ", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Spacer(modifier = Modifier.height(10.dp))
            notices.forEach { notice ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(notice.source_title_bn, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        Text(notice.published_date, fontSize = 10.sp, color = SlateMuted)
                    }
                    Button(
                        onClick = { onToggleStatus(notice.id, notice.status) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (notice.status == "Published") EmeraldGreen else SlateMuted
                        )
                    ) {
                        Text(if (notice.status == "Published") "Published" else "Hidden", fontSize = 10.sp)
                    }
                }
                Divider(color = SlateBackground)
            }
        }
    }
}

@Composable
fun NoticeSyncPanel(syncRuns: List<SyncRun>) {
    Surface(shape = RoundedCornerShape(16.dp), color = White, shadowElevation = 1.dp) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("সরকারি নোটিশ সিঙ্ক নিয়ন্ত্রণ", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Spacer(modifier = Modifier.height(6.dp))
            Text("উৎস: chauddagram.comilla.gov.bd/pages/notices", fontSize = 12.sp, color = DeepTeal)
            Spacer(modifier = Modifier.height(12.dp))

            Button(
                onClick = { /* Trigger background sync */ },
                colors = ButtonDefaults.buttonColors(containerColor = BrandOrange)
            ) {
                Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("এখনই Sync করুন")
            }

            Spacer(modifier = Modifier.height(16.dp))
            Text("সিঙ্ক হিস্ট্রি:", fontWeight = FontWeight.Bold, fontSize = 12.sp)
            syncRuns.take(5).forEach { run ->
                Text(
                    "তারিখ: ${run.started_at} | সংগৃহীত: ${run.notices_fetched} | স্ট্যাটাস: ${run.status}",
                    fontSize = 11.sp,
                    color = SlateMuted,
                    modifier = Modifier.padding(vertical = 2.dp)
                )
            }
        }
    }
}

@Composable
fun SponsoredPanel(campaigns: List<SponsoredCampaign>, onSave: (SponsoredCampaign) -> Unit) {
    Surface(shape = RoundedCornerShape(16.dp), color = White, shadowElevation = 1.dp) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("বাণিজ্যিক স্পন্সরড প্রচারণা ও বিজ্ঞাপন", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Spacer(modifier = Modifier.height(8.dp))
            campaigns.forEach { camp ->
                Column(modifier = Modifier.padding(vertical = 6.dp)) {
                    Text(camp.title_bn, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Text("Payment: ${camp.payment_status} | Approval: ${camp.approval_status} | Status: ${camp.publication_status}", fontSize = 10.sp, color = DeepTeal)
                }
                Divider(color = SlateBackground)
            }
        }
    }
}

@Composable
fun UsersAndRolesPanel(adminUsers: List<AdminUser>) {
    Surface(shape = RoundedCornerShape(16.dp), color = White, shadowElevation = 1.dp) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("ব্যবহারকারী ও ভূমিকা (Users & Roles)", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Spacer(modifier = Modifier.height(8.dp))
            Text("Primary Admin: Fakrul Islam (matelecom.cb71@gmail.com)", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = OrangeDark)
            Spacer(modifier = Modifier.height(8.dp))
            adminUsers.forEach { user ->
                Text("${user.name} (${user.email}) - ${user.role}", fontSize = 11.sp, color = SlateText)
            }
        }
    }
}

@Composable
fun AuditLogPanel() {
    Surface(shape = RoundedCornerShape(16.dp), color = White, shadowElevation = 1.dp) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("অডিট লগ (Audit Log)", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Spacer(modifier = Modifier.height(8.dp))
            Text("সকল এডমিন সম্পাদনার টাইমস্ট্যাম্পযুক্ত ইতিহাস সংরক্ষণ করা হয়।", fontSize = 11.sp, color = SlateMuted)
        }
    }
}
