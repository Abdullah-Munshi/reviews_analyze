import starFilled from "../assets/icons/starFilled.svg";
import starUnFilled from "../assets/icons/starUnFilled.svg";

// Helper function to calculate "time ago" text
export function timeAgo(purchaseDate) {
  // Parse the "DD/MM/YYYY" format
  const [day, month, year] = purchaseDate.split("/").map(Number);
  const reviewDate = new Date(year, month - 1, day); // JavaScript Date months are 0-based

  const currentDate = new Date();
  const secondsAgo = Math.floor((currentDate - reviewDate) / 1000);
  const minutesAgo = Math.floor(secondsAgo / 60);
  const hoursAgo = Math.floor(minutesAgo / 60);
  const daysAgo = Math.floor(hoursAgo / 24);
  const monthsAgo = Math.floor(daysAgo / 30);
  const yearsAgo = Math.floor(monthsAgo / 12);

  if (yearsAgo > 0) return `${yearsAgo} year${yearsAgo > 1 ? "s" : ""} ago`;
  if (monthsAgo > 0) return `${monthsAgo} month${monthsAgo > 1 ? "s" : ""} ago`;
  if (daysAgo > 0) return `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
  if (hoursAgo > 0) return `${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`;
  if (minutesAgo > 0)
    return `${minutesAgo} minute${minutesAgo > 1 ? "s" : ""} ago`;
  return `${secondsAgo} second${secondsAgo > 1 ? "s" : ""} ago`;
}

export function updateActiveSortButton(activeButton, inactiveButton) {
  activeButton.classList.add("active");
  inactiveButton.classList.remove("active");
}

export function generateStarRating(rating) {
  // Generate filled stars based on rating and remaining as empty stars
  const filledStars = `<img src="${starFilled}" alt="★" />`.repeat(rating);
  const emptyStars = `<img src="${starUnFilled}" alt="☆" />`.repeat(5 - rating);
  return filledStars + emptyStars;
}

export class Dropdown {
  constructor(selector) {
    this.widgets = document.querySelectorAll(selector);
    this.init();
  }

  init() {
    this.widgets.forEach((widget) => {
      const button = widget.querySelector(".dropdown-btn");
      const dropdown = widget.querySelector(".dropdown-content");

      // Read attributes for direction and arrow visibility
      const showUp = widget.getAttribute("data-show-up") === "true";
      const showArrow = widget.getAttribute("data-arrow") !== "false";
      const caret = button.querySelector(".caret");

      // Default to dropdown direction and add caret if needed
      dropdown.style.display = "none";
      dropdown.classList.add(showUp ? "dropup-content" : "dropdown-content");
      if (!caret && showArrow) {
        // Add caret if it doesn't exist and showArrow is true
        const newCaret = document.createElement("span");
        newCaret.classList.add("caret");
        newCaret.textContent = showUp ? "▲" : "▼";
        button.appendChild(newCaret);
      } else if (caret && !showArrow) {
        // Remove caret if present and showArrow is false
        caret.remove();
      }

      // Add click event to button
      button.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent event from bubbling to the document
        this.toggleDropdown(dropdown, showUp);
      });

      // Close dropdown when clicking outside
      document.addEventListener("click", (event) => {
        if (!widget.contains(event.target)) {
          dropdown.style.display = "none";
          if (caret) caret.textContent = showUp ? "▲" : "▼"; // Reset caret
        }
      });
    });
  }

  toggleDropdown(dropdown, showUp) {
    // Close other dropdowns if multiple instances are present
    document
      .querySelectorAll(".dropdown-content, .dropup-content")
      .forEach((dd) => {
        if (dd !== dropdown) dd.style.display = "none";
      });

    // Toggle the current dropdown
    dropdown.style.display =
      dropdown.style.display === "none" ? "block" : "none";
  }
}

export const readMore = (maxChars = 120) => {
  // You can adjust default maxChars
  const paragraphs = document.querySelectorAll('[data-para="para"]');

  paragraphs.forEach((container) => {
    const paragraph = container.querySelector(".text");
    const button = container.querySelector(".button");

    if (!paragraph || !button) return;

    // Store the original text
    const fullText = paragraph.textContent.trim();

    // Only apply if text is longer than maxChars
    if (fullText.length <= maxChars) {
      button.style.display = "none";
      return;
    }

    // Set initial state
    paragraph.dataset.fullText = fullText;
    const truncatedText = fullText.slice(0, maxChars) + "...";
    paragraph.textContent = truncatedText;

    // Add event listener to button
    button.addEventListener("click", function () {
      const isExpanded = paragraph.dataset.expanded === "true";

      if (!isExpanded) {
        paragraph.textContent = paragraph.dataset.fullText;
        button.querySelector("span").textContent = "Read Less";
        paragraph.dataset.expanded = "true";
      } else {
        paragraph.textContent = truncatedText;
        button.querySelector("span").textContent = "Read All";
        paragraph.dataset.expanded = "false";
      }
    });
  });
};

export function getReviewsLastYear(reviews) {
  const currentDate = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

  // Filter reviews based on purchaseDate
  const reviewsLastYear = reviews.filter((review) => {
    const [day, month, year] = review.purchaseDate.split("/").map(Number);
    const reviewDate = new Date(year, month - 1, day);
    return reviewDate >= oneYearAgo; // Reviews within the last year
  });

  return reviewsLastYear.length; // Return the count of reviews in the past year
}

export function formatDate(dateString) {
  // Split the input string into day, month, and year
  const [day, month, year] = dateString.split("/");

  // Create a new Date object (months are 0-indexed in JavaScript)
  const date = new Date(`${year}-${month}-${day}`);

  // Options for formatting the date
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  // Format the date as "Month day, year" (e.g., "September 20, 2024")
  return date.toLocaleDateString("en-US", options);
}
