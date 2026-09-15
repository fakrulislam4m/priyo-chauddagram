package com.priyodigitallab.priyochauddagram.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.priyodigitallab.priyochauddagram.data.model.*
import com.priyodigitallab.priyochauddagram.data.repository.AuthRepository
import com.priyodigitallab.priyochauddagram.data.repository.ChauddagramRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class UiState(
    val profile: UpazilaProfile? = null,
    val unions: List<UnionItem> = emptyList(),
    val notices: List<GovernmentNotice> = emptyList(),
    val campaigns: List<SponsoredCampaign> = emptyList(),
    val syncRuns: List<SyncRun> = emptyList(),
    val adminUsers: List<AdminUser> = emptyList(),
    val isAdmin: Boolean = false,
    val isLoading: Boolean = true,
    val language: String = "bn" // "bn" or "en"
)

class MainViewModel(
    private val repository: ChauddagramRepository = ChauddagramRepository(),
    private val authRepository: AuthRepository = AuthRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(UiState())
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    init {
        loadData()
    }

    private fun loadData() {
        viewModelScope.launch {
            // Check current user admin status
            val currentUser = authRepository.currentUser
            val isAdmin = authRepository.checkAdminPrivilege(currentUser?.email)
            _uiState.value = _uiState.value.copy(isAdmin = isAdmin)
        }

        viewModelScope.launch {
            repository.getUpazilaProfileFlow().collect { profile ->
                _uiState.value = _uiState.value.copy(profile = profile, isLoading = false)
            }
        }

        viewModelScope.launch {
            repository.getUnionsFlow().collect { unions ->
                _uiState.value = _uiState.value.copy(unions = unions)
            }
        }

        viewModelScope.launch {
            repository.getGovernmentNoticesFlow().collect { notices ->
                _uiState.value = _uiState.value.copy(notices = notices)
            }
        }

        viewModelScope.launch {
            repository.getSponsoredCampaignsFlow().collect { campaigns ->
                _uiState.value = _uiState.value.copy(campaigns = campaigns)
            }
        }

        viewModelScope.launch {
            repository.getSyncRunsFlow().collect { runs ->
                _uiState.value = _uiState.value.copy(syncRuns = runs)
            }
        }

        viewModelScope.launch {
            repository.getAdminUsersFlow().collect { admins ->
                _uiState.value = _uiState.value.copy(adminUsers = admins)
            }
        }
    }

    fun toggleLanguage() {
        val next = if (_uiState.value.language == "bn") "en" else "bn"
        _uiState.value = _uiState.value.copy(language = next)
    }

    fun saveUpazilaProfile(profile: UpazilaProfile) {
        viewModelScope.launch {
            val userEmail = authRepository.currentUser?.email ?: "matelecom.cb71@gmail.com"
            repository.saveUpazilaProfile(profile, userEmail)
        }
    }

    fun saveUnion(union: UnionItem) {
        viewModelScope.launch {
            repository.saveUnion(union)
        }
    }

    fun toggleNoticeStatus(noticeId: String, currentStatus: String) {
        viewModelScope.launch {
            val next = if (currentStatus == "Published") "Hidden" else "Published"
            repository.updateNoticeStatus(noticeId, next)
        }
    }

    fun saveCampaign(campaign: SponsoredCampaign) {
        viewModelScope.launch {
            repository.saveSponsoredCampaign(campaign)
        }
    }
}
