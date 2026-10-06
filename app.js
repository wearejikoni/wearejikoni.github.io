(function () {
  const DATA = window.JIKONI_DATA || {};
  const TEXT = window.JIKONI_TEXT || {};

  const heroImage = document.getElementById("heroImage");

  const outsideLayer = document.getElementById("outsideLayer");
  const insideLayer = document.getElementById("insideLayer");
  const contentLayer = document.getElementById("contentLayer");
  const contentArea = document.getElementById("contentArea");

  const doorKnocker = document.getElementById("doorKnocker");
  const karibuEntrance = document.getElementById("karibuEntrance");

  const menuButton = document.getElementById("menuButton");
  const mainMenu = document.getElementById("mainMenu");
  const languageSelect = document.getElementById("languageSelect");

  const backToFire = document.getElementById("backToFire");
  const welcomeMessage = document.getElementById("welcomeMessage");

  const liveStatus = document.getElementById("liveStatus");
  const nextRetreatValue = document.getElementById("nextRetreatValue");
  const roomsStatus = document.getElementById("roomsStatus");
  const roomsStatusValue = document.getElementById("roomsStatusValue");
  const happeningValue = document.getElementById("happeningValue");


  const STORAGE_DOOR = "jikoniDoorState";
  const STORAGE_LANG = "jikoniLanguage";

  let currentLang = getStored(STORAGE_LANG) || "en";
  let currentRoute = null;

  const routes = [
    "our-story",
    "experience",
    "become-part",
    "follow",
    "contact",
    "connect",
    "create",
    "celebrate"
  ];

  function getStored(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function setStored(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // localStorage may be blocked. Ignore silently.
    }
  }

  function t(key) {
    return (TEXT[currentLang] && TEXT[currentLang][key]) ||
      (TEXT.en && TEXT.en[key]) ||
      key;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function applyLanguage() {
    document.documentElement.lang = currentLang;
    languageSelect.value = currentLang;

    document.querySelectorAll("[data-text]").forEach((element) => {
      const key = element.getAttribute("data-text");
      element.textContent = t(key);
    });

    if (currentRoute) {
      renderRoute(currentRoute, false);
    }
  }

  function applySiteData() {
    const links = DATA.links || {};
    const outside = DATA.outside || {};

    if (links.airbnb) {
      roomsStatus.href = links.airbnb;
    }

    liveStatus.textContent = outside.liveStatus || "OFFLINE";
    nextRetreatValue.textContent = outside.nextRetreat || "";
    roomsStatusValue.textContent = outside.roomsStatus || "";
    happeningValue.textContent = outside.happening || "";
  }

  function openDoor(options = {}) {
    heroImage.setAttribute("src", "./hut-open.png");

    outsideLayer.hidden = true;
    insideLayer.hidden = false;
    contentLayer.hidden = true;

    currentRoute = null;

    if (options.persist !== false) {
      setStored(STORAGE_DOOR, "open");
    }

    fadeWelcome();

    if (options.clearHash !== false && window.location.hash) {
      history.replaceState(null, "", window.location.pathname);
    }
  }

  function closeDoor() {
    heroImage.setAttribute("src", "./hut-closed.png");

    outsideLayer.hidden = false;
    insideLayer.hidden = true;
    contentLayer.hidden = true;

    currentRoute = null;

    setStored(STORAGE_DOOR, "closed");

    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname);
    }
  }

  function openFire() {
    openDoor({ persist: true, clearHash: true });
    closeMenu();
  }

  function fadeWelcome() {
    if (!welcomeMessage) return;

    welcomeMessage.classList.remove("fade");

    window.setTimeout(() => {
      welcomeMessage.classList.add("fade");
    }, 1600);
  }

  function openContent(route, options = {}) {
    heroImage.setAttribute("src", "./hut-open.png");

    outsideLayer.hidden = true;
    insideLayer.hidden = false;
    contentLayer.hidden = false;

    currentRoute = route;

    renderRoute(route, true);

    if (options.persistOpen === true) {
      setStored(STORAGE_DOOR, "open");
    }

    if (options.updateHash !== false) {
      history.pushState(null, "", "#" + route);
    }

    closeMenu();
  }

  function renderRoute(route, scrollTop) {
    if (!contentArea) return;

    if (route === "our-story") {
      contentArea.innerHTML = renderOurStory();
    }

    if (route === "experience") {
      contentArea.innerHTML = renderExperience();
    }

    if (route === "become-part") {
      contentArea.innerHTML = renderBecomePart();
    }

    if (route === "follow") {
      contentArea.innerHTML = renderFollow();
    }

    if (route === "contact") {
      contentArea.innerHTML = renderContact();
      setupContactForm();
    }

    if (route === "connect") contentArea.innerHTML = renderConnect();
    if (route === "create") contentArea.innerHTML = renderCreate();
    if (route === "celebrate") contentArea.innerHTML = renderCelebrate();

    if (scrollTop) {
      contentLayer.scrollTop = 0;
    }
  }

  function renderConnect() {
    const links = DATA.links || {};
    return `
      <article>
        <h1>Connect</h1>
        <section><h2>Contact Us</h2>
          <p>${escapeHtml(t("contactIntro"))}</p>
          <a href="#contact" data-route="contact">${escapeHtml(t("contactTitle"))} →</a>
        </section>
        <section><h2>Stay</h2>
          <p>${escapeHtml(t("stayIntro"))}</p>
          <a href="${escapeHtml(links.airbnb || "https://www.airbnb.com/")}" target="_blank" rel="noopener noreferrer">Airbnb ↗</a>
        </section>
        <section><h2>Become Part</h2>
          <p>${escapeHtml(t("becomePartIntro"))}</p>
          <a href="#become-part" data-route="become-part">${escapeHtml(t("becomePartTitle"))} →</a>
        </section>
        <section><h2>${escapeHtml(t("followTitle"))}</h2>
          <p>${escapeHtml(t("followIntro"))}</p>
          <a href="#follow" data-route="follow">${escapeHtml(t("followTitle"))} →</a>
        </section>
      </article>`;
  }

  function renderCreate() {
    const workshop = (DATA.experiences || []).find(item => item.id === "build-the-jiko");
    const url = DATA.links && DATA.links.workshop;
    return `
      <article>
        <h1>Create</h1>
        <section>
          <h2>${escapeHtml(workshop ? workshop.title : "Build the Jiko")}</h2>
          <p>${escapeHtml(t("workshopIntro"))}</p>
          ${workshop ? `<p><strong>${escapeHtml(workshop.date)}</strong></p><p>${escapeHtml(workshop.text)}</p>` : ""}
          ${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("workshopLink"))} ↗</a>` : `<p>${escapeHtml(t("workshopSoon"))}</p>`}
        </section>
      </article>`;
  }

  function renderCelebrate() {
    const supporters = DATA.supporters || [];
    return `
      <article>
        <h1>Celebrate</h1>
        <h2>Wall of Fame</h2>
        <p>${escapeHtml(t("celebrateIntro"))}</p>
        ${supporters.length ? `<ul class="supporter-list">${supporters.map(person => `<li>${escapeHtml(person)}</li>`).join("")}</ul>` : `<p>${escapeHtml(t("supportersSoon"))}</p>`}
      </article>`;
  }

  function renderOurStory() {
    const today = DATA.today || {};
    const nextItems = DATA.next || [];
    const rooms = DATA.rooms || [];

    return `
      <article class="story-page">
        <h1>${escapeHtml(t("ourStoryTitle"))}</h1>
        <p>${escapeHtml(t("ourStoryIntro"))}</p>

        <h2>${escapeHtml(t("startedWithTitle"))}</h2>
        <p>${escapeHtml(t("startedWithText"))}</p>

        <h2>${escapeHtml(t("thenTitle"))}</h2>
        <p>${escapeHtml(t("thenText"))}</p>

        <h2>${escapeHtml(t("todayTitle"))}</h2>
        <h3>${escapeHtml(today.title || "")}</h3>
        <p>${escapeHtml(today.text || "")}</p>

        <h2>${escapeHtml(t("roomsTitle"))}</h2>
        <p>${escapeHtml(t("roomsIntro"))}</p>

        <div class="room-list">
          ${rooms.map((room) => `
            <section>
              <h3>${escapeHtml(room.name)}</h3>
              <p>${escapeHtml(room.text)}</p>
            </section>
          `).join("")}
        </div>

        <h2>${escapeHtml(t("nextTitle"))}</h2>
        ${nextItems.map((item) => `
          <section>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.text)}</p>
          </section>
        `).join("")}
      </article>
    `;
  }

  function renderExperience() {
    const experiences = DATA.experiences || [];

    return `
      <article>
        <h1>${escapeHtml(t("experienceTitle"))}</h1>
        <p>${escapeHtml(t("experienceIntro"))}</p>

        ${experiences.map((item) => `
          <section>
            <h2>${escapeHtml(item.title)}</h2>
            <p><strong>${escapeHtml(item.date)}</strong></p>
            <p>${escapeHtml(item.text)}</p>
          </section>
        `).join("")}
      </article>
    `;
  }

  function renderBecomePart() {
    return `
      <article>
        <h1>${escapeHtml(t("becomePartTitle"))}</h1>
        <p>${escapeHtml(t("becomePartIntro"))}</p>

        <section>
          <h2>Friends</h2>
          <p>Follow, share, visit, tell the story.</p>
        </section>

        <section>
          <h2>Supporters</h2>
          <p>Help with money, materials or useful resources.</p>
        </section>

        <section>
          <h2>Partners</h2>
          <p>Bring serious knowledge, funding, craft, infrastructure or long-term collaboration.</p>
        </section>

        <section>
          <h2>Builders</h2>
          <p>Come to Jikoni and build with your own hands.</p>
        </section>

        <section>
          <h2>Jikoni Circle</h2>
          <p>Coming later: profiles, NFC, history, access and belonging.</p>
        </section>
      </article>
    `;
  }

  function renderFollow() {
    const links = DATA.links || {};

    return `
      <article>
        <h1>${escapeHtml(t("followTitle"))}</h1>
        <p>${escapeHtml(t("followIntro"))}</p>

        <p>
          <a href="${escapeHtml(links.instagram || "#")}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(t("openInstagram"))}
          </a>
        </p>

        <p>
          <a href="${escapeHtml(links.linkedin || "#")}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(t("openLinkedIn"))}
          </a>
        </p>
      </article>
    `;
  }

  function renderContact() {
    const links = DATA.links || {};

    return `
      <article>
        <h1>${escapeHtml(t("contactTitle"))}</h1>
        <p>${escapeHtml(t("contactIntro"))}</p>

        <form id="contactForm">
          <p>
            <input name="name" type="text" placeholder="${escapeHtml(t("formName"))}" required>
          </p>

          <p>
            <input name="email" type="email" placeholder="${escapeHtml(t("formEmail"))}" required>
          </p>

          <p>
            <textarea name="message" rows="6" placeholder="${escapeHtml(t("formMessage"))}" required></textarea>
          </p>

          <button type="submit">${escapeHtml(t("formSend"))}</button>

          <p id="contactStatus" aria-live="polite"></p>
        </form>

        <hr>

        <p>
          <a href="${escapeHtml(links.email || "#")}">
            ${escapeHtml(t("openEmail"))}
          </a>
        </p>

        <p>
          <a href="${escapeHtml(links.whatsapp || "#")}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(t("openWhatsapp"))}
          </a>
        </p>
      </article>
    `;
  }

  function setupContactForm() {
    const form = document.getElementById("contactForm");
    const status = document.getElementById("contactStatus");

    if (!form || !status) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      status.textContent =
        "The real sending function will be connected next. Your message is not sent yet.";
    });
  }

  function toggleMenu() {
    mainMenu.hidden = !mainMenu.hidden;
    menuButton.setAttribute("aria-expanded", String(!mainMenu.hidden));
  }

  function closeMenu() {
    mainMenu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
  }

  function handleHashRoute() {
    const hash = window.location.hash.replace("#", "");

    if (routes.includes(hash)) {
      openContent(hash, {
        persistOpen: false,
        updateHash: false
      });
      return;
    }

    const storedDoorState = getStored(STORAGE_DOOR);

    if (storedDoorState === "open") {
      openDoor({
        persist: false,
        clearHash: false
      });
    } else {
      closeDoor();
    }
  }
  doorKnocker.addEventListener("click", function () {
    openDoor({ persist: true, clearHash: true });
  });

  karibuEntrance.addEventListener("click", function () {
    openDoor({ persist: true, clearHash: true });
  });

  backToFire.addEventListener("click", function () {
    openFire();
  });

  menuButton.addEventListener("click", function () {
    toggleMenu();
  });

  languageSelect.addEventListener("change", function () {
    currentLang = languageSelect.value;
    setStored(STORAGE_LANG, currentLang);
    applyLanguage();
  });

  document.addEventListener("click", function (event) {
    const routeElement = event.target.closest("[data-route]");
    const actionElement = event.target.closest("[data-action]");

    if (routeElement) {
      const route = routeElement.getAttribute("data-route");

      if (routes.includes(route)) {
        event.preventDefault();
        openContent(route, {
          persistOpen: true,
          updateHash: true
        });
      }
    }

    if (actionElement) {
  const action = actionElement.getAttribute("data-action");

  if (action === "fire") {
    event.preventDefault();
    openFire();
  }


  }

    if (
      !event.target.closest("#mainMenu") &&
      !event.target.closest("#menuButton")
    ) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !mainMenu.hidden) {
      closeMenu();
      menuButton.focus();
    }
  });

  window.addEventListener("hashchange", handleHashRoute);

  applySiteData();
  applyLanguage();
  handleHashRoute();
})();

