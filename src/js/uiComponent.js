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
