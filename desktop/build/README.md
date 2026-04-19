# Build assets

Drop the following icon files here before running `npm run package:*`:

- `icon.ico` — Windows installer + tray icon (256×256 multi-resolution)
- `icon.icns` — macOS app bundle icon
- `icon.png` — Linux icon (512×512)

For macOS template-image tray support, also create `desktop/resources/tray-icon-template.png` (monochrome, 18×18 @1x and 36×36 @2x).

Until these assets are added, `electron-builder` will substitute its default Electron icons and the tray will fall back to an empty image (Sprint 1 acceptable).
