document.addEventListener("DOMContentLoaded", () => {
  const genreContainer = document.getElementById("genreChips");
  const styleContainer = document.getElementById("styleChips");
  const resultSection = document.getElementById("recommendationResults");
  const resultGrid = document.getElementById("recommendationGrid");
  const summary = document.getElementById("matchSummary");

  const genres = [...new Set(books.flatMap(book => book.genre))].sort();
  const styles = [...new Set(books.flatMap(book => book.style))].sort();

  genreContainer.innerHTML = genres.map(g => `<button class="preference-chip" data-type="genre" data-value="${g}">${g}</button>`).join("");
  styleContainer.innerHTML = styles.map(s => `<button class="preference-chip" data-type="style" data-value="${s}">${s}</button>`).join("");

  document.querySelectorAll(".preference-chip").forEach(chip => {
    chip.addEventListener("click", () => chip.classList.toggle("selected"));
  });

  document.getElementById("recommendBtn").addEventListener("click", () => {
    const selectedGenres = [...document.querySelectorAll('[data-type="genre"].selected')].map(x => x.dataset.value);
    const selectedStyles = [...document.querySelectorAll('[data-type="style"].selected')].map(x => x.dataset.value);

    if (!selectedGenres.length && !selectedStyles.length) {
      showToast("Choose at least one genre or reading style first.");
      return;
    }

    const scored = books.map(book => {
      const genreMatches = selectedGenres.filter(g => book.genre.includes(g)).length;
      const styleMatches = selectedStyles.filter(s => book.style.includes(s)).length;

      const genreScore = selectedGenres.length ? (genreMatches / selectedGenres.length) * 40 : 0;
      const styleScore = selectedStyles.length ? (styleMatches / selectedStyles.length) * 30 : 0;
      const ratingScore = (book.rating / 5) * 20;

      const allPreferences = [...selectedGenres, ...selectedStyles].map(x => x.toLowerCase());
      const tagMatches = allPreferences.filter(pref =>
        book.tags.some(tag => tag.includes(pref.toLowerCase()) || pref.toLowerCase().includes(tag))
      ).length;
      const tagScore = Math.min(10, tagMatches * 3);

      let total = genreScore + styleScore + ratingScore + tagScore;

      // Avoid giving books with no preference match an inflated rating-only score.
      if (genreMatches === 0 && styleMatches === 0) total *= 0.35;

      return { book, score: Math.min(99, Math.round(total)) };
    }).sort((a,b) => b.score - a.score);

    const top = scored.slice(0, 6);
    resultSection.classList.remove("hidden");
    summary.textContent = `${selectedGenres.length + selectedStyles.length} preferences selected`;

    resultGrid.innerHTML = top.map(({book, score}) => `
      <article class="recommend-card">
        <div class="book-cover">
        ${book.cover
        ? `<img src="${book.cover}" alt="${book.title} cover">`
        : `<span>BOOK COVER</span>`
        }
        </div>
        <div class="book-info">
          <span class="match-badge">✦ ${score}% MATCH</span>
          <h3>${book.title}</h3>
          <div class="author">${book.author}</div>
          <div class="match-bar"><span style="width:${score}%"></span></div>
          <p class="author">${book.description.substring(0, 115)}...</p>
          <a class="btn btn-secondary" style="margin-top:14px;width:100%" href="book.html?id=${book.id}">View book</a>
        </div>
      </article>
    `).join("");

    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
