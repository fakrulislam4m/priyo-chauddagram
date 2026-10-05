package com.priyodigitallab.priyochauddagram

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.ProgressBar
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.webkit.WebViewAssetLoader

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val rootLayout = FrameLayout(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(android.graphics.Color.parseColor("#134E4A"))
        }

        // Configure WebViewAssetLoader to serve local assets under virtual HTTPS domain
        // This solves Chromium's file:/// CORS restrictions on ES modules completely!
        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        webView = WebView(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                useWideViewPort = true
                loadWithOverviewMode = true
                cacheMode = WebSettings.LOAD_DEFAULT
                setSupportZoom(false)
                builtInZoomControls = false
                displayZoomControls = false
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                userAgentString = "${settings.userAgentString} PriyoChauddagramApp/1.0"
            }

            webViewClient = object : WebViewClient() {
                override fun shouldInterceptRequest(
                    view: WebView?,
                    request: WebResourceRequest?
                ): WebResourceResponse? {
                    val url = request?.url ?: return null
                    return assetLoader.shouldInterceptRequest(url)
                }

                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    val url = request?.url?.toString() ?: return false
                    return handleExternalUrl(url)
                }

                @Deprecated("Deprecated in Java")
                override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                    if (url == null) return false
                    return handleExternalUrl(url)
                }

                override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                    super.onPageStarted(view, url, favicon)
                    progressBar.visibility = View.VISIBLE
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    progressBar.visibility = View.GONE
                }
            }

            webChromeClient = object : WebChromeClient() {
                override fun onProgressChanged(view: WebView?, newProgress: Int) {
                    progressBar.progress = newProgress
                    if (newProgress >= 100) {
                        progressBar.visibility = View.GONE
                    }
                }

                override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                    android.util.Log.d("PriyoChauddagram", "${consoleMessage?.message()} [line: ${consoleMessage?.lineNumber()}]")
                    return true
                }
            }
        }

        progressBar = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                10
            )
            max = 100
            visibility = View.VISIBLE
        }

        rootLayout.addView(webView)
        rootLayout.addView(progressBar)
        setContentView(rootLayout)

        // Native back navigation: go back within the app instead of closing
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })

        if (savedInstanceState == null) {
            // Load the bundled app securely via the virtual HTTPS domain
            webView.loadUrl("https://appassets.androidplatform.net/assets/index.html")
        } else {
            webView.restoreState(savedInstanceState)
        }
    }

    private fun handleExternalUrl(url: String): Boolean {
        // Direct phone dialing for emergency services, police, hospital, and blood donors
        if (url.startsWith("tel:")) {
            try {
                val intent = Intent(Intent.ACTION_DIAL, Uri.parse(url))
                startActivity(intent)
                return true
            } catch (e: Exception) {
                return false
            }
        }

        // Email
        if (url.startsWith("mailto:")) {
            try {
                val intent = Intent(Intent.ACTION_SENDTO, Uri.parse(url))
                startActivity(intent)
                return true
            } catch (e: Exception) {
                return false
            }
        }

        // WhatsApp, SMS, Google Maps
        if (url.startsWith("sms:") || url.contains("api.whatsapp.com") || url.contains("wa.me") || url.startsWith("geo:")) {
            try {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                startActivity(intent)
                return true
            } catch (e: Exception) {
                return false
            }
        }

        // Keep local assets navigation inside WebView
        if (url.startsWith("https://appassets.androidplatform.net")) {
            return false
        }

        return false
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
