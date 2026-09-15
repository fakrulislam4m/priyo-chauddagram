package com.priyodigitallab.priyochauddagram.data.model

data class SponsoredCampaign(
    val id: String = "",
    val advertiser_type: String = "Doctor", // Doctor, Hospital, Clinic, Diagnostic, Pharmacy, Shop, Business
    val advertiser_name: String = "",
    val title_bn: String = "",
    val title_en: String = "",
    val specialty_bn: String? = null,
    val specialty_en: String? = null,
    val chamber_days: String? = null,
    val chamber_start_time: String? = null,
    val chamber_end_time: String? = null,
    val services_bn: String? = null,
    val description_bn: String? = null,
    val poster_image_url: String? = null,
    val banner_image_url: String? = null,
    val phone: String = "",
    val address_bn: String = "",
    val address_en: String = "",
    val payment_reference: String? = null,
    val payment_status: String = "Unpaid", // Unpaid, Submitted, Verified, Rejected
    val approval_status: String = "Draft", // Draft, Pending, Approved, Rejected
    val publication_status: String = "Draft", // Draft, Published, Paused, Expired, Archived
    val campaign_start_date: String = "",
    val campaign_end_date: String = "",
    val display_order: Int = 1,
    val created_at: String = "",
    val updated_at: String = "",
    val updated_by: String = "Fakrul Islam"
)
