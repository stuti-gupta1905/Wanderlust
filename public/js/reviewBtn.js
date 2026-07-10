document.addEventListener("DOMContentLoaded", () => {
  const characterLimit = 150; // Set threshold for "long" reviews
  const reviewTexts = document.querySelectorAll(".review-text");

  reviewTexts.forEach((textElement) => {
    const fullText = textElement.getAttribute("data-fulltext").trim();
    const btn = textElement.nextElementSibling; // Selects the .show-more-btn directly underneath

    if (fullText.length > characterLimit) {
      // Show the button if text crosses our limit threshold
      btn.style.display = "inline-block";

      // Truncate text visually initially
      const truncatedText = fullText.slice(0, characterLimit) + "...";
      textElement.innerText = truncatedText;

      let isCollapsed = true;
      btn.addEventListener("click", () => {
        if (isCollapsed) {
          textElement.innerText = fullText;
          btn.innerText = "Show less";
          isCollapsed = false;
        } else {
          textElement.innerText = truncatedText;
          btn.innerText = "Show more";
          isCollapsed = true;
        }
      });
    }
  });
});
