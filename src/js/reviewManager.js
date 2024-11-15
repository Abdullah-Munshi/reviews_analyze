// reviewManager.js

import TomSelect from "tom-select";
import { fetchReviews } from "./dataService.js";
import {
  timeAgo,
  updateActiveSortButton,
  generateStarRating,
} from "./utils.js";

import shareIcon from "../assets/icons/share.svg";
import likeIcon from "../assets/icons/like.svg";
import likeFilledIcon from "../assets/icons/likeFilled.svg";
import share2FilledIcon from "../assets/icons/share2Filled.svg";
import caretDownIcon from "../assets/icons/caretDown.svg";

export class ReviewManager {
  constructor(
    containerId,
    controlsId,
    itemsPerPage = 10,
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
    this.itemsPerPage = itemsPerPage;
  }

  async init() {
    this.reviews = await fetchReviews();
    console.log("Fetched Reviews:", this.reviews);
    this.filteredReviews = [...this.reviews];
    this.setupControls();
    this.applySortAndFilter();
  }

  setupControls() {
    if (this.container.id === "rv-widget-container") {
      // Off-canvas widget area: Use buttons for sorting
      const sortNewestButton = this.controls.querySelector("#sort-newest");
      const sortOldestButton = this.controls.querySelector("#sort-oldest");
      const ratingFilterSelect = this.controls.querySelector("select");

      sortNewestButton.addEventListener("click", () => {
        this.currentSortOrder = "desc"; // Newest first
        this.applySortAndFilter();
        updateActiveSortButton(sortNewestButton, sortOldestButton);
      });

      sortOldestButton.addEventListener("click", () => {
        this.currentSortOrder = "asc"; // Oldest first
        this.applySortAndFilter();
        updateActiveSortButton(sortOldestButton, sortNewestButton);
      });
      new TomSelect(ratingFilterSelect, {
        create: false,
        sortField: { field: "text" },
        maxOptions: 5,
      });

      // Filtering with select dropdown
      ratingFilterSelect.addEventListener("change", (event) => {
        this.currentRatingFilter = event.target.value;
        this.applySortAndFilter();
      });
    } else {
      // Select elements for sorting and filtering
      const dateSortSelect = this.controls.querySelector(
        "select:nth-of-type(1)"
      );
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
        // Scroll to the review-container (parent) so filters/sort are also visible
        const containerToScroll = this.container.parentElement; // Assuming review-area is inside review-container
        if (this.enablePagination && containerToScroll) {
          containerToScroll.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
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
      reviewEl.innerHTML = `<div class="single-rv style-2" >
    <div class="rv-middle">
      <div class="rating-star">${generateStarRating(review.rating)}</div>
      <div class="name-date">
      <strong>${review.username}</strong>-<span>review.purchaseDate</span> 
      </div>
      <p class="rv-comment">${displayedComment}</p>
     
      ${
        isLongComment
          ? `<a href="#" class="read-more">Read More 
              <svg class="angle-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18" id="angle-down">
                <path fill="#292F36" d="M2.977 6.352a.563.563 0 0 1 .796 0L9 11.58l5.227-5.228a.563.563 0 0 1 .796.796l-5.625 5.625a.56.56 0 0 1-.796 0L2.977 7.148a.56.56 0 0 1 0-.796"/>
              </svg>
             </a>`
          : ""
      }
      
    </div>
    <div class="rv-bottom">
      <button class="btn_style2 like-btn"><img class="mr-10" src="${likeFilledIcon}" alt="L" /><span>${
        review.liked
      }</span></button>
      <div class="dropdown-widget" data-arrow="false" data-show-up="true">
        <button class="btn_style2 dropdown-btn"><img class="ml-10" src="${share2FilledIcon}" alt="S" />Share</button>
        <div class="dropdown-content">
          ${review.shareLinks
            .map(
              (link) =>
                `<a href="${link.url}" target="_blank" class="dropdown-option">${link.platform}</a>`
            )
            .join("")}
        </div>
      </div>
    </div>
  </div>`;
    } else {
      reviewEl.innerHTML = `<div class="single-rv" >
    <div class="rv-top">
      <div class="user-part">
        <div class="user-avatar"><img src="${
          review.userAvatar
        }" alt="AV" /></div>
        <div class="user-name">
          <h6>${review.username}</h6>
          <span class="feedback-date">${timeAgo(review.purchaseDate)}</span>
        </div>
      </div>
      <div class="purchase-date"><p>Date of purchase: ${
        review.purchaseDate
      }</p></div>
    </div>
    <div class="rv-middle">
      <div class="rating-star">${generateStarRating(review.rating)}</div>
      <span class="hr-bar"></span>
      <p class="rv-comment">${displayedComment}</p>
      ${
        isLongComment
          ? `<a href="#" class="read-more">Read More 
              <svg class="angle-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18" id="angle-down">
                <path fill="#292F36" d="M2.977 6.352a.563.563 0 0 1 .796 0L9 11.58l5.227-5.228a.563.563 0 0 1 .796.796l-5.625 5.625a.56.56 0 0 1-.796 0L2.977 7.148a.56.56 0 0 1 0-.796"/>
              </svg>
             </a>`
          : ""
      }
    </div>
    <div class="rv-bottom">
      <button class="btn_outline like-btn"><img class="mr-10" src="${likeIcon}" alt="L" /><span>${
        review.liked
      }</span></button>
      <div class="dropdown-widget" data-arrow="false" data-show-up="true">
        <button class="btn_outline dropdown-btn">Share <img class="ml-10" src="${shareIcon}" alt="S" /></button>
        <div class="dropdown-content">
          ${review.shareLinks
            .map(
              (link) =>
                `<a href="${link.url}" target="_blank" class="dropdown-option">${link.platform}</a>`
            )
            .join("")}
        </div>
      </div>
    </div>
  </div>`;
    }

    if (isLongComment) {
      const toggleButton = reviewEl.querySelector(".read-more");
      const arrowIcon = toggleButton.querySelector(".angle-icon");
      arrowIcon.style.display = "inline-block";
      toggleButton.addEventListener("click", (event) => {
        event.preventDefault();
        const commentEl = reviewEl.querySelector(".rv-comment");
        if (toggleButton.innerText.includes("Read More")) {
          commentEl.innerText = review.comment;
          toggleButton.innerHTML = "Read less";
          toggleButton.appendChild(arrowIcon);
          arrowIcon.style.transform = "rotate(180deg)"; // Rotate arrow down for "Show less"
        } else {
          commentEl.innerText = displayedComment;
          toggleButton.innerHTML = "Read More";
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

  //   calcualte average rating
  calculateRatingStats() {
    console.log(this.reviews);
    const totalReviews = this.reviews.length;
    if (totalReviews === 0) {
      return {
        avgRating: "0",
        ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        totalReviews: 0,
      };
    }

    let totalRating = 0;
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    this.reviews.forEach((review) => {
      totalRating += review.rating;
      ratingCounts[review.rating] += 1;
    });

    const avgRating = (totalRating / totalReviews).toFixed(1); // Calculate average rating

    return { avgRating, ratingCounts, totalReviews };
  }

  renderRatingStats() {
    const { avgRating, ratingCounts, totalReviews } =
      this.calculateRatingStats();

    // Rating bars for each star level
    const ratingBars = Object.entries(ratingCounts)
      .sort((a, b) => b[0] - a[0]) // Sort by star level in descending order (5 to 1)
      .map(([star, count]) => {
        const percentage = ((count / totalReviews) * 100).toFixed(1); // Percentage of reviews for this rating
        return `
        <div class="rating-bar">
          <div class="bar-values"><span>${star} Star</span>
           <span>${count}</span></div>
          <div class="bar">
            <div class="fill" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
      })
      .join("");

    // Average rating display
    const avgRatingDisplay = `
    <div class="avg-rating">
      
      <div class="avg-stars">${generateStarRating(Math.round(avgRating))}</div>
      <div class="avg-dropdwon">
          <button class="trigger">
            <span><strong class="f-rate">${avgRating}</strong>/5</span><img src="${caretDownIcon}" alt="" />
          </button>
          <div class="rating-bar-wrap">${ratingBars}</div>
      </div>
    </div>
  `;

    // Insert into widget area
    const rvWidgetAvg = document.getElementById("rv-widget-avg");
    rvWidgetAvg.innerHTML = avgRatingDisplay;
  }
}
