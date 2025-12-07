ad# Asset Size & Format Guide

Use this reference to export or create images for your portfolio. Consistent dimensions ensure the layout remains stable and looks premium.

## Global Assets

| Asset Type | Location | Recommended Size | Format | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Favicon** | Browser Tab | 32x32 px | `.png` or `.ico` | Also 16x16, 512x512 for PWA |
| **OG Image** | Social Share | 1200x630 px | `.jpg` | Aspect ratio ~1.91:1 |

## Project Gallery (Index Page)

| Asset Type | CSS Class | Aspect Ratio | Rec. Dimensions | Format | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Project Thumbnail** | `.image-wrapper` | **4:3** | **1200x900 px** | `.jpg` / `.webp` | High quality, optimized. |

## Project Detail Pages

These assets appear within individual project case studies (e.g., `projects/01-nike-branding/nike-global.html`).

| Asset Type | CSS Class | Aspect Ratio | Rec. Dimensions | Format | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero / Full Width** | `.visual-full` | **16:9** | **1920x1080 px** | `.jpg` / `.webp` | Used for top hero and large visuals. |
| **Portrait Image** | `.visual-portrait` | **3:4** | **900x1200 px** | `.jpg` / `.webp` | Vertical shots. |
| **Square Grid** | `.visual-square` | **1:1** | **800x800 px** | `.jpg` / `.png` | Good for icons, logos, or detail shots. |
| **Mobile Screen** | `.visual-mobile` / `.phone-mockup` | **~9:19.5** | **390x844 px** | `.png` / `.jpg` | Based on iPhone dimensions. |

### Layout Tips
*   **Two Column Grid**: Uses `.visual-full` images. You can use 16:9 (1920x1080) for these as well, or a slightly taller 1200x800 (3:2) if you prefer, but 16:9 is the default css aspect ratio.
*   **Carousel**: Uses `.visual-full` (16:9) images. Ensure all slides in a carousel have identical dimensions for smooth transitions.

## File Optimization
*   **JPG**: Best for photos and complex gradients. compress to ~80% quality.
*   **PNG**: Best for UI screenshots, graphics with sharp lines, or images needing transparency.
*   **SVG**: Best for icons and vector logos (file size is negligible, limitless scaling).
