export function initNav(activePage) {
  const nav = document.querySelector(".navbar");
  const inPagesDir = window.location.pathname.includes("/pages/");

  const gitHref = inPagesDir ? "../index.html" : "index.html";
  const bashHref = inPagesDir ? "bash.html" : "pages/bash.html";
  const powershellHref = inPagesDir
    ? "powershell.html"
    : "pages/powershell.html";

  nav.innerHTML = `
    <div class="nav-container">
      <a href="${gitHref}" class="nav-brand">
        <img class="lime-icon" src="${inPagesDir ? "../" : ""}lemon-regular-full.svg" alt="" />
        <span>CommandLime</span>
      </a>
      <ul class="nav-links">
      <li>
        <a href="${gitHref}" class="git-link ${activePage === "git" ? "active" : ""}">Git</a>
      </li>
        <li>
          <a href="${bashHref}" class="bash-link ${activePage === "bash" ? "active" : ""}">Bash</a>
        </li>
        <li>
          <a href="${powershellHref}" class="powershell-link ${activePage === "powershell" ? "active" : ""}">PowerShell</a>
        </li>
      </ul>
    </div>
  `;
}
