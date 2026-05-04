const revealItems = document.querySelectorAll(".reveal");
const themeButtons = document.querySelectorAll("[data-theme-option]");

const applyTheme = (theme) => {
  const selectedTheme = theme === "cosmic" ? "cosmic" : "gold";

  document.body.dataset.theme = selectedTheme;
  themeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.themeOption === selectedTheme);
  });
};

const readStoredTheme = () => {
  try {
    return localStorage.getItem("portfolio-theme");
  } catch {
    return "gold";
  }
};

const storeTheme = (theme) => {
  try {
    localStorage.setItem("portfolio-theme", theme);
  } catch {
    applyTheme(theme);
  }
};

const storedTheme = readStoredTheme();
applyTheme(storedTheme);

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedTheme = button.dataset.themeOption;
    storeTheme(selectedTheme);
    applyTheme(selectedTheme);
  });
});

const revealObserver = new IntersectionObserver(
  (observedItems) => {
    observedItems.forEach((item) => {
      if (item.isIntersecting) {
        item.target.classList.add("visible");
        revealObserver.unobserve(item.target);
      }
    });
  },
  {
    threshold: 0.14,
    rootMargin: "0px 0px -40px 0px",
  }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 45, 260)}ms`;
  revealObserver.observe(item);
});

const visual = document.querySelector(".system-visual");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (visual) {
  visual.addEventListener("pointermove", (event) => {
    const bounds = visual.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 10;

    visual.style.setProperty("--tilt-x", `${-y}deg`);
    visual.style.setProperty("--tilt-y", `${x}deg`);
    visual.style.transform = `perspective(900px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y))`;
  });

  visual.addEventListener("pointerleave", () => {
    visual.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  });
}

const network = document.querySelector(".network");

if (network && !prefersReducedMotion) {
  const nodes = [...network.querySelectorAll("[data-node]")];
  const lines = [...network.querySelectorAll("[data-line]")];
  const presets = [
    [
      [92, 322],
      [142, 282],
      [214, 238],
      [292, 258],
      [374, 184],
      [466, 210],
      [540, 142],
      [492, 318],
    ],
    [
      [300, 250],
      [94, 328],
      [178, 214],
      [270, 92],
      [415, 145],
      [526, 195],
      [462, 328],
      [238, 388],
    ],
    [
      [82, 358],
      [158, 308],
      [232, 264],
      [306, 226],
      [378, 188],
      [452, 156],
      [532, 126],
      [492, 348],
    ],
  ];
  const lineMap = [
    [1, 2, 0, 4, 5, 6],
    [3, 2, 0, 4, 6],
    [1, 7, 6, 5],
    [7, 0, 3],
    [2, 0, 6],
    [1, 0, 5],
  ];
  const duration = 9000;

  const ease = (value) => 0.5 - Math.cos(value * Math.PI) / 2;
  const mix = (start, end, amount) => start + (end - start) * amount;

  const drawNetwork = (time) => {
    const cycle = Math.floor(time / duration) % presets.length;
    const next = (cycle + 1) % presets.length;
    const progress = ease((time % duration) / duration);
    const points = presets[cycle].map((point, index) => [
      mix(point[0], presets[next][index][0], progress),
      mix(point[1], presets[next][index][1], progress),
    ]);

    nodes.forEach((node, index) => {
      const [x, y] = points[index];
      node.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
    });

    lines.forEach((line, index) => {
      const path = lineMap[index]
        .map((pointIndex, pathIndex) => {
          const [x, y] = points[pointIndex];
          return `${pathIndex === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(" ");
      line.setAttribute("d", path);
    });

    requestAnimationFrame(drawNetwork);
  };

  requestAnimationFrame(drawNetwork);
}
