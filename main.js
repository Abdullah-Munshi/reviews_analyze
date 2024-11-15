import "./src/styles/style.css";

import { ReviewManager } from "./src/js/reviewManager";
import { Accordion, OffCanvasController, Tab } from "./src/js/uiComponent";
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
  rvPageManager.init();

  const rvWidgetManager = new ReviewManager(
    "rv-widget-container",
    "rv-widget-control",
    10,
    false,
    true
  );

  // create tab instance
  const tab = new Tab("tabs");

  // create offcanvas widget instance
  const offCanvasController = new OffCanvasController(
    "offcanvas-widget",
    "open-widget-button",
    "close-widget-button",
    rvWidgetManager,
    tab
  );

  const accordionData = [
    {
      title: "How are Feefo reviews collected?",
      content:
        "We independently collect feedback on behalf of the businesses that work with us. Our platform only reaches out to verified buyers, so you can be sure you’re reading reviews from real customers.",
    },
    {
      title: "Who can leave a Feefo review?",
      content:
        "Only customers with proof of purchase can leave a Feefo review. We ensure this by reaching out to buyers straight after their transaction.",
    },
    {
      title: "How do we verify reviews?",
      content:
        "We verify that reviews are from genuine customers by matching them to a sale or transaction. People are only invited to leave a review after purchasing from the business.",
    },
    {
      title: "How do we deal with fake reviews?",
      content:
        "We verify that reviews are from genuine customers by matching them to a sale or transaction. People are only invited to leave a review after purchasing from the business.",
    },
  ];

  // create accordion instance
  const faq = new Accordion({
    containerId: "faq",
    data: accordionData,
    allowMultiple: false, // Set to true if you want multiple panels open at once
  });

  // readmore function for anywhere in the page
  readMore();
});
