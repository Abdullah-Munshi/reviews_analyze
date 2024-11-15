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
  const emptyStars = `<img src="${starFilled}" alt="☆" />`.repeat(5 - rating);
  return filledStars + emptyStars;
}
