/* ==========================================================================
   Team page — edit the TEAM list below to change who appears on team.html.
   name:     full name
   title:    role, written out in full (e.g. "Group Member")
   lead:     true to show the person in the "Leadership" section
   bio:      one short sentence, or "" to hide
   photo:    path to an image in images/team/ (leave "" to show initials)
   linkedin: full https:// link, or "" to hide the icon
   github:   full https:// link, or "" to hide the icon
   ========================================================================== */
const TEAM = [
  { name: "Racheal Mfon", title: "Group Lead", lead: true, bio: "", photo: "images/team/rachel.jpg", linkedin: "", github: "" },
  { name: "Ismail Adam", title: "Assistant Group Lead", lead: true, bio: "", photo: "", linkedin: "", github: "" },
  { name: "Okoko Sunday", title: "Group Member", bio: "", photo: "images/team/sunday.jpeg", linkedin: "", github: "" },
  { name: "Anumtyo Abraham", title: "Group Member", bio: "", photo: "images/team/abraham.jpeg", linkedin: "", github: "" },
  { name: "Divine Chidiebere", title: "Group Member", bio: "", photo: "", linkedin: "", github: "" },
  { name: "Dikko Paul", title: "Group Member", bio: "", photo: "", linkedin: "", github: "" },
  { name: "Ajunwa Esther", title: "Group Member", bio: "", photo: "", linkedin: "", github: "" }
];

(() => {
  "use strict";

  const root = document.getElementById("team-root");
  if (!root) return;

  const ICONS = {
    linkedin:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.6 8.65 21 11.2 21 14.5V21h-4v-5.7c0-1.37-.03-3.13-1.9-3.13-1.9 0-2.2 1.48-2.2 3.03V21H9z"/></svg>',
    github:
      '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>'
  };

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  const getInitials = (name) => {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    const first = parts[0][0];
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  };

  const makeInitials = (member) => {
    const tile = el("div", "member-initials", getInitials(member.name));
    tile.setAttribute("role", "img");
    tile.setAttribute("aria-label", `${member.name} (initials)`);
    return tile;
  };

  const makePhoto = (member) => {
    const frame = el("div", "member-photo");
    if (!member.photo) {
      frame.append(makeInitials(member));
      return frame;
    }
    const img = document.createElement("img");
    img.alt = `Photo of ${member.name}`;
    img.width = 400;
    img.height = 500;
    img.loading = "lazy";
    img.decoding = "async";
    // Attach the fallback before setting src so a fast failure is never missed
    img.addEventListener("error", () => img.replaceWith(makeInitials(member)), { once: true });
    img.src = member.photo;
    frame.append(img);
    return frame;
  };

  const isSafeUrl = (url) => /^https?:\/\//i.test(String(url || "").trim());

  const makeSocialLink = (url, network, label, name) => {
    const link = el("a", "social-link");
    link.href = url.trim();
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `${name} on ${label} (opens in a new tab)`);
    link.innerHTML = ICONS[network];
    return link;
  };

  const makeCard = (member) => {
    const card = el("article", member.lead ? "member-card is-lead" : "member-card");
    card.append(makePhoto(member));

    const body = el("div", "member-body");
    if (member.title) body.append(el("p", "member-role", member.title));
    body.append(el("h3", "member-name", member.name));
    // Ignore placeholder bios like "." so they don't show as stray marks
    if (member.bio && member.bio.trim().length > 1) body.append(el("p", "member-bio", member.bio.trim()));

    const links = [];
    if (isSafeUrl(member.linkedin)) links.push(makeSocialLink(member.linkedin, "linkedin", "LinkedIn", member.name));
    if (isSafeUrl(member.github)) links.push(makeSocialLink(member.github, "github", "GitHub", member.name));
    if (links.length) {
      const wrap = el("div", "member-links");
      wrap.append(...links);
      body.append(wrap);
    }

    card.append(body);
    return card;
  };

  const makeGroup = (id, eyebrow, heading, people, gridClass) => {
    const section = el("section", "team-group");
    section.setAttribute("aria-labelledby", id);

    const head = el("div", "team-group-head");
    const titles = el("div");
    titles.append(el("span", "eyebrow", eyebrow));
    const h2 = el("h2", "", heading);
    h2.id = id;
    titles.append(h2);
    const count = el("p", "team-count", `${people.length} ${people.length === 1 ? "person" : "people"}`);
    head.append(titles, count);

    const grid = el("div", `team-grid ${gridClass}`);
    grid.append(...people.map(makeCard));

    section.append(head, grid);
    return section;
  };

  const leads = TEAM.filter((m) => m.lead);
  const members = TEAM.filter((m) => !m.lead);

  if (leads.length) root.append(makeGroup("leads-title", "Leadership", "Leading the project", leads, "is-leads"));
  if (members.length) {
    root.append(makeGroup("members-title", "The team", leads.length ? "Group members" : "Meet everyone", members, "is-members"));
  }
})();
