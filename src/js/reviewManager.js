// reviewManager.js

import TomSelect from "tom-select";
import { fetchReviews } from "./dataService.js";
import { timeAgo } from "./utils.js";

export class ReviewManager {
  constructor(
    containerId,
    controlsId,
    enablePagination = false,
    compactLayout = false
  ) {
    this.container = document.getElementById(containerId);
    this.controls = document.getElementById(controlsId);
    this.enablePagination = enablePagination; // Enable pagination only for review-area
    this.compactLayout = compactLayout;
    this.paginationContainer = enablePagination
      ? document.createElement("div")
      : null;
    if (this.paginationContainer) {
      this.paginationContainer.classList.add("pagination");
      this.container.after(this.paginationContainer);
    }
    this.reviews = [];
    this.filteredReviews = [];
    this.currentSortOrder = "desc"; // Default to 'desc' for most recent
    this.currentRatingFilter = "all";
    this.currentPage = 1;
    this.itemsPerPage = 2;
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

    if (this.enablePagination) {
      this.updatePagination(); // Only for review-area
    }
  }

  applySortAndFilter() {
    console.log("Current Rating Filter:", this.currentRatingFilter);
    console.log("Current Sort Order:", this.currentSortOrder);
    // go to the first page
    this.currentPage = 1;
    // Apply filtering first
    this.filterReviews(this.currentRatingFilter);
    console.log("Filtered Reviews:", this.filteredReviews);
    // Then apply sorting on the filtered results
    this.sortReviews(this.currentSortOrder, "date");
    console.log("Sorted Reviews:", this.filteredReviews);
    // Render the results
    this.renderReviews();

    if (this.enablePagination) {
      this.updatePagination();
    }
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
      const [day, month, year] = dateString.split("/").map(Number);
      return new Date(year, month - 1, day); // JavaScript Date months are 0-indexed
    };

    console.log("check date is format correctly or not", parseDate);

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
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = this.enablePagination
      ? startIndex + this.itemsPerPage
      : this.filteredReviews.length;

    const reviewsToDisplay = this.filteredReviews.slice(startIndex, endIndex);
    reviewsToDisplay.forEach((review) => {
      const reviewElement = this.createReviewElement(review);
      this.container.appendChild(reviewElement);
    });

    // Scroll to the review-container (parent) so filters/sort are also visible
    const containerToScroll = this.container.parentElement; // Assuming review-area is inside review-container
    if (this.enablePagination && containerToScroll) {
      containerToScroll.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  updatePagination() {
    if (!this.enablePagination) return;

    this.paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(
      this.filteredReviews.length / this.itemsPerPage
    );
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement("button");
      pageButton.innerText = i;
      pageButton.classList.add("page-button");
      if (i === this.currentPage) pageButton.classList.add("active");

      pageButton.addEventListener("click", () => {
        this.currentPage = i;
        this.renderReviews();
        this.updatePagination();
      });

      this.paginationContainer.appendChild(pageButton);
    }
  }

  createReviewElement(review) {
    const reviewEl = document.createElement("div");
    reviewEl.classList.add("review");

    const isLongComment = review.comment.split(" ").length > 10;
    const displayedComment = isLongComment
      ? review.comment.split(" ").slice(0, 10).join(" ") + "..."
      : review.comment;

    if (this.compactLayout) {
      reviewEl.innerHTML = `
      <h4>${review.username}</h4>
      <p class="time-ago">${timeAgo(review.purchaseDate)}</p>
      <p>Date : ${review.purchaseDate}</p>
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
    } else {
      reviewEl.innerHTML = `
      <img src="${review.userAvatar}" alt="${
        review.username
      }" class="review-avatar" />
      <h4>${review.username}</h4>
      <p class="time-ago">${timeAgo(review.purchaseDate)}</p>
      <p>Date : ${review.purchaseDate}</p>
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
    }

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
