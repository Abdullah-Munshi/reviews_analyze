import "./src/styles/style.css";

import { ReviewManager } from "./src/js/reviewManager";

document.addEventListener("DOMContentLoaded", async () => {
  const reviewManagerArea = new ReviewManager(
    "rv-page-container",
    "rv-page-control"
  );
  reviewManagerArea.init();

  const widgetManagerArea = new ReviewManager(
    "rv-widget-container",
    "rv-widget-control"
  );
  widgetManagerArea.init();
});
