(function () {
  const clockIcon = '<svg class="ico clock" viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><circle cx="12" cy="12" r="7.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7.6V12.2L15.4 14.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="12" r="1.15" fill="currentColor"/></svg>';

  const searchResults = [
    { href: "about.html", label: "About Trie" },
    { href: "research.html", label: "Research Project" },
    { href: "experience.html", label: "Industry Experience" },
    { href: "awards.html", label: "Awards" },
    { href: "contact.html", label: "Contact" },
    { href: "cv.pdf", label: "Download Her CV", download: true },
    { href: "pasta.html", label: "PASTA: A Scalable Framework for Multi-Policy AI Compliance Evaluation", extra: true },
    { href: "robot-autonomy.html", label: "Negotiating Robot Autonomy to Preserve User Responsiveness", extra: true }
  ];

  function ensureSuggestions(root) {
    let list = root.querySelector(".suggestions");
    if (list) return list;
    list = document.createElement("ul");
    list.className = "suggestions";
    list.id = "suggestions";
    list.setAttribute("role", "listbox");
    list.hidden = true;
    searchResults.forEach((result) => {
      const item = document.createElement("li");
      item.setAttribute("role", "presentation");
      if (result.extra) {
        item.className = "extra";
        item.hidden = true;
      }
      const link = document.createElement("a");
      link.setAttribute("role", "option");
      link.href = result.href;
      if (result.download) link.setAttribute("download", "");
      link.innerHTML = clockIcon + result.label;
      item.append(link);
      list.append(item);
    });
    const empty = document.createElement("li");
    empty.className = "empty-note";
    empty.hidden = true;
    empty.textContent = "No matches";
    list.append(empty);
    root.append(list);
    return list;
  }

  function setupSearch() {
    const root = document.querySelector(".search");
    if (!root) return;
    const input = root.querySelector("input");
    const list = ensureSuggestions(root);
    const empty = root.querySelector(".empty-note");
    const pageTitle = input.dataset.pageTitle || "";
    const items = [...list.querySelectorAll("li")].filter((li) => !li.classList.contains("empty-note"));
    let active = -1;
    let editing = false;

    function visible() {
      return items.filter((li) => !li.hidden);
    }

    function paint() {
      items.forEach((li, i) => {
        const on = items.filter((el) => !el.hidden).indexOf(li) === active && !li.hidden;
        li.classList.toggle("is-active", on);
        const link = li.querySelector("a");
        if (link) link.setAttribute("aria-selected", on ? "true" : "false");
      });
    }

    function apply() {
      const q = editing ? input.value.trim().toLowerCase() : "";
      items.forEach((li) => {
        const text = li.textContent.toLowerCase();
        const match = !q || text.includes(q);
        const extra = li.classList.contains("extra");
        li.hidden = !(match && (q || !extra));
      });
      const any = visible().length > 0;
      if (empty) empty.hidden = any;
      active = -1;
      paint();
    }

    function open() {
      list.hidden = false;
      input.setAttribute("aria-expanded", "true");
      apply();
    }

    function close() {
      list.hidden = true;
      input.setAttribute("aria-expanded", "false");
      active = -1;
      paint();
      if (pageTitle) {
        editing = false;
        input.value = pageTitle;
      }
    }

    input.addEventListener("focus", () => {
      editing = false;
      open();
      if (pageTitle) input.select();
    });
    input.addEventListener("pointerdown", open);
    input.addEventListener("input", () => {
      editing = true;
      open();
    });
    root.querySelector(".icon-btn").addEventListener("click", () => {
      input.focus();
      open();
    });

    input.addEventListener("keydown", (event) => {
      const rows = visible();
      if (event.key === "ArrowDown") {
        event.preventDefault();
        open();
        active = Math.min(rows.length - 1, active + 1);
        paint();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        active = Math.max(0, active - 1);
        paint();
      } else if (event.key === "Enter") {
        const row = rows[active] || rows[0];
        if (row && !list.hidden) {
          event.preventDefault();
          row.querySelector("a").click();
        }
      } else if (event.key === "Escape") {
        close();
        input.blur();
      }
    });

    list.addEventListener("mousemove", (event) => {
      const li = event.target.closest("li");
      if (!li || li.hidden || li.classList.contains("empty-note")) return;
      active = visible().indexOf(li);
      paint();
    });

    document.addEventListener("mousedown", (event) => {
      if (!root.contains(event.target)) close();
    });

    list.addEventListener("mousedown", (event) => {
      if (event.target.closest("a")) event.preventDefault();
    });

    function goTo(link) {
      const href = link.getAttribute("href");
      const target = href.split("#")[0].split("/").pop();
      const here = location.pathname.split("/").pop() || "index.html";
      if (!target || target === here) {
        close();
        return;
      }
      location.href = href;
    }

    list.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (!link || link.hasAttribute("download")) return;
      event.preventDefault();
      close();
      goTo(link);
    });

    if (location.hash === "#search") {
      input.focus();
      open();
    }
  }

  function setupCarousel() {
    const root = document.querySelector("[data-carousel]");
    if (!root) return;
    const panels = [...root.querySelectorAll(".panel")];
    let index = 0;

    function show(next) {
      index = Math.max(0, Math.min(panels.length - 1, next));
      panels.forEach((panel, i) => {
        const on = i === index;
        panel.hidden = false;
        panel.classList.toggle("is-active", on);
        panel.setAttribute("aria-hidden", on ? "false" : "true");
      });
    }

    root.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-dir]");
      if (!button) return;
      const dir = Number(button.dataset.dir);
      show(dir === 0 ? 0 : index + dir);
    });

    show(0);
  }

  function setupToc() {
    const links = [...document.querySelectorAll(".toc a")];
    if (!links.length) return;
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    function setActive(id) {
      links.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
      });
    }

    if (sections[0]) setActive(sections[0].id);

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (visible) setActive(visible.target.id);
        },
        { rootMargin: "-15% 0px -55% 0px", threshold: [0.1, 0.25, 0.6] }
      );
      sections.forEach((section) => observer.observe(section));
    }
  }

  setupSearch();
  setupCarousel();
  setupToc();
})();
