package com.priyodigitallab.priyochauddagram.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

// Default bright light theme with deep teal, green, orange, white, and pale blue
private val LightColorScheme = lightColorScheme(
    primary = DeepTeal,
    onPrimary = White,
    primaryContainer = PaleBlue,
    onPrimaryContainer = DeepTealDark,
    secondary = BrandOrange,
    onSecondary = White,
    secondaryContainer = PaleBlue,
    tertiary = EmeraldGreen,
    background = SlateBackground,
    surface = White,
    onBackground = SlateText,
    onSurface = SlateText
)

@Composable
fun PriyoChauddagramTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = Typography,
        content = content
    )
}
