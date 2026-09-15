package com.priyodigitallab.priyochauddagram

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.runtime.*
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.priyodigitallab.priyochauddagram.ui.screens.AdminManagementScreen
import com.priyodigitallab.priyochauddagram.ui.screens.HomeScreen
import com.priyodigitallab.priyochauddagram.ui.screens.LiveChatScreen
import com.priyodigitallab.priyochauddagram.ui.theme.PriyoChauddagramTheme
import com.priyodigitallab.priyochauddagram.ui.viewmodel.MainViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            PriyoChauddagramTheme {
                val uiState by viewModel.uiState.collectAsState()
                val navController = rememberNavController()

                NavHost(navController = navController, startDestination = "home") {
                    composable("home") {
                        HomeScreen(
                            profile = uiState.profile,
                            unions = uiState.unions,
                            notices = uiState.notices,
                            campaigns = uiState.campaigns,
                            isAdmin = uiState.isAdmin,
                            language = uiState.language,
                            onToggleLanguage = { viewModel.toggleLanguage() },
                            onNavigateAdmin = {
                                if (uiState.isAdmin) {
                                    navController.navigate("admin")
                                }
                            },
                            onSelectUnion = { /* Open union modal / details */ },
                            onSelectNotice = { /* Open notice details */ },
                            onSelectCampaign = { /* Open campaign details */ },
                            onOpenCategory = { categoryId ->
                                if (categoryId == "chat") {
                                    navController.navigate("chat")
                                }
                            }
                        )
                    }

                    composable("chat") {
                        LiveChatScreen(
                            onBack = { navController.popBackStack() }
                        )
                    }

                    composable("admin") {
                        AdminManagementScreen(
                            profile = uiState.profile,
                            unions = uiState.unions,
                            notices = uiState.notices,
                            campaigns = uiState.campaigns,
                            syncRuns = uiState.syncRuns,
                            adminUsers = uiState.adminUsers,
                            onSaveProfile = { viewModel.saveUpazilaProfile(it) },
                            onSaveUnion = { viewModel.saveUnion(it) },
                            onToggleNoticeStatus = { id, status -> viewModel.toggleNoticeStatus(id, status) },
                            onSaveCampaign = { viewModel.saveCampaign(it) },
                            onBack = { navController.popBackStack() }
                        )
                    }
                }
            }
        }
    }
}

