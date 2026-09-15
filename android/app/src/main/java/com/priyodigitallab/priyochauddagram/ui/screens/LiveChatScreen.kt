package com.priyodigitallab.priyochauddagram.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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

data class ChatMessageItem(
    val id: String,
    val text: String,
    val senderName: String,
    val senderUnion: String,
    val isAdmin: Boolean = false,
    val time: String = "এইমাত্র",
    val likes: Int = 0
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LiveChatScreen(
    onBack: () -> Unit
) {
    var messageText by remember { mutableStateOf("") }
    var messages by remember {
        mutableStateOf(
            listOf(
                ChatMessageItem(
                    id = "1",
                    text = "আসসালামু আলাইকুম। প্রিয় চৌদ্দগ্রাম অ্যাপের সকল নাগরিক ও প্রবাসীদের লাইভ আড্ডায় স্বাগতম!",
                    senderName = "ফখরুল ইসলাম (Fakrul Islam)",
                    senderUnion = "চৌদ্দগ্রাম পৌরসভা",
                    isAdmin = true,
                    time = "১০:৩০ AM",
                    likes = 14
                ),
                ChatMessageItem(
                    id = "2",
                    text = "কাশীনগর ইউনিয়ন থেকে শুভেচ্ছা! চৌদ্দগ্রামবাসীর জন্য এমন লাইভ আড্ডার সুবিধা খুব দারুণ হয়েছে।",
                    senderName = "তানভীর আহমেদ",
                    senderUnion = "কাশীনগর",
                    time = "১০:৪৫ AM",
                    likes = 6
                ),
                ChatMessageItem(
                    id = "3",
                    text = "শুভপুর থেকে যুক্ত হলাম। প্রবাসে থেকেও নিজ উপজেলার সব খবর একসাথে পাচ্ছি।",
                    senderName = "রেজাউল করিম (প্রবাসী)",
                    senderUnion = "শুভপুর",
                    time = "১১:১০ AM",
                    likes = 9
                )
            )
        )
    }

    val unionChips = listOf("সব আড্ডা", "পৌরসভা", "কাশীনগর", "শুভপুর", "বাতিসা", "চিওড়া", "প্রবাসী")
    var selectedChip by remember { mutableStateOf("সব আড্ডা") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                "চৌদ্দগ্রাম লাইভ আড্ডা",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFF4ADE80))
                            )
                        }
                        Text(
                            "১৩ ইউনিয়ন ও প্রবাসীদের মুক্ত ফোরাম",
                            fontSize = 11.sp,
                            color = Color(0xFFA7F3D0)
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF065F46)
                )
            )
        },
        bottomBar = {
            Surface(
                shadowElevation = 8.dp,
                color = Color.White
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = messageText,
                        onValueChange = { messageText = it },
                        placeholder = { Text("আড্ডায় বার্তা লিখুন...", fontSize = 13.sp) },
                        modifier = Modifier
                            .weight(1f)
                            .padding(end = 8.dp),
                        shape = RoundedCornerShape(24.dp),
                        singleLine = true
                    )
                    IconButton(
                        onClick = {
                            if (messageText.isNotBlank()) {
                                messages = messages + ChatMessageItem(
                                    id = System.currentTimeMillis().toString(),
                                    text = messageText.trim(),
                                    senderName = "চৌদ্দগ্রামের নাগরিক",
                                    senderUnion = "চৌদ্দগ্রাম",
                                    time = "এইমাত্র"
                                )
                                messageText = ""
                            }
                        },
                        modifier = Modifier
                            .clip(CircleShape)
                            .background(Color(0xFF065F46))
                    ) {
                        Icon(Icons.Default.Send, contentDescription = "Send", tint = Color.White)
                    }
                }
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Color(0xFFF1F5F9))
        ) {
            // Union filter chips
            LazyRow(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .padding(horizontal = 8.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                items(unionChips) { chip ->
                    FilterChip(
                        selected = selectedChip == chip,
                        onClick = { selectedChip = chip },
                        label = { Text(chip, fontSize = 11.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Color(0xFF065F46),
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }

            // Message Stream
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(messages) { msg ->
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(bottom = 2.dp)
                        ) {
                            Text(
                                msg.senderName,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF334155)
                            )
                            if (msg.isAdmin) {
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    "অ্যাডমিন",
                                    fontSize = 9.sp,
                                    color = Color(0xFF065F46),
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier
                                        .background(Color(0xFFD1FAE5), RoundedCornerShape(4.dp))
                                        .padding(horizontal = 4.dp, vertical = 1.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                msg.senderUnion,
                                fontSize = 10.sp,
                                color = Color(0xFF64748B)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                msg.time,
                                fontSize = 9.sp,
                                color = Color(0xFF94A3B8)
                            )
                        }

                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (msg.isAdmin) Color(0xFFECFDF5) else Color.White
                            ),
                            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text(
                                    msg.text,
                                    fontSize = 13.sp,
                                    color = Color(0xFF1E293B),
                                    lineHeight = 18.sp
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Row(
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("❤️ ${msg.likes}", fontSize = 10.sp, color = Color(0xFF64748B))
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
