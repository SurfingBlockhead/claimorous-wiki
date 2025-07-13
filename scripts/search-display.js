function highlightText(text, query) {
      if (!query) return text;
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "gi");
      return text.replace(regex, (match) => `<mark>${match}</mark>`);
  }
  
  function getSnippets(text, query, wordsBefore = 4, wordsAfter = 4) {
      if (!query || !text) return [text];
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "gi");
      const snippets = [];
      let match;
      
      while ((match = regex.exec(text)) !== null) {
          const pos = match.index;
          // Find the start of the current word (if in the middle of a word)
          let start = pos;
          while (start > 0 && !text[start].match(/\s/)) start--;
          
          // Find the start of the previous words
          let words = 0;
          let before = start;
          while (before > 0 && words < wordsBefore) {
              before--;
              if (text[before].match(/\s/)) words++;
          }
          
          // Find the end of the next words
          words = 0;
          let end = pos + match[0].length;
          while (end < text.length && words < wordsAfter) {
              // Check if text[end] exists before calling match()
              if (end < text.length && text[end].match(/\s/)) words++;
              end++;
          }
          
          // Extract the snippet
          let snippet = text.substring(
              Math.max(0, before),
              Math.min(text.length, end)
          );
          
          // Clean up whitespace and add ellipsis if not at the start/end
          snippet = snippet.trim();
          if (before > 0) snippet = "..." + snippet;
          if (end < text.length) snippet += "...";
          
          snippets.push(snippet);
      }
      
      // Dedupe and limit snippets
      return [...new Set(snippets)].slice(0, 3); // Limit to 3 snippets per result
  }
  
  function displayResults(results, query) {
      const container = document.getElementById("search-results");
      container.innerHTML = "";
      
      if (results.length === 0) {
          container.innerHTML = "<p>No results found.</p>";
          return;
      }
      
      results.forEach((page) => {
          const preview = document.createElement("div");
          preview.className = "blog-post-preview";
          
          const highlightedTitle = highlightText(page.title, query);
          const snippets = getSnippets(page.content, query, 4, 4);
          const highlightedSnippets = snippets.map((snippet) =>
              highlightText(snippet, query)
          );
          
          const contentPreview = highlightedSnippets.join("<br><br>");
          
          preview.innerHTML = `
              <h2><a href="${page.url}">${highlightedTitle}</a></h2>
              <p>${contentPreview}</p>
          `;
          
          container.appendChild(preview);
      });
  }
  
  document.addEventListener("DOMContentLoaded", function () {
      const urlParams = new URLSearchParams(window.location.search);
      const query = sanitizeQuery(urlParams.get("q") || "");

      fetch("./data/search-index.json")
          .then((response) => response.json())
          .then((pages) => {
              const results = query ? filterPages(pages, query) : [];
              displayResults(results, query);
          })
          .catch((error) => {
              console.error("Error fetching search index:", error);
              displayResults([], query);
          });
  });

  function sanitizeQuery(query) {
    // Limit length and remove potentially problematic characters
    return query.slice(0, 100).replace(/[<>'"]/g, '');
}

  
  function filterPages(pages, query) {
      const q = query.toLowerCase().trim();
      if (!q) return [];
      
      return pages.filter((page) => {
          const titleMatch = page.title && page.title.toLowerCase().includes(q);
          const contentMatch = page.content && page.content.toLowerCase().includes(q);
          return titleMatch || contentMatch;
      });
  }