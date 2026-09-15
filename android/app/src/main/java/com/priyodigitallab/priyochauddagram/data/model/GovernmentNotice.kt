package com.priyodigitallab.priyochauddagram.data.model

data class GovernmentNotice(
    val id: String = "",
    val source_domain: String = "chauddagram.comilla.gov.bd",
    val source_title_bn: String = "",
    val source_title_en: String = "",
    val published_date: String = "",
    val original_notice_url: String = "",
    val original_file_urls: List<String> = emptyList(),
    val source_hash: String = "",
    val status: String = "Published",
    val attribution_bn: String = "উৎস: চৌদ্দগ্রাম উপজেলা সরকারি ওয়েবসাইট",
    val attribution_en: String = "Source: Chauddagram Upazila Government Website",
    val created_at: String = "",
    val updated_at: String = ""
)
