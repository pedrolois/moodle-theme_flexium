var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { jsxDEV } from "react/jsx-dev-runtime";
/**
 * The blocks of the site footer: how each block type looks with its settings.
 *
 * @module     theme_flexium/footer/Blocks
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { useEffect, useRef } from "react";
const str = /* @__PURE__ */ __name((strings, key, a = "") => (strings[key] ?? key).replace("{$a}", String(a)), "str");
const text = /* @__PURE__ */ __name((settings, key) => typeof settings[key] === "string" ? settings[key] : "", "text");
const items = /* @__PURE__ */ __name((settings) => Array.isArray(settings.items) ? settings.items : [], "items");
const BRAND = {
  linkedin: "#0a66c2",
  x: "#000000",
  facebook: "#1877f2",
  instagram: "#e4405f",
  youtube: "#ff0000",
  github: "#181717",
  tiktok: "#000000",
  whatsapp: "#25d366",
  telegram: "#26a5e4",
  mastodon: "#6364ff",
  bluesky: "#0085ff",
  email: "#6c757d",
  website: "#6c757d"
};
function Title({ settings }) {
  return text(settings, "title") ? /* @__PURE__ */ jsxDEV("h2", { className: "flexium-footer__title", children: text(settings, "title") }, void 0, false, {
    fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
    lineNumber: 64,
    columnNumber: 38
  }, this) : null;
}
__name(Title, "Title");
function Nothing({ context, label }) {
  return context.editing ? /* @__PURE__ */ jsxDEV("p", { className: "flexium-footer__muted", children: [
    label,
    " \xB7 ",
    str(context.strings, "footer_notavailable")
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
    lineNumber: 71,
    columnNumber: 30
  }, this) : null;
}
__name(Nothing, "Nothing");
function UserTour({ context }) {
  const holder = useRef(null);
  useEffect(() => {
    const original = document.querySelector("#page-footer .tool_usertours-resettourcontainer");
    if (!original || !holder.current) {
      return void 0;
    }
    const move = /* @__PURE__ */ __name(() => {
      while (original.firstChild && holder.current) {
        holder.current.appendChild(original.firstChild);
      }
    }, "move");
    move();
    const observer = new MutationObserver(move);
    observer.observe(original, { childList: true });
    return () => observer.disconnect();
  }, []);
  return /* @__PURE__ */ jsxDEV("div", { className: "flexium-footer__tour", children: [
    /* @__PURE__ */ jsxDEV("div", { ref: holder }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
      lineNumber: 97,
      columnNumber: 13
    }, this),
    context.editing && /* @__PURE__ */ jsxDEV("span", { className: "flexium-footer__muted", children: context.data.tourreset }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
      lineNumber: 98,
      columnNumber: 33
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
    lineNumber: 96,
    columnNumber: 9
  }, this);
}
__name(UserTour, "UserTour");
function LogoBlock({ settings, context }) {
  const { data } = context;
  return /* @__PURE__ */ jsxDEV("a", { href: data.homeurl, className: `flexium-footer__logo flexium-footer__logo--${text(settings, "size") || "md"}`, children: [
    data.logo && /* @__PURE__ */ jsxDEV("img", { src: data.logo, alt: settings.showname === true ? "" : data.sitename }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
      lineNumber: 110,
      columnNumber: 27
    }, this),
    (settings.showname === true || !data.logo) && /* @__PURE__ */ jsxDEV("span", { children: data.sitename }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
      lineNumber: 111,
      columnNumber: 60
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
    lineNumber: 109,
    columnNumber: 9
  }, this);
}
__name(LogoBlock, "LogoBlock");
function TextBlock({ settings }) {
  return /* @__PURE__ */ jsxDEV("div", { children: [
    /* @__PURE__ */ jsxDEV(Title, { settings }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
      lineNumber: 122,
      columnNumber: 13
    }, this),
    text(settings, "text").split(/\n{2,}/).filter(Boolean).map((paragraph, index) => /* @__PURE__ */ jsxDEV("p", { className: "flexium-footer__text", children: paragraph }, index, false, {
      fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
      lineNumber: 124,
      columnNumber: 44
    }, this))
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
    lineNumber: 121,
    columnNumber: 9
  }, this);
}
__name(TextBlock, "TextBlock");
function LinksBlock({ settings }) {
  return /* @__PURE__ */ jsxDEV("nav", { "aria-label": text(settings, "title") || void 0, children: [
    /* @__PURE__ */ jsxDEV(Title, { settings }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
      lineNumber: 135,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("ul", { className: "flexium-footer__links", children: items(settings).map((item, index) => /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(
      "a",
      {
        href: String(item.url || "#"),
        ...item.newtab === true ? { target: "_blank", rel: "noopener noreferrer" } : {},
        children: String(item.name ?? "")
      },
      void 0,
      false,
      {
        fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
        lineNumber: 139,
        columnNumber: 25
      },
      this
    ) }, index, false, {
      fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
      lineNumber: 138,
      columnNumber: 21
    }, this)) }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
      lineNumber: 136,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
    lineNumber: 134,
    columnNumber: 9
  }, this);
}
__name(LinksBlock, "LinksBlock");
function ContactBlock({ settings }) {
  const email = text(settings, "email");
  const phone = text(settings, "phone");
  const website = text(settings, "website");
  const address = text(settings, "address");
  const rows = [
    email && { icon: "fa-regular fa-envelope", href: `mailto:${email}`, label: email },
    phone && { icon: "fa-solid fa-phone", href: `tel:${phone.replace(/[^0-9+]/g, "")}`, label: phone },
    website && { icon: "fa-solid fa-globe", href: website, label: website.replace(/^https?:\/\//, "").replace(/\/$/, "") },
    address && { icon: "fa-solid fa-location-dot", href: "", label: address }
  ].filter(Boolean);
  return /* @__PURE__ */ jsxDEV("div", { children: [
    /* @__PURE__ */ jsxDEV(Title, { settings }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
      lineNumber: 166,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("ul", { className: "flexium-footer__contact", children: rows.map((row) => /* @__PURE__ */ jsxDEV("li", { children: [
      /* @__PURE__ */ jsxDEV("i", { className: row.icon, "aria-hidden": "true" }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
        lineNumber: 170,
        columnNumber: 25
      }, this),
      row.href ? /* @__PURE__ */ jsxDEV("a", { href: row.href, children: row.label }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
        lineNumber: 171,
        columnNumber: 37
      }, this) : /* @__PURE__ */ jsxDEV("span", { children: row.label }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
        lineNumber: 171,
        columnNumber: 74
      }, this)
    ] }, row.icon, true, {
      fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
      lineNumber: 169,
      columnNumber: 21
    }, this)) }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
      lineNumber: 167,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
    lineNumber: 165,
    columnNumber: 9
  }, this);
}
__name(ContactBlock, "ContactBlock");
function SocialBlock({ settings, context }) {
  const classes = [
    "flexium-social",
    `flexium-social--${text(settings, "shape") || "round"}`,
    `flexium-social--${text(settings, "variant") || "filled"}`,
    `flexium-social--${text(settings, "size") || "md"}`
  ];
  const href = /* @__PURE__ */ __name((network, url) => network === "email" && !url.includes(":") ? `mailto:${url}` : url, "href");
  return /* @__PURE__ */ jsxDEV("div", { children: [
    /* @__PURE__ */ jsxDEV(Title, { settings }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
      lineNumber: 188,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("ul", { className: classes.join(" "), children: items(settings).filter((item) => item.url).map((item, index) => {
      const network = String(item.network || "website");
      const colour = settings.brandcolours === true ? BRAND[network] : void 0;
      const label = str(context.strings, `network_${network}`);
      return /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(
        "a",
        {
          href: href(network, String(item.url)),
          target: "_blank",
          rel: "noopener noreferrer",
          className: "flexium-social__link",
          title: label,
          style: colour ? { "--flexium-social": colour } : void 0,
          children: [
            /* @__PURE__ */ jsxDEV("i", { className: context.networks[network] ?? "fa-solid fa-link", "aria-hidden": "true" }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
              lineNumber: 199,
              columnNumber: 33
            }, this),
            /* @__PURE__ */ jsxDEV("span", { className: "visually-hidden", children: label }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
              lineNumber: 200,
              columnNumber: 33
            }, this)
          ]
        },
        void 0,
        true,
        {
          fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
          lineNumber: 196,
          columnNumber: 29
        },
        this
      ) }, index, false, {
        fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
        lineNumber: 195,
        columnNumber: 25
      }, this);
    }) }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
      lineNumber: 189,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
    lineNumber: 187,
    columnNumber: 9
  }, this);
}
__name(SocialBlock, "SocialBlock");
function LegalBlock({ settings, context }) {
  const { data, strings } = context;
  const chosen = (Array.isArray(settings.items) ? settings.items : []).filter((key) => data.legal[key]);
  if (!chosen.length) {
    return /* @__PURE__ */ jsxDEV(Nothing, { context, label: str(strings, "footer_type_legal") }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
      lineNumber: 217,
      columnNumber: 16
    }, this);
  }
  return /* @__PURE__ */ jsxDEV("nav", { children: [
    /* @__PURE__ */ jsxDEV(Title, { settings }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
      lineNumber: 221,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("ul", { className: "flexium-footer__inline", children: chosen.map((key) => /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV("a", { href: data.legal[key].url, children: data.legal[key].label }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
      lineNumber: 223,
      columnNumber: 50
    }, this) }, key, false, {
      fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
      lineNumber: 223,
      columnNumber: 36
    }, this)) }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
      lineNumber: 222,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
    lineNumber: 220,
    columnNumber: 9
  }, this);
}
__name(LegalBlock, "LegalBlock");
function SupportBlock({ settings, context }) {
  const support = context.data.support;
  if (!support) {
    return /* @__PURE__ */ jsxDEV(Nothing, { context, label: str(context.strings, "footer_type_support") }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
      lineNumber: 235,
      columnNumber: 16
    }, this);
  }
  return /* @__PURE__ */ jsxDEV(
    "a",
    {
      href: support.url,
      ...support.external ? { target: "_blank", rel: "noopener noreferrer" } : {},
      className: text(settings, "style") === "link" ? "flexium-footer__supportlink" : "btn flexium-footer__supportbtn",
      children: [
        /* @__PURE__ */ jsxDEV("i", { className: "fa-regular fa-life-ring me-2", "aria-hidden": "true" }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
          lineNumber: 241,
          columnNumber: 13
        }, this),
        support.label
      ]
    },
    void 0,
    true,
    {
      fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
      lineNumber: 238,
      columnNumber: 9
    },
    this
  );
}
__name(SupportBlock, "SupportBlock");
const isEmptyBlock = /* @__PURE__ */ __name((block) => {
  const settings = block.settings;
  switch (block.type) {
    case "text":
      return text(settings, "title") === "" && text(settings, "text").trim() === "";
    case "links":
      return !items(settings).some((item) => item.url && item.name);
    case "contact":
      return ["email", "phone", "website", "address"].every((key) => text(settings, key).trim() === "");
    case "social":
      return !items(settings).some((item) => item.url);
    default:
      return false;
  }
}, "isEmptyBlock");
function BlockView({ block, context }) {
  if (isEmptyBlock(block)) {
    return context.editing ? /* @__PURE__ */ jsxDEV("p", { className: "flexium-footer__muted", children: str(context.strings, "footer_empty") }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
      lineNumber: 273,
      columnNumber: 34
    }, this) : null;
  }
  const settings = block.settings;
  const { data } = context;
  switch (block.type) {
    case "logo":
      return /* @__PURE__ */ jsxDEV(LogoBlock, { settings, context }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
        lineNumber: 278,
        columnNumber: 29
      }, this);
    case "text":
      return /* @__PURE__ */ jsxDEV(TextBlock, { settings }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
        lineNumber: 279,
        columnNumber: 29
      }, this);
    case "links":
      return /* @__PURE__ */ jsxDEV(LinksBlock, { settings }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
        lineNumber: 280,
        columnNumber: 30
      }, this);
    case "contact":
      return /* @__PURE__ */ jsxDEV(ContactBlock, { settings }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
        lineNumber: 281,
        columnNumber: 32
      }, this);
    case "social":
      return /* @__PURE__ */ jsxDEV(SocialBlock, { settings, context }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
        lineNumber: 282,
        columnNumber: 31
      }, this);
    case "legal":
      return /* @__PURE__ */ jsxDEV(LegalBlock, { settings, context }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
        lineNumber: 283,
        columnNumber: 30
      }, this);
    case "support":
      return /* @__PURE__ */ jsxDEV(SupportBlock, { settings, context }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
        lineNumber: 284,
        columnNumber: 32
      }, this);
    case "usertour":
      return /* @__PURE__ */ jsxDEV(UserTour, { context }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
        lineNumber: 285,
        columnNumber: 33
      }, this);
    case "copyright":
      return /* @__PURE__ */ jsxDEV("p", { className: "flexium-footer__copyright", children: (text(settings, "text") || "\xA9 {year} {sitename}").replace("{year}", data.year).replace("{sitename}", data.sitename) }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
        lineNumber: 288,
        columnNumber: 17
      }, this);
    case "logininfo":
      return /* @__PURE__ */ jsxDEV("p", { className: "flexium-footer__muted", children: data.login }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/footer/Blocks.tsx",
        lineNumber: 293,
        columnNumber: 34
      }, this);
    default:
      return null;
  }
}
__name(BlockView, "BlockView");
export {
  BlockView as default,
  isEmptyBlock,
  str
};
//# sourceMappingURL=Blocks.dev.js.map
