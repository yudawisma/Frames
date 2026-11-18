/* ===== Frames: public/js/frames.js ===== */
(function () {
  var root = document.documentElement;
  var lenis = null;
  var PORTFOLIO = "https://portofo-silk.vercel.app";
  var data = window.FRAMES || [];
  var notes = [
    "Air tidak melawan batu. Ia mencari jalan, dan pelan-pelan batu pun berubah bentuk.",
    "Jatuh bukan akhir. Air yang sudah di bawah tetap mengalir ke tempat berikutnya.",
    "Tidak semua hal harus cepat. Sungai sampai ke laut tanpa terburu-buru.",
    "Tenang bukan berarti diam. Air yang paling dalam biasanya arusnya paling pelan.",
  ];
  var chapters = ["Hening", "Mengalir", "Kabut", "Suara Burung", "Pulang"];
  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function pill(k, extra) {
    return data[k]
      ? '<span class="fr-pill' +
          extra +
          '" style="background-image:url(\'' +
          esc(data[k].src) +
          "')\"></span>"
      : "";
  }
  var count = document.getElementById("frCount");
  if (count)
    count.textContent = (data.length < 10 ? "0" : "") + data.length + " foto";

  /* ===== bangun galeri ===== */
  var main = document.getElementById("gallery");
  if (main && data.length) {
    var html =
      '<section class="fr-intro"><div class="fr-eyebrow">Bab 01</div><p data-words>Air terjun selalu menenangkan pikiranku ' +
      pill(1, "") +
      ". Di sana tidak ada yang mendesak " +
      pill(2, " fr-pill--round") +
      " hanya suara air dan napas yang ikut melambat.</p></section>";
    for (var s = 0; s * 5 < data.length; s++) {
      if (s > 0) {
        html +=
          '<div class="fr-marquee" aria-hidden="true" data-dir="' +
          (s % 2 ? 1 : -1) +
          '"><span>Mengalir &mdash; Tenang &mdash; Terus berjalan &mdash;</span></div>';
      }
      html +=
        '<div class="fr-chapter"><span>' +
        pad2(s + 1) +
        "</span><b>" +
        chapters[s % chapters.length] +
        "</b><i></i></div>";
      html +=
        '<section class="fr-set' +
        (s % 2 ? " is-flip" : "") +
        '" aria-label="Galeri foto">';
      data.slice(s * 5, s * 5 + 5).forEach(function (f, j) {
        var i = s * 5 + j;
        var cap = [f.place, f.year].filter(Boolean).join(", ");
        html +=
          '<figure class="fr-card"><button type="button" data-full="' +
          esc(f.src) +
          '" data-caption="' +
          esc(cap) +
          '" aria-label="Perbesar foto ' +
          (i + 1) +
          '">' +
          '<img src="' +
          esc(f.src) +
          '" alt="' +
          esc(cap || "Air terjun, foto " + (i + 1)) +
          '" loading="lazy" decoding="async"></button>' +
          '<figcaption><span class="fr-no">' +
          pad2(i + 1) +
          "</span>" +
          (cap ? "<span>" + esc(cap) + "</span>" : "") +
          "</figcaption></figure>";
      });
      html += "</section>";
      if (s * 5 + 5 < data.length && notes[s])
        html += '<p class="fr-note">' + esc(notes[s]) + "</p>";
    }
    main.innerHTML = html;
  }
  document.querySelectorAll("[data-portfolio]").forEach(function (a) {
    a.href = PORTFOLIO + (a.getAttribute("data-portfolio") || "");
  });

  /* video hero: diam jika gerak dibatasi, jeda saat keluar layar */
  var vid = document.querySelector("video.fr-hero__bg");
  if (vid) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      vid.removeAttribute("autoplay");
      vid.pause();
    } else if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            var p = vid.play();
            if (p) p.catch(function () {});
          } else vid.pause();
        });
      }).observe(vid.parentNode);
    }
  }

  /* HP: pakai video yang lebih ringan */
  if (vid && window.matchMedia("(max-width:760px)").matches) {
    var vsrc = vid.querySelector("source");
    if (vsrc) {
      vsrc.src = "video/vd-mobile.mp4";
      vid.load();
    }
  }

  var lb = document.getElementById("lightbox");
  if (!lb) return;

  var shots = [].slice.call(document.querySelectorAll(".fr-card button"));
  var img = lb.querySelector("img");
  var cap = lb.querySelector(".fr-lb__cap");
  var current = 0;
  var opener = null;

  function show(n) {
    current = (n + shots.length) % shots.length;
    var b = shots[current];
    img.style.animation = "none";
    void img.offsetWidth;
    img.style.animation = "";
    img.src = b.getAttribute("data-full");
    img.alt = b.getAttribute("data-caption") || "";
    var label = current + 1 + " / " + shots.length;
    var c = b.getAttribute("data-caption");
    cap.textContent = c ? label + "  |  " + c : label;
  }
  function open(n) {
    opener = document.activeElement;
    show(n);
    lb.hidden = false;
    document.body.classList.add("is-locked");
    if (lenis) lenis.stop();
    lb.querySelector(".fr-lb__close").focus();
  }
  function close() {
    lb.hidden = true;
    img.removeAttribute("src");
    document.body.classList.remove("is-locked");
    if (lenis) lenis.start();
    if (opener) opener.focus();
  }
  shots.forEach(function (b, i) {
    b.addEventListener("click", function () {
      open(i);
    });
  });

  lb.addEventListener("click", function (e) {
    var act = e.target.getAttribute("data-lb");
    if (act === "close" || e.target === lb) close();
    else if (act === "prev") show(current - 1);
    else if (act === "next") show(current + 1);
  });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(current - 1);
    else if (e.key === "ArrowRight") show(current + 1);
  });
  var startX = null;
  lb.addEventListener(
    "touchstart",
    function (e) {
      startX = e.touches[0].clientX;
    },
    { passive: true },
  );
  lb.addEventListener("touchend", function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    startX = null;
  });

  /* ===== efek (hanya jika gerak tidak dibatasi) ===== */
  if (root.classList.contains("js")) {
    /* judul hero huruf demi huruf (hero, tidak diubah) */
    var title = document.querySelector("[data-split]");
    if (title) {
      var t = title.textContent.trim();
      title.setAttribute("aria-label", t);
      title.classList.add("is-split");
      title.innerHTML = t
        .split("")
        .map(function (ch, i) {
          return (
            '<span aria-hidden="true" style="--i:' +
            i +
            '">' +
            (ch === " " ? "&nbsp;" : ch) +
            "</span>"
          );
        })
        .join("");
    }

    /* pecah kalimat pembuka jadi kata */
    var intro = document.querySelector("[data-words]");
    if (intro) {
      var n = 0;
      [].slice.call(intro.childNodes).forEach(function (node) {
        if (node.nodeType === 3) {
          var frag = document.createDocumentFragment();
          node.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(" "));
              return;
            }
            var sp = document.createElement("span");
            sp.className = "w";
            sp.style.setProperty("--i", n++);
            sp.textContent = part;
            frag.appendChild(sp);
          });
          intro.replaceChild(frag, node);
        } else if (node.nodeType === 1) {
          node.classList.add("w");
          node.style.setProperty("--i", n++);
        }
      });
    }

    var cinematic = window.gsap && window.ScrollTrigger;
    if (cinematic) {
      /* ---------- GSAP + Lenis ---------- */
      gsap.registerPlugin(ScrollTrigger);
      root.classList.add("gs");

      if (window.Lenis) {
        lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(function (time) {
          lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
        document.querySelectorAll('a[href^="#"]').forEach(function (a) {
          a.addEventListener("click", function (e) {
            var id = a.getAttribute("href");
            var el = id.length > 1 && document.querySelector(id);
            if (el) {
              e.preventDefault();
              lenis.scrollTo(el, { duration: 1.6 });
            }
          });
        });
      }

      /* kalimat pembuka: kata menyala mengikuti scroll */
      var words = gsap.utils.toArray(".fr-intro .w");
      if (words.length) {
        gsap.fromTo(
          words,
          { opacity: 0.12 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.12,
            scrollTrigger: {
              trigger: ".fr-intro p",
              start: "top 82%",
              end: "bottom 48%",
              scrub: true,
            },
          },
        );
      }
      gsap.from(".fr-eyebrow", {
        opacity: 0,
        x: -30,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: ".fr-eyebrow", start: "top 90%", once: true },
      });

      /* label bab: garis memanjang */
      gsap.utils.toArray(".fr-chapter").forEach(function (c) {
        gsap.from(c.querySelector("i"), {
          scaleX: 0,
          duration: 1.6,
          ease: "power3.inOut",
          scrollTrigger: { trigger: c, start: "top 90%", once: true },
        });
        gsap.from(c.querySelectorAll("span,b"), {
          opacity: 0,
          y: 24,
          stagger: 0.12,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: c, start: "top 90%", once: true },
        });
      });

      /* foto: terbuka dari bawah + zoom mengendap + parallax scrub */
      gsap.utils.toArray(".fr-card").forEach(function (card) {
        var btn = card.querySelector("button");
        var im = card.querySelector("img");
        var fc = card.querySelector("figcaption");
        var tl = gsap.timeline({
          scrollTrigger: { trigger: card, start: "top 88%", once: true },
        });
        tl.fromTo(
          btn,
          { clipPath: "inset(100% 0% 0% 0%)", y: 60 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            y: 0,
            duration: 1.5,
            ease: "power4.inOut",
          },
          0,
        )
          .fromTo(
            im,
            { scale: 1.35 },
            { scale: 1, duration: 2.2, ease: "power3.out" },
            0,
          )
          .fromTo(
            fc,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
            0.9,
          );
        gsap.fromTo(
          im,
          { yPercent: -5 },
          {
            yPercent: 5,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });

      /* marquee outline bergeser mengikuti scroll */
      gsap.utils.toArray(".fr-marquee").forEach(function (m) {
        var dir = parseInt(m.getAttribute("data-dir"), 10) || -1;
        gsap.fromTo(
          m.firstElementChild,
          { xPercent: dir < 0 ? 5 : -35 },
          {
            xPercent: dir < 0 ? -35 : 5,
            ease: "none",
            scrollTrigger: {
              trigger: m,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });

      /* catatan & penutup */
      gsap.utils.toArray(".fr-note").forEach(function (el) {
        gsap.from(el, {
          opacity: 0,
          y: 50,
          duration: 1.6,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
      var foot = document.querySelector(".fr-footer");
      if (foot) {
        gsap.from(foot.children, {
          opacity: 0,
          y: 70,
          stagger: 0.2,
          duration: 1.6,
          ease: "power3.out",
          scrollTrigger: { trigger: foot, start: "top 75%", once: true },
        });
      }
      window.addEventListener("load", function () {
        ScrollTrigger.refresh();
      });
    } else {
      /* ---------- fallback tanpa GSAP ---------- */
      var targets = [].slice.call(
        document.querySelectorAll(".fr-card, .fr-intro, .fr-note, .fr-footer"),
      );
      if ("IntersectionObserver" in window) {
        var seen = new IntersectionObserver(
          function (es) {
            es.forEach(function (e) {
              if (e.isIntersecting) {
                e.target.classList.add("is-in");
                seen.unobserve(e.target);
              }
            });
          },
          { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
        );
        targets.forEach(function (el) {
          seen.observe(el);
        });
      } else {
        targets.forEach(function (el) {
          el.classList.add("is-in");
        });
      }
    }

    /* kursor "Lihat" */
    var cur = document.querySelector(".fr-cursor");
    if (cur && window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
      document.addEventListener(
        "pointermove",
        function (e) {
          cur.style.transform =
            "translate3d(" + e.clientX + "px," + e.clientY + "px,0)";
        },
        { passive: true },
      );
      shots.forEach(function (b) {
        b.addEventListener("pointerenter", function () {
          cur.classList.add("is-on");
        });
        b.addEventListener("pointerleave", function () {
          cur.classList.remove("is-on");
        });
      });
    }
  }

  /* parallax hero + progress bar (hero tidak diubah) */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var hero = document.querySelector(".fr-hero__bg");
  var bar = document.querySelector(".fr-progress");
  var ticking = false;
  function drift() {
    var vh = window.innerHeight;
    if (hero && window.innerWidth > 760)
      hero.style.translate = "0 " + Math.min(window.scrollY, vh) * 0.12 + "px";
    if (bar)
      bar.style.transform =
        "scaleX(" +
        Math.min(
          1,
          window.scrollY /
            Math.max(1, document.documentElement.scrollHeight - vh),
        ) +
        ")";
    ticking = false;
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(drift);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  drift();
})();
