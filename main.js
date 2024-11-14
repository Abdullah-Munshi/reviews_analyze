import "./src/styles/style.css";

import { ReviewManager } from "./src/js/reviewManager";
import { OffCanvasController } from "./src/js/uiComponent";

document.addEventListener("DOMContentLoaded", async () => {
  const reviewManagerArea = new ReviewManager(
    "rv-page-container",
    "rv-page-control",
    true,
    false
  );
  reviewManagerArea.init();

  const widgetManagerArea = new ReviewManager(
    "rv-widget-container",
    "rv-widget-control",
    false,
    true
  );
  const offCanvasController = new OffCanvasController(
    "offcanvas-widget",
    "open-widget-button",
    "close-widget-button",
    widgetManagerArea
  );
});
