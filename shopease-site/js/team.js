/* ==========================================================================
   Team page — edit the TEAM list below to change who appears on team.html.
   photo:    path to an image in images/team/ (leave "" to show initials)
   linkedin: full https:// link, or "" to hide the icon
   github:   full https:// link, or "" to hide the icon
   ========================================================================== */
const TEAM = [
  { name: "Sunday Okoko", title: "Workflow Engineer", bio: "Built the n8n automation and AI routing.", photo: "images/team/sunday.jpg", linkedin: "", github: "" },
  { name: "Team Member 2", title: "Role", bio: "", photo: "images/team/member2.jpg", linkedin: "", github: "" },
  { name: "Team Member 3", title: "Role", bio: "", photo: "images/team/member3.jpg", linkedin: "", github: "" },
  { name: "Team Member 4", title: "Role", bio: "", photo: "images/team/member4.jpg", linkedin: "", github: "" }
];

(() => {
  "use strict";

  const grid = document.getElementById("team-grid");
  if (!grid) return;

  // Background colours for initials avatars (all pass contrast with white text)
  const AVATAR_COLOURS = ["#1f6feb", "#1a7f37", "#8250df", "#bf3989", "#0e7c86", "#b35900"];

  const ICONS = {
    linkedin:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.6 8.65 21 11.2 21 14.5V21h-4v-5.7c0-1.37-.03-3.13-1.9-3.13-1.9 0-2.2 1.48-2.2 3.03V21H9z"/></svg>',
    github:
      '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>'
  };

  const getInitials = (name) => {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    const first = parts[0][0];
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  };

  const colourFor = (name) => {
    let hash = 0;
    for (const ch of String(name)) hash = (hash * 31 + ch.codePointAt(0)) >>> 0;
    return AVATAR_COLOURS[hash % AVATAR_COLOURS.length];
  };

  const makeInitials = (member) => {
    const avatar = document.createElement("div");
    avatar.className = "avatar-initials";
    avatar.setAttribute("role", "img");
    avatar.setAttribute("aria-label", `${member.name} (initials)`);
    avatar.style.backgroundColor = colourFor(member.name);
    avatar.textContent = getInitials(member.name);
    return avatar;
  };

  const makePhoto = (member) => {
    if (!member.photo) return makeInitials(member);
    const img = document.createElement("img");
    img.className = "team-photo";
    img.alt = `Photo of ${member.name}`;
    img.width = 128;
    img.height = 128;
    img.loading = "lazy";
    img.decoding = "async";
    // Attach the fallback before setting src so a fast failure is never missed
    img.addEventListener("error", () => img.replaceWith(makeInitials(member)), { once: true });
    img.src = member.photo;
    return img;
  };

  const isSafeUrl = (url) => /^https?:\/\//i.test(String(url || "").trim());

  const makeSocialLink = (url, network, label, name) => {
    const link = document.createElement("a");
    link.className = "social-link";
    link.href = url.trim();
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `${name} on ${label} (opens in a new tab)`);
    link.innerHTML = ICONS[network];
    return link;
  };

  const makeCard = (member) => {
    const card = document.createElement("article");
    card.className = "card team-card";

    card.append(makePhoto(member));

    const name = document.createElement("h3");
    name.className = "team-name";
    name.textContent = member.name;
    card.append(name);

    if (member.title) {
      const title = document.createElement("p");
      title.className = "team-title";
      title.textContent = member.title;
      card.append(title);
    }

    if (member.bio) {
      const bio = document.createElement("p");
      bio.className = "team-bio";
      bio.textContent = member.bio;
      card.append(bio);
    }

    const links = [];
    if (isSafeUrl(member.linkedin)) links.push(makeSocialLink(member.linkedin, "linkedin", "LinkedIn", member.name));
    if (isSafeUrl(member.github)) links.push(makeSocialLink(member.github, "github", "GitHub", member.name));
    if (links.length) {
      const wrap = document.createElement("div");
      wrap.className = "team-links";
      wrap.append(...links);
      card.append(wrap);
    }

    return card;
  };

  grid.append(...TEAM.map(makeCard));
})();
