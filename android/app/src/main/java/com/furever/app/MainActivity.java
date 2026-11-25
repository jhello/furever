package com.furever.app;

import android.app.Activity;
import android.app.AlertDialog;
import android.graphics.Color;
import android.graphics.Insets;
import android.graphics.drawable.ColorDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.JavascriptInterface;
import android.webkit.JsResult;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

/** Thin native shell around the shared web client in assets/www. */
public class MainActivity extends Activity {
    private static final String START_URL = "file:///android_asset/www/index.html";
    private static final int PAPER_COLOR = Color.rgb(255, 253, 251);

    private WebView webView;
    private FrameLayout root;
    private int barsLeft;
    private int barsTop;
    private int barsRight;
    private int barsBottom;
    private int imeBottom;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().setBackgroundDrawable(new ColorDrawable(PAPER_COLOR));
        WebView.setWebContentsDebuggingEnabled(true);

        root = new FrameLayout(this);
        root.setBackgroundColor(PAPER_COLOR);
        webView = new WebView(this);
        webView.setBackgroundColor(PAPER_COLOR);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(false);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
                dialogBuilder()
                        .setMessage(message)
                        .setPositiveButton(android.R.string.ok, (dialog, which) -> result.confirm())
                        .setOnCancelListener(dialog -> result.cancel())
                        .show();
                return true;
            }

            @Override
            public boolean onJsConfirm(WebView view, String url, String message, JsResult result) {
                dialogBuilder()
                        .setMessage(message)
                        .setPositiveButton(android.R.string.ok, (dialog, which) -> result.confirm())
                        .setNegativeButton(android.R.string.cancel, (dialog, which) -> result.cancel())
                        .setOnCancelListener(dialog -> result.cancel())
                        .show();
                return true;
            }
        });

        webView.addJavascriptInterface(new BarsBridge(), "AndroidBars");
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("file".equals(uri.getScheme())) return false;
                try {
                    startActivity(new android.content.Intent(android.content.Intent.ACTION_VIEW, uri));
                } catch (Exception ignored) {
                    // No browser installed; keep the WebView where it is.
                }
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                // The first insets callback may arrive before the page defines
                // __fureverTopInset, so repeat it once the document is ready.
                publishTopInset(barsTop);
            }
        });

        root.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);
        configureSystemBars();
        webView.loadUrl(START_URL);
    }

    private AlertDialog.Builder dialogBuilder() {
        int theme = android.R.style.Theme_Material_Light_Dialog_Alert;
        return new AlertDialog.Builder(this, theme);
    }

    /** Gives the page the top inset synchronously, before the first paint. */
    private class BarsBridge {
        @JavascriptInterface
        public int getTopInsetDp() {
            return Math.round(barsTop / getResources().getDisplayMetrics().density);
        }
    }

    /**
     * The root owns bottom/side insets only. The WebView extends under the
     * status bar and the page adds the top inset itself.
     */
    private void applyRootPadding() {
        if (root == null) return;
        root.setPadding(barsLeft, 0, barsRight, Math.max(barsBottom, imeBottom));
        publishTopInset(barsTop);
    }

    private void publishTopInset(int topPx) {
        if (webView == null) return;
        float topDp = topPx / getResources().getDisplayMetrics().density;
        webView.evaluateJavascript(
                "window.__fureverTopInset && window.__fureverTopInset(" + topDp + ")", null);
    }

    private void configureSystemBars() {
        Window window = getWindow();
        window.setStatusBarColor(Color.TRANSPARENT);
        window.setNavigationBarColor(Color.TRANSPARENT);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            window.setStatusBarContrastEnforced(false);
            window.setNavigationBarContrastEnforced(false);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false);
            WindowInsetsController controller = window.getInsetsController();
            if (controller != null) {
                int light = WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                        | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS;
                controller.setSystemBarsAppearance(light, light);
            }
            root.setOnApplyWindowInsetsListener((view, insets) -> {
                Insets bars = insets.getInsets(
                        WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                Insets ime = insets.getInsets(WindowInsets.Type.ime());
                barsLeft = bars.left;
                barsTop = bars.top;
                barsRight = bars.right;
                barsBottom = bars.bottom;
                imeBottom = ime.bottom;
                applyRootPadding();
                return WindowInsets.CONSUMED;
            });
        } else {
            int flags = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            }
            window.getDecorView().setSystemUiVisibility(flags);
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null) {
            // Let the web layer decide: subpages go to their parent, root exits.
            webView.evaluateJavascript(
                    "window.__fureverSystemBack && window.__fureverSystemBack()",
                    new ValueCallback<String>() {
                        @Override
                        public void onReceiveValue(String value) {
                            boolean handled = "true".equals(value);
                            if (!handled) {
                                if (webView != null && webView.canGoBack()) {
                                    webView.goBack();
                                } else {
                                    finish();
                                }
                            }
                        }
                    });
            return;
        }
        super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
