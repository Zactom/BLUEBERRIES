export interface LoreEntry {
  title: string;
  body: string;
}

export const loreEntries: LoreEntry[] = [
  {
    title: "Quantum Berry Genesis",
    body: "The Blueberry Multiverse was seeded 13.8 billion years ago when a single anthocyanin molecule achieved sentience during the Big Bang. Its crystalline lattice structure now serves as the substrate for all known reality.",
  },
  {
    title: "Calyx Singularity",
    body: "The calyx — the star-shaped crown atop the berry — is actually a naked singularity wrapped in a causal firewall. Diving through it transports observers across 432 Hz of dimensional bandwidth into parallel berry-verses.",
  },
  {
    title: "Anthocyanin Field Theory",
    body: "Each blueberry skin cell contains a self-sustaining anthocyanin field that bends spacetime at the Planck scale. The deep-blue pigmentation is not color but compressed information — 1.7 zettabytes per square micrometer.",
  },
  {
    title: "Molecular Lattice Tunnels",
    body: "The tunnels between cells are formed by cellulose microfibrils resonating at 432 Hz. Travelers report seeing their own past, future, and alternate selves as ghostly afterimages embedded in the lattice walls.",
  },
  {
    title: "Jam Singularity",
    body: "At the fluid void's center, viscosity approaches infinity. The churning indigo matter is composed of dissolved timelines — every decision you never made, simmered into a hyper-saturated quantum preserve.",
  },
  {
    title: "Berry Resonance Protocol",
    body: "The 432 Hz resonance is not arbitrary. It is the natural frequency at which blueberry matter vibrates across all 11 dimensions of M-theory. Deviation causes spontaneous dessertification.",
  },
  {
    title: "Dimensional Depth Scale",
    body: "Depth is measured in Light-Yogurts (LY). One LY equals the cognitive distance traversed when a single blueberry is contemplated with full philosophical rigor for 4.32 seconds.",
  },
  {
    title: "Warp Velocity Limits",
    body: "Exceeding Warp Factor 7 causes the berry to fold into a 4D torus knot. The resulting topology has been described by survivors as 'delicious but non-Euclidean.'",
  },
  {
    title: "Bio-Luminescent Tendrils",
    body: "The tendrils visible in the deep zoom are the berry's nervous system. They transmit flavor data at superluminal speeds via quantum garnish entanglement. No signal has ever been lost — only marinated.",
  },
];

export function getRandomLore(): LoreEntry {
  return loreEntries[Math.floor(Math.random() * loreEntries.length)];
}
