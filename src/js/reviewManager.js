// reviewManager.js

import TomSelect from "tom-select";
import { fetchReviews } from "./dataService.js";
import { timeAgo } from "./utils.js";

export class ReviewManager {
  constructor(containerId, controlsId) {
    this.container = document.getElementById(containerId);
    this.controls = document.getElementById(controlsId);
    this.reviews = [];
    this.filteredReviews = [];
    this.currentSortOrder = "desc"; // Default to 'desc' for most recent
    this.currentRatingFilter = "all";
  }

  async init() {
    this.reviews = await fetchReviews();
    console.log("Fetched Reviews:", this.reviews);
    this.filteredReviews = [...this.reviews];
    this.setupControls();
    this.applySortAndFilter();
  }

  setupControls() {
    // Select elements for sorting and filtering
    const dateSortSelect = this.controls.querySelector("select:nth-of-type(1)");
    const ratingFilterSelect = this.controls.querySelector(
      "select:nth-of-type(2)"
    );

    // Set dropdowns to default values
    dateSortSelect.value = this.currentSortOrder;
    ratingFilterSelect.value = this.currentRatingFilter;

    // Initialize Tom Select on both dropdowns
    new TomSelect(dateSortSelect, {
      create: false,
      sortField: { field: "text", direction: "asc" },
      maxOptions: 5,
    });

    new TomSelect(ratingFilterSelect, {
      create: false,
      sortField: { field: "text", direction: "asc" },
      maxOptions: 5,
    });

    // Sorting by Date
    dateSortSelect.addEventListener("change", (event) => {
      this.currentSortOrder = event.target.value;
      this.applySortAndFilter();
    });

    // Filtering by Rating
    ratingFilterSelect.addEventListener("change", (event) => {
      this.currentRatingFilter = event.target.value;
      this.applySortAndFilter();
    });

    // Set the default selected value to "desc" on load
    dateSortSelect.value = "desc";
  }

  applySortAndFilter() {
    console.log("Current Rating Filter:", this.currentRatingFilter);
    console.log("Current Sort Order:", this.currentSortOrder);
    // Apply filtering first
    this.filterReviews(this.currentRatingFilter);
    console.log("Filtered Reviews:", this.filteredReviews);
    // Then apply sorting on the filtered results
    this.sortReviews(this.currentSortOrder, "date");
    console.log("Sorted Reviews:", this.filteredReviews);
    // Render the results
    this.renderReviews();
  }

  filterReviews(rating) {
    if (rating === "all") {
      this.filteredReviews = [...this.reviews];
    } else {
      const ratingValue = parseInt(rating);
      this.filteredReviews = this.reviews.filter(
        (review) => review.rating === ratingValue
      );
    }
  }

  sortReviews(order, criteria) {
    const parseDate = (dateString) => {
      const [month, day, year] = dateString.split("/").map(Number);
      return new Date(year, month - 1, day);
    };

    this.filteredReviews.sort((a, b) => {
      if (criteria === "date") {
        const dateA = parseDate(a.purchaseDate);
        const dateB = parseDate(b.purchaseDate);
        return order === "desc" ? dateB - dateA : dateA - dateB;
      }
      return 0;
    });
  }
  renderReviews() {
    this.container.innerHTML = "";
    this.filteredReviews.forEach((review) => {
      const reviewElement = this.createReviewElement(review);
      this.container.appendChild(reviewElement);
    });
  }

  createReviewElement(review) {
    const reviewEl = document.createElement("div");
    reviewEl.classList.add("review");

    const isLongComment = review.comment.split(" ").length > 10;
    const displayedComment = isLongComment
      ? review.comment.split(" ").slice(0, 10).join(" ") + "..."
      : review.comment;

    reviewEl.innerHTML = `
      <img src="${review.userAvatar}" alt="${
      review.username
    }" class="review-avatar" />
      <h4>${review.username}</h4>
      <p class="time-ago">${timeAgo(review.purchaseDate)}</p>
      <p>Rating: ${review.rating}</p>
      <p class="review-comment">${displayedComment}</p>
      <p>Likes: ${review.liked} | Shared: ${review.shared}</p>
      ${
        isLongComment
          ? `
        <span class="toggle-more">
          Show more
            <svg class="arrow-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16.5L6 10.5H18L12 16.5Z" fill="currentColor"/>
            </svg>
         
        </span>`
          : ""
      }
    `;

    if (isLongComment) {
      const toggleButton = reviewEl.querySelector(".toggle-more");
      const arrowIcon = toggleButton.querySelector(".arrow-icon");
      arrowIcon.style.display = "inline-block";
      toggleButton.addEventListener("click", () => {
        const commentEl = reviewEl.querySelector(".review-comment");
        if (toggleButton.innerText.includes("Show more")) {
          commentEl.innerText = review.comment;
          toggleButton.innerHTML = "Show less";
          toggleButton.appendChild(arrowIcon);
          arrowIcon.style.transform = "rotate(180deg)"; // Rotate arrow down for "Show less"
        } else {
          commentEl.innerText = displayedComment;
          toggleButton.innerHTML = "Show more";
          toggleButton.appendChild(arrowIcon);
          arrowIcon.style.transform = "rotate(0deg)"; // Reset rotation for "Show more"
        }
      });
    }

    return reviewEl;
  }

  formatComment(comment) {
    if (comment.split(" ").length > 180) {
      return (
        comment.split(" ").slice(0, 180).join(" ") +
        '... <span class="show-more">Show more</span>'
      );
    }
    return comment;
  }
}
