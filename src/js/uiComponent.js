// uiComponent.js

export class OffCanvasController {
  constructor(offCanvasId, openButtonId, closeButtonId, reviewManagerInstance) {
    this.offCanvas = document.getElementById(offCanvasId);
    this.openButton = document.getElementById(openButtonId);
    this.closeButton = document.getElementById(closeButtonId);
    this.reviewManagerInstance = reviewManagerInstance;
    this.hasLoaded = false;

    // Bind events
    this.openButton.addEventListener("click", () => this.show());
    this.closeButton.addEventListener("click", () => this.hide());
  }

  show() {
    this.offCanvas.classList.add("show");
    this.openButton.style.display = "none";
    if (!this.hasLoaded) {
      this.reviewManagerInstance.init().then(() => {
        this.reviewManagerInstance.renderRatingStats();
        this.hasLoaded = true;
      }); // Lazy-load data only when opened
    }
  }

  hide() {
    this.offCanvas.classList.remove("show");
    this.openButton.style.display = "block";
  }
}

export class Accordion {
  constructor(options = {}) {
    this.accordionData = options.data || [];
    this.allowMultiple = options.allowMultiple || false; // Whether multiple panels can be open at once

    // DOM Element
    this.container = document.getElementById(
      options.containerId || "accordion"
    );

    this.init();
  }

  init() {
    this.render();
    this.setupEventListeners();
  }

  createAccordionItem(item, index) {
    return `
        <div class="accordion-item" data-index="${index}">
          <button class="accordion-header" aria-expanded="false">
            <span class="accordion-title">${item.title}</span>
            <svg class="arrow" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 18 18" font-size="1.125rem"><path fill="#292F36" d="M2.977 6.352a.563.563 0 0 1 .796 0L9 11.58l5.227-5.228a.563.563 0 0 1 .796.796l-5.625 5.625a.56.56 0 0 1-.796 0L2.977 7.148a.56.56 0 0 1 0-.796"></path></svg>
          </button>
          <div class="accordion-content" hidden>
            <div class="accordion-body">
              ${item.content}
            </div>
          </div>
        </div>
      `;
  }

  render() {
    const accordionHTML = this.accordionData
      .map((item, index) => this.createAccordionItem(item, index))
      .join("");

    this.container.innerHTML = accordionHTML;
    this.container.classList.add("accordion-container");
  }

  setupEventListeners() {
    this.container.addEventListener("click", (e) => {
      const header = e.target.closest(".accordion-header");
      if (!header) return;

      const item = header.parentElement;
      const content = header.nextElementSibling;
      const isExpanded = header.getAttribute("aria-expanded") === "true";

      // If not allowing multiple open panels, close all others
      if (!this.allowMultiple && !isExpanded) {
        this.closeAllPanels();
      }

      // Toggle current panel
      this.togglePanel(header, content, !isExpanded);
    });
  }

  togglePanel(header, content, isOpen) {
    header.setAttribute("aria-expanded", isOpen);
    content.hidden = !isOpen;

    // Add animation classes
    if (isOpen) {
      content.style.height = content.scrollHeight + "px";
      header.classList.add("expanded");
    } else {
      content.style.height = "0px";
      header.classList.remove("expanded");
    }
  }

  closeAllPanels() {
    const headers = this.container.querySelectorAll(
      '.accordion-header[aria-expanded="true"]'
    );
    headers.forEach((header) => {
      const content = header.nextElementSibling;
      this.togglePanel(header, content, false);
    });
  }

  // Public methods
  openPanel(index) {
    const header = this.container.querySelector(
      `.accordion-item[data-index="${index}"] .accordion-header`
    );
    const content = header.nextElementSibling;
    if (header && content) {
      if (!this.allowMultiple) {
        this.closeAllPanels();
      }
      this.togglePanel(header, content, true);
    }
  }

  closePanel(index) {
    const header = this.container.querySelector(
      `.accordion-item[data-index="${index}"] .accordion-header`
    );
    const content = header.nextElementSibling;
    if (header && content) {
      this.togglePanel(header, content, false);
    }
  }

  updateData(newData) {
    this.accordionData = newData;
    this.render();
    this.setupEventListeners();
  }
}
