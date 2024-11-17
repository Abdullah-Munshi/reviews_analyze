import "./src/styles/style.css";

import { ReviewManager } from "./src/js/reviewManager";
import { AB_Accordion } from "./src/js/uiComponent";
import { readMore } from "./src/js/utils";

document.addEventListener("DOMContentLoaded", async () => {
  const rvPageManager = new ReviewManager(
    "rv-page-container",
    "rv-page-control",
    10,
    true,
    false
  );
  // render reviews in page
  rvPageManager.init().then(() => {
    rvPageManager.renderRatingPageStats();
  });

  // readmore function for anywhere in the page
  readMore();

  const ftMobileAccordion = new AB_Accordion("ft-mobile-accordion");
  const faqAccorion = new AB_Accordion("faq-accordion");
});
