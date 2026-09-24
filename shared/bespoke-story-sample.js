(function (root) {
  "use strict";
  // Example content only. No special cases for this adventure exist in the player.
  const story = {
    schemaVersion: 1,
    id: "lost-research-beacon-v1",
    title: "The Lost Research Beacon",
    startNodeId: "arrival",
    sceneCount: 6,
    nodes: [
      {
        id: "arrival",
        text: "A research beacon has gone silent beneath the reef. You pilot a small submersible down to discover what happened.",
        visual: { background: "assets/calm-ocean.svg", backgroundAlt: "Sunlight fading into calm blue water" },
        choices: [{ id: "dive", text: "Follow the last recorded signal", nextNodeId: "beacon", effects: [] }]
      },
      {
        id: "beacon",
        text: "You find the beacon among the coral. Its battery is dead. Your spare battery could restore its signal, but keeping it would leave more power for your own lights.",
        visual: { background: "assets/coral-reef.svg", backgroundAlt: "A colorful coral reef where the lost beacon rests" },
        choices: [
          { id: "repair", text: "Use the spare battery to repair the beacon", nextNodeId: "archive", effects: [{ type: "setFlag", flag: "repairedBeacon", value: true }] },
          { id: "conserve", text: "Keep the battery and mark the beacon's position", nextNodeId: "archive", effects: [{ type: "setFlag", flag: "repairedBeacon", value: false }] }
        ]
      },
      {
        id: "archive",
        text: "Beyond the reef, a flooded research station holds a sealed journal. Recovering it will take the time you could use to chart a safer return route.",
        visual: { background: "assets/ruins-route.svg", backgroundAlt: "A passage between submerged stone structures" },
        choices: [
          { id: "journal", text: "Recover the researchers' journal", nextNodeId: "return", effects: [{ type: "setFlag", flag: "recoveredJournal", value: true }] },
          { id: "chart", text: "Leave the journal and chart the return route", nextNodeId: "return", effects: [{ type: "setFlag", flag: "recoveredJournal", value: false }] }
        ]
      },
      {
        id: "return",
        text: "You turn the submersible toward home.",
        textVariants: [
          { when: { flag: "repairedBeacon", equals: true }, text: "The beacon you repaired flashes through the water. Its signal guides you back through the reef, even as your own lights begin to dim." },
          { when: { flag: "repairedBeacon", equals: false }, text: "The beacon remains dark. The battery you saved powers your lights as you carefully retrace the reef markers." }
        ],
        visual: { background: "assets/current-route.svg", backgroundAlt: "A winding path through the ocean" },
        visualVariants: [
          { when: { flag: "repairedBeacon", equals: true }, background: "assets/current-route.svg", backgroundAlt: "A bright route guided by the restored signal" },
          { when: { flag: "repairedBeacon", equals: false }, background: "assets/trench-route.svg", backgroundAlt: "A darker route followed using the submersible's lights" }
        ],
        choices: [{ id: "continue", text: "Reach the sheltered lagoon", nextNodeId: "decision", effects: [] }]
      },
      {
        id: "decision",
        text: "From the sheltered lagoon you can send a message to the research team, or surface and deliver your findings in person.",
        visual: { background: "assets/hidden-lagoon.svg", backgroundAlt: "A quiet lagoon sheltered by coral" },
        choices: [
          { id: "transmit", text: "Send the team your findings from the lagoon", nextNodeId: "signal-ending", effects: [] },
          { id: "surface", text: "Surface and meet the team in person", nextNodeId: "home-ending", effects: [] }
        ]
      },
      {
        id: "signal-ending", ending: true,
        text: "The research team receives your report and prepares its next expedition.",
        textVariants: [
          { when: { flag: "recoveredJournal", equals: true }, text: "You transmit the journal's discoveries from the lagoon. The team learns why the station was abandoned and plans a careful return. Your recovered evidence changes their expedition." },
          { when: { flag: "recoveredJournal", equals: false }, text: "You transmit the safe route you charted. The team can now return to retrieve the journal themselves. Your navigation work makes their expedition possible." }
        ],
        visual: { background: "assets/hidden-lagoon.svg", backgroundAlt: "The sheltered lagoon at the end of the expedition" },
        choices: []
      },
      {
        id: "home-ending", ending: true,
        text: "You surface and meet the research team.",
        textVariants: [
          { when: { flag: "recoveredJournal", equals: true }, text: "You surface with the sealed journal and hand it to the waiting researchers. Together you open a record of their missing station. You brought its story home." },
          { when: { flag: "recoveredJournal", equals: false }, text: "You surface with a detailed route map. The waiting researchers can plan a safe recovery trip. You brought them a way back." }
        ],
        visual: { background: "assets/surface-route.svg", backgroundAlt: "A submersible returning to the sunlit surface", character: "assets/submersible.svg", characterAlt: "Your submersible returning home" },
        choices: []
      }
    ]
  };
  if (typeof module !== "undefined" && module.exports) module.exports = story;
  else root.BespokeSampleStory = story;
})(typeof window !== "undefined" ? window : globalThis);
