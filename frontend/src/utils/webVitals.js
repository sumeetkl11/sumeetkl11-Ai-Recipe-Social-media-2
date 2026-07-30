// frontend/src/utils/webVitals.js
// Reports Core Web Vitals using native PerformanceObserver (no library needed).
// Logs in dev, sends via sendBeacon in prod.

import logger from './logger';

const isProd = import.meta.env.PROD;
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const sendVital = (name, value, rating) => {
    const payload = { type: 'web-vital', name, value: Math.round(value), rating, url: location.href };
    if (!isProd) {
        console.info(`[Web Vital] ${name}: ${Math.round(value)}ms (${rating})`, payload);
        return;
    }
    try {
        navigator.sendBeacon(
            `${API}/client-error`,
            new Blob([JSON.stringify({ ...payload, message: `Web Vital: ${name}` })], { type: 'application/json' })
        );
    } catch { /* silently drop */ }
};

const rate = (name, value) => {
    const thresholds = { LCP: [2500, 4000], FID: [100, 300], CLS: [0.1, 0.25], FCP: [1800, 3000], TTFB: [800, 1800] };
    const [good, poor] = thresholds[name] ?? [Infinity, Infinity];
    return value <= good ? 'good' : value <= poor ? 'needs-improvement' : 'poor';
};

export function initWebVitals() {
    try {
        // LCP — Largest Contentful Paint
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const last = entries[entries.length - 1];
            if (last) sendVital('LCP', last.startTime, rate('LCP', last.startTime));
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // FID — First Input Delay (now INP in newer browsers, but FID widely supported)
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.processingStart) {
                    const fid = entry.processingStart - entry.startTime;
                    sendVital('FID', fid, rate('FID', fid));
                }
            }
        }).observe({ type: 'first-input', buffered: true });

        // CLS — Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) clsValue += entry.value;
            }
        }).observe({ type: 'layout-shift', buffered: true });

        // Report CLS on page hide
        addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                sendVital('CLS', clsValue * 1000, rate('CLS', clsValue)); // multiply by 1000 for rounding
            }
        }, { once: true });

        // FCP — First Contentful Paint
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                    sendVital('FCP', entry.startTime, rate('FCP', entry.startTime));
                }
            }
        }).observe({ type: 'paint', buffered: true });

        // TTFB — Time to First Byte
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.responseStart) {
                    sendVital('TTFB', entry.responseStart, rate('TTFB', entry.responseStart));
                }
            }
        }).observe({ type: 'navigation', buffered: true });

    } catch (err) {
        logger.warn('Web Vitals init failed (PerformanceObserver not supported)', { error: err?.message });
    }
}
