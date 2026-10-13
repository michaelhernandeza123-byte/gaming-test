(function (root) {
  "use strict";

  const UNDERWATER_KEYWORDS = [
    "underwater", "ocean", "sea", "diver", "submarine", "reef",
    "whale", "whales", "humpback", "orca"
  ];
  const WHALE_KEYWORDS = ["whale", "whales", "humpback", "orca"];
  const RESCUE_KEYWORDS = ["rescue", "save", "help", "free", "trapped", "entangled", "injured"];
  const WHIRLPOOL_KEYWORDS = ["whirlpool", "maelstrom", "vortex", "emergency"];

  const underwaterStoryConfigs = {
    calm: {
      schemaVersion: 1,
      id: "underwater-calm-v1",
      title: "The Quiet Blue",
      startNodeId: "calm-arrival",
      sceneCount: 6,
      whaleEncounterNodeId: "calm-whale",
      nodes: [
        {
          id: "calm-arrival",
          text: "Sunlight follows your small submersible into a quiet blue canyon. A living reef glows below.",
          visual: {
            background: "assets/calm-ocean.svg",
            backgroundAlt: "A small submersible descending through calm blue water"
          },
          choices: [
            { id: "descend", text: "Descend toward the reef", nextNodeId: "calm-reef", effects: [] }
          ]
        },
        {
          id: "calm-reef",
          text: "Two safe routes cross the reef, and you have time to study only one closely.",
          visual: {
            background: "assets/coral-reef.svg",
            backgroundAlt: "Two paths crossing a colorful coral reef"
          },
          choices: [
            {
              id: "chart-current",
              text: "Chart the gentle current",
              nextNodeId: "calm-whale",
              effects: [{ type: "setFlag", flag: "chartedCurrent", value: true }]
            },
            {
              id: "study-ruins",
              text: "Inspect the coral-covered ruins",
              nextNodeId: "calm-whale",
              effects: [{ type: "setFlag", flag: "studiedRuins", value: true }]
            }
          ]
        },
        {
          id: "calm-whale",
          text: "A young whale appears beside a drifting research buoy. A loose cable is caught around its fin.",
          visual: {
            background: "assets/whale-water.svg",
            backgroundAlt: "Open blue water beside a drifting research buoy",
            character: "assets/whale.svg",
            characterAlt: "A young whale with a loose cable around its fin"
          },
          choices: [
            {
              id: "free-whale",
              text: "Carefully free the whale",
              nextNodeId: "calm-consequence",
              effects: [{ type: "setFlag", flag: "helpedWhale", value: true }]
            },
            {
              id: "observe-whale",
              text: "Keep a respectful distance and observe",
              nextNodeId: "calm-consequence",
              effects: [{ type: "setFlag", flag: "observedWhale", value: true }]
            }
          ]
        },
        {
          id: "calm-consequence",
          text: "The canyon opens into a field of silver fish.",
          visual: {
            background: "assets/calm-ocean.svg",
            backgroundAlt: "A calm underwater canyon filled with silver fish"
          },
          visualVariants: [
            {
              when: { flag: "chartedCurrent", equals: true },
              background: "assets/current-route.svg",
              backgroundAlt: "A bright current winding safely through silver fish"
            },
            {
              when: { flag: "studiedRuins", equals: true },
              background: "assets/ruins-route.svg",
              backgroundAlt: "Ancient underwater markers revealing a passage through ruins"
            }
          ],
          textVariants: [
            {
              when: { flag: "chartedCurrent", equals: true },
              text: "Your current chart reveals a safe passage through the silver fish toward a hidden lagoon."
            },
            {
              when: { flag: "studiedRuins", equals: true },
              text: "Symbols from the ruins match markers ahead and reveal the entrance to a forgotten lagoon."
            }
          ],
          choices: [
            { id: "continue", text: "Continue to the lagoon", nextNodeId: "calm-final-choice", effects: [] }
          ]
        },
        {
          id: "calm-final-choice",
          text: "The lagoon is untouched, but your oxygen window is closing. You must choose how to finish the expedition.",
          visual: {
            background: "assets/hidden-lagoon.svg",
            backgroundAlt: "A hidden underwater lagoon surrounded by glowing coral"
          },
          choices: [
            { id: "protect-lagoon", text: "Record the lagoon as a protected sanctuary", nextNodeId: "calm-sanctuary-ending", effects: [] },
            { id: "return-home", text: "Return with your discoveries", nextNodeId: "calm-home-ending", effects: [] }
          ]
        },
        {
          id: "calm-sanctuary-ending",
          ending: true,
          text: "You protect the hidden lagoon and complete a peaceful expedition.",
          visual: {
            background: "assets/hidden-lagoon.svg",
            backgroundAlt: "The protected hidden lagoon glowing peacefully",
            character: "assets/whale.svg",
            characterAlt: "A whale returning to the protected lagoon"
          },
          textVariants: [
            {
              when: { flag: "helpedWhale", equals: true },
              text: "The freed whale returns with its pod as you mark the hidden lagoon as a protected sanctuary."
            },
            {
              when: { flag: "observedWhale", equals: true },
              text: "Your patient whale observations help establish the hidden lagoon as a protected sanctuary."
            }
          ],
          choices: []
        },
        {
          id: "calm-home-ending",
          ending: true,
          text: "You return safely with a valuable record of the reef.",
          visual: {
            background: "assets/surface-route.svg",
            backgroundAlt: "A submersible returning toward sunlight at the ocean surface",
            character: "assets/submersible.svg",
            characterAlt: "The expedition submersible returning home"
          },
          textVariants: [
            {
              when: { flag: "helpedWhale", equals: true },
              text: "The whale you freed escorts your submersible home, and your expedition becomes a story of trust."
            },
            {
              when: { flag: "observedWhale", equals: true },
              text: "You return safely with careful whale observations and a valuable record of the reef."
            }
          ],
          choices: []
        }
      ]
    },
    emergency: {
      schemaVersion: 1,
      id: "underwater-whirlpool-v1",
      title: "Whirlpool Emergency",
      startNodeId: "emergency-alarm",
      sceneCount: 6,
      whaleEncounterNodeId: "emergency-whale",
      nodes: [
        {
          id: "emergency-alarm",
          text: "A whirlpool forms above the trench. Warning lights flash as the current pulls your submersible sideways.",
          visual: {
            background: "assets/whirlpool.svg",
            backgroundAlt: "A dangerous underwater whirlpool forming above a dark trench"
          },
          choices: [
            { id: "act", text: "Take emergency control", nextNodeId: "emergency-stabilize", effects: [] }
          ]
        },
        {
          id: "emergency-stabilize",
          text: "You can protect the engines or gain speed, but there is not enough power to do both.",
          visual: {
            background: "assets/whirlpool.svg",
            backgroundAlt: "Strong currents turning around the emergency submersible",
            character: "assets/submersible.svg",
            characterAlt: "A submersible with flashing emergency lights"
          },
          choices: [
            {
              id: "protect-engines",
              text: "Shield the engines",
              nextNodeId: "emergency-whale",
              effects: [{ type: "setFlag", flag: "protectedEngines", value: true }]
            },
            {
              id: "release-ballast",
              text: "Release the emergency ballast",
              nextNodeId: "emergency-whale",
              effects: [{ type: "setFlag", flag: "releasedBallast", value: true }]
            }
          ]
        },
        {
          id: "emergency-whale",
          text: "A whale swims against the current beside you. It knows a route between the rocks, but debris blocks its path.",
          visual: {
            background: "assets/whale-water.svg",
            backgroundAlt: "Fast dark water and debris beside a rocky trench",
            character: "assets/whale.svg",
            characterAlt: "A whale swimming against the dangerous current"
          },
          choices: [
            {
              id: "clear-debris",
              text: "Use the submersible arm to clear the debris",
              nextNodeId: "emergency-consequence",
              effects: [{ type: "setFlag", flag: "helpedWhale", value: true }]
            },
            {
              id: "follow-whale",
              text: "Conserve power and follow from a distance",
              nextNodeId: "emergency-consequence",
              effects: [{ type: "setFlag", flag: "followedWhale", value: true }]
            }
          ]
        },
        {
          id: "emergency-consequence",
          text: "The whale leads you toward a narrow break in the trench wall.",
          visual: {
            background: "assets/trench-route.svg",
            backgroundAlt: "A narrow passage through the underwater trench"
          },
          visualVariants: [
            {
              when: { flag: "protectedEngines", equals: true },
              background: "assets/trench-route.svg",
              backgroundAlt: "A steady submersible entering the protected trench route",
              character: "assets/submersible.svg",
              characterAlt: "The submersible moving with protected engines"
            },
            {
              when: { flag: "releasedBallast", equals: true },
              background: "assets/surface-route.svg",
              backgroundAlt: "A lighter submersible rising quickly through the current",
              character: "assets/submersible.svg",
              characterAlt: "The submersible rising after releasing its ballast"
            }
          ],
          textVariants: [
            {
              when: { flag: "protectedEngines", equals: true },
              text: "Your protected engines hold steady while the whale leads you toward a narrow break in the trench wall."
            },
            {
              when: { flag: "releasedBallast", equals: true },
              text: "Without the ballast, your lighter submersible rises quickly toward the route the whale revealed."
            }
          ],
          choices: [
            { id: "continue", text: "Approach the escape route", nextNodeId: "emergency-final-choice", effects: [] }
          ]
        },
        {
          id: "emergency-final-choice",
          text: "The whirlpool tightens. One route leads through the whale's rocky passage; another climbs along the outer current.",
          visual: {
            background: "assets/whirlpool.svg",
            backgroundAlt: "The rocky passage and outer current beneath a tightening whirlpool",
            character: "assets/whale.svg",
            characterAlt: "The whale waiting near two possible escape routes"
          },
          choices: [
            { id: "whale-route", text: "Take the whale's rocky passage", nextNodeId: "emergency-rescue-ending", effects: [] },
            { id: "outer-current", text: "Ride the outer current upward", nextNodeId: "emergency-surface-ending", effects: [] }
          ]
        },
        {
          id: "emergency-rescue-ending",
          ending: true,
          text: "You escape through the trench and reach calm water.",
          visual: {
            background: "assets/trench-route.svg",
            backgroundAlt: "Calm water beyond the narrow trench passage",
            character: "assets/whale.svg",
            characterAlt: "The whale guiding the submersible into calm water"
          },
          textVariants: [
            {
              when: { flag: "helpedWhale", equals: true },
              text: "The whale waits for you, then guides your submersible through the trench to calm water."
            },
            {
              when: { flag: "followedWhale", equals: true },
              text: "By carefully following the whale's path, you slip through the trench and reach calm water."
            }
          ],
          choices: []
        },
        {
          id: "emergency-surface-ending",
          ending: true,
          text: "You break free of the outer current and surface beyond the whirlpool.",
          visual: {
            background: "assets/surface-route.svg",
            backgroundAlt: "Sunlight above the ocean beyond the fading whirlpool",
            character: "assets/submersible.svg",
            characterAlt: "The submersible safely reaching the surface"
          },
          textVariants: [
            {
              when: { flag: "helpedWhale", equals: true },
              text: "The whale pushes against the current beside you until both of you surface beyond the whirlpool."
            },
            {
              when: { flag: "followedWhale", equals: true },
              text: "The route you learned from the whale helps you ride the outer current and surface safely."
            }
          ],
          choices: []
        }
      ]
    }
  };

  function promptContainsAny(prompt, keywords) {
    const words = String(prompt || "").toLowerCase();
    return keywords.some(function (keyword) {
      const safeKeyword = keyword.replace(/[.*+?^$()|[\]\\{}]/g, "\\$&");
      return new RegExp("\\b" + safeKeyword + "\\b").test(words);
    });
  }

  function cloneConfig(config) {
    return JSON.parse(JSON.stringify(config));
  }

  function findNode(config, nodeId) {
    return config.nodes.find(function (node) { return node.id === nodeId; });
  }

  // Each whale decision gets its own later scene, final decision, and endings.
  // The player can therefore reach a different event, action, and outcome.
  function splitWhaleRoutes(config, routes) {
    const sourceIds = ["calm-consequence", "calm-final-choice", "calm-sanctuary-ending", "calm-home-ending"];
    const sourceNodes = sourceIds.map(function (id) { return findNode(config, id); });
    const encounter = findNode(config, "calm-whale");
    config.nodes = config.nodes.filter(function (node) { return !sourceIds.includes(node.id); });

    routes.forEach(function (route) {
      const ids = sourceIds.map(function (id) { return route.prefix + "-" + id; });
      const nodes = sourceNodes.map(function (node, index) {
        const copy = cloneConfig(node);
        copy.id = ids[index];
        copy.choices.forEach(function (choice) {
          const targetIndex = sourceIds.indexOf(choice.nextNodeId);
          if (targetIndex !== -1) choice.nextNodeId = ids[targetIndex];
        });
        return copy;
      });
      const whaleChoice = encounter.choices.find(function (choice) { return choice.id === route.choiceId; });
      whaleChoice.nextNodeId = ids[0];
      nodes[0].text = route.consequence;
      nodes[0].textVariants = [];
      nodes[1].text = route.finalDecision;
      nodes[1].choices = route.actions.map(function (action, index) {
        return { id: action.id, text: action.text, nextNodeId: ids[index + 2], effects: [] };
      });
      nodes[2].text = route.firstEnding;
      nodes[2].textVariants = [];
      nodes[3].text = route.secondEnding;
      nodes[3].textVariants = [];
      if (route.prefix.endsWith("observed")) {
        nodes[2].visual = {
          background: "assets/surface-route.svg",
          backgroundAlt: "The submersible surfacing with an observation record",
          character: "assets/submersible.svg",
          characterAlt: "The expedition submersible returning to the surface"
        };
      }
      config.nodes.push.apply(config.nodes, nodes);
    });
    return config;
  }

  function configureRescueStory(config) {
    config.id = "underwater-calm-rescue-v2";
    config.title = "Rescue in the Quiet Blue";
    return splitWhaleRoutes(config, [
      {
        prefix: "rescue-freed", choiceId: "free-whale",
        consequence: "The cable falls away. The whale calls to its pod, which leads your submersible through the reef toward a sheltered lagoon.",
        finalDecision: "The pod gathers in the lagoon, and your oxygen is running low. You can document their refuge or head home with them.",
        actions: [
          { id: "protect-pod", text: "Document the pod's sanctuary" },
          { id: "escort-home", text: "Follow the pod safely home" }
        ],
        firstEnding: "Your rescue reveals the pod's refuge. You record its location for protection, and the freed whale reunites with its family.",
        secondEnding: "The freed whale and its pod escort you to the surface. You return with a rescue account and a safe route through the reef."
      },
      {
        prefix: "rescue-observed", choiceId: "observe-whale",
        consequence: "The whale is still entangled when it disappears behind the reef. Your observations give you the buoy's coordinates but no sign that it has escaped.",
        finalDecision: "Your oxygen is running low. You have the location and the cable's markings, but the whale still needs help.",
        actions: [
          { id: "call-rescue", text: "Report the entanglement to a rescue team" },
          { id: "return-record", text: "Return with your observation record" }
        ],
        firstEnding: "You radio the buoy coordinates and cable markings to a rescue team. They begin a search; the whale's fate remains unknown to you.",
        secondEnding: "You reach the surface with a detailed observation record. The whale was still entangled when you left, and your expedition ends without a confirmed rescue."
      }
    ]);
  }

  function configureMeetingStory(config) {
    config.id = "underwater-calm-meet-v2";
    config.title = "A Whale in the Quiet Blue";

    const encounter = findNode(config, "calm-whale");
    encounter.text =
      "A young whale swims freely through the blue water. It circles a curtain of silver fish, then turns toward the open canyon.";
    encounter.visual.characterAlt = "A young whale swimming freely through blue water";
    encounter.choices = [
      {
        id: "follow-whale",
        text: "Follow the whale at a respectful distance",
        nextNodeId: "calm-consequence",
        effects: [{ type: "setFlag", flag: "followedWhale", value: true }]
      },
      {
        id: "observe-whale",
        text: "Stay quietly and observe the whale",
        nextNodeId: "calm-consequence",
        effects: [{ type: "setFlag", flag: "observedWhale", value: true }]
      }
    ];

    const sanctuaryEnding = findNode(config, "calm-sanctuary-ending");
    sanctuaryEnding.textVariants = [
      {
        when: { flag: "followedWhale", equals: true },
        text: "Following the whale reveals how its pod uses the lagoon. You mark their gathering place as a protected sanctuary."
      },
      {
        when: { flag: "observedWhale", equals: true },
        text: "Your patient whale observations show that the lagoon is a nursery, giving you the evidence needed to protect it."
      }
    ];

    const homeEnding = findNode(config, "calm-home-ending");
    homeEnding.textVariants = [
      {
        when: { flag: "followedWhale", equals: true },
        text: "The route you learned from the whale leads you safely home with a map of the pod's migration path."
      },
      {
        when: { flag: "observedWhale", equals: true },
        text: "You return safely with a careful record of the whale's behavior and the undisturbed reef."
      }
    ];
    return splitWhaleRoutes(config, [
      {
        prefix: "meet-followed", choiceId: "follow-whale",
        consequence: "The free whale leads you past the silver fish and into a lagoon where its pod gathers. You now know their route through the reef.",
        finalDecision: "You can protect the pod's gathering place or follow their route back before your oxygen runs low.",
        actions: [
          { id: "protect-gathering", text: "Map the pod's protected gathering place" },
          { id: "follow-route-home", text: "Follow their route toward the surface" }
        ],
        firstEnding: "You chart the pod's gathering place as a sanctuary. The whale returns to its family, and your map helps protect their route.",
        secondEnding: "Following the pod's route brings you safely home with a map of its migration path and a memorable encounter."
      },
      {
        prefix: "meet-observed", choiceId: "observe-whale",
        consequence: "From a distance you record the whale's calls and behavior. It swims on without leading you to the lagoon.",
        finalDecision: "With little oxygen left, you can finish your field notes or head directly to the surface.",
        actions: [
          { id: "finish-notes", text: "Finish the whale behavior record" },
          { id: "surface-now", text: "Surface with your observations" }
        ],
        firstEnding: "You complete a careful record of the whale's calls. It may aid future research, though the pod's hidden gathering place remains undiscovered.",
        secondEnding: "You surface safely with a brief account of a free whale. Its route and pod remain unknown."
      }
    ]);
  }

  function select(prompt) {
    const hasUnderwaterDetail = promptContainsAny(prompt, UNDERWATER_KEYWORDS);
    const hasEmergencyDetail = promptContainsAny(prompt, WHIRLPOOL_KEYWORDS);
    if (!hasUnderwaterDetail && !hasEmergencyDetail) return null;
    if (hasEmergencyDetail) return cloneConfig(underwaterStoryConfigs.emergency);

    const config = cloneConfig(underwaterStoryConfigs.calm);
    const hasWhaleDetail = promptContainsAny(prompt, WHALE_KEYWORDS);
    const asksForRescue = hasWhaleDetail && promptContainsAny(prompt, RESCUE_KEYWORDS);
    if (asksForRescue) return configureRescueStory(config);
    if (hasWhaleDetail) return configureMeetingStory(config);
    return config;
  }

  function endingTitle(nodeId, flags, fallbackTitle) {
    const state = flags || {};
    const whaleRouteTitles = {
      "rescue-freed-calm-sanctuary-ending": "The Pod's Sanctuary",
      "rescue-freed-calm-home-ending": "The Whale's Escort",
      "rescue-observed-calm-sanctuary-ending": "Rescue Team Alerted",
      "rescue-observed-calm-home-ending": "An Unconfirmed Rescue",
      "meet-followed-calm-sanctuary-ending": "The Pod's Hidden Sanctuary",
      "meet-followed-calm-home-ending": "The Whale's Route Home",
      "meet-observed-calm-sanctuary-ending": "A Careful Field Record",
      "meet-observed-calm-home-ending": "The Brief Encounter"
    };
    if (whaleRouteTitles[nodeId]) return whaleRouteTitles[nodeId];
    if (nodeId === "calm-sanctuary-ending") {
      if (state.helpedWhale) return "The Freed Pod's Sanctuary";
      if (state.followedWhale) return "The Pod's Hidden Sanctuary";
      if (state.observedWhale) return "The Patient Observer's Sanctuary";
    }
    if (nodeId === "calm-home-ending") {
      if (state.helpedWhale) return "The Whale's Escort";
      if (state.followedWhale) return "The Whale's Route Home";
      if (state.observedWhale) return "A Careful Record";
    }
    if (nodeId === "emergency-rescue-ending") {
      return state.helpedWhale ? "Rescue Through the Trench" : "The Learned Passage";
    }
    if (nodeId === "emergency-surface-ending") {
      return state.helpedWhale ? "Together Beyond the Whirlpool" : "Riding the Outer Current";
    }
    return fallbackTitle;
  }

  const preferenceOptions = Object.freeze({ mood: ["peaceful", "tense"], focus: ["exploration", "helping"], difficulty: ["easy", "challenging"] });
  function validPreferences(prefs) {
    return !!prefs && typeof prefs === "object" && !Array.isArray(prefs) &&
      Object.keys(prefs).length === 3 && Object.keys(preferenceOptions).every(key => preferenceOptions[key].includes(prefs[key]));
  }

  // The pilot's deterministic selection and split-route authoring pattern, extended
  // with explicit per-adventure preferences. Legacy configurations stay untouched.
  function personalize(prompt, prefs) {
    if (!validPreferences(prefs) || typeof prompt !== "string" || !prompt.trim() || prompt.length > 1000) return null;
    if (!promptContainsAny(prompt, UNDERWATER_KEYWORDS.concat(WHIRLPOOL_KEYWORDS, ["ruins", "temple", "ancient"]))) return null;
    const whale = promptContainsAny(prompt, WHALE_KEYWORDS);
    const ruins = !whale && promptContainsAny(prompt, ["ruins", "temple", "ancient"]);
    const rescue = whale && promptContainsAny(prompt, RESCUE_KEYWORDS);
    const subject = whale ? "whale" : ruins ? "ruins" : "reef";
    const help = rescue || prefs.focus === "helping", tense = prefs.mood === "tense", hard = prefs.difficulty === "challenging";
    const image = (background, alt, character) => Object.assign({background: "assets/" + background + ".svg", backgroundAlt: alt}, character ? {character:"assets/"+character+".svg",characterAlt: character === "whale" ? "A young whale in blue water" : "Your expedition submersible"} : {});
    const choice = (id, text, nextNodeId, flag) => ({id,text,nextNodeId,effects:flag?[{type:"setFlag",flag,value:true}]:[]});
    const mission = rescue ? "Rescue the entangled whale" : help ? (whale ? "Clear the whale's blocked route" : ruins ? "Restore the ruins' warning beacon" : "Restore the reef's monitoring buoy") :
      whale ? "Meet a free-swimming whale" : ruins ? "Explore the submerged ruins" : "Explore the living reef";
    const action = rescue ? "Carefully release the cable" : help ? (whale ? "Move the debris blocking the whale's route" : "Use your spare battery to restore the beacon") :
      whale ? "Follow the whale into the canyon" : ruins ? "Enter the mapped ruins passage" : "Follow the reef's silver fish";
    const alternate = help ? "Keep your distance and record the location" : "Stay outside and make a quiet observation record";
    const encounter = rescue ? "A loose cable holds a young whale beside a research buoy. You can attempt the direct rescue or record its position from a safe distance." :
      whale ? (help ? "A free-swimming whale approaches a passage blocked by fallen research debris. It is not trapped, but clearing the passage would reopen its route." : "A young whale swims freely past silver fish. You can follow its route or remain outside the canyon to observe.") :
      ruins ? (help ? "An old warning beacon in the submerged ruins has lost power. Restoring it would help later divers avoid the unstable arch." : "Carved markers reveal an entrance to the submerged ruins. Enter the mapped passage, or stay outside to record the carvings.") :
      help ? "The reef's monitoring buoy has lost power. Your spare battery could restore its warning signal for visiting boats." : "Silver fish gather beside a living reef. Follow them deeper or record the reef from its outer edge.";
    const activeObjective = help ? (rescue ? "The cable falls away and the whale swims free." : whale ? "The debris is clear and the free whale can use its route again." : "The restored beacon transmits a warning to visiting divers and boats.") :
      whale ? "Following the free whale reveals its pod's sheltered gathering place." : ruins ? "Inside the mapped passage you discover a chamber of preserved carvings." : "Following the fish reveals a sheltered coral nursery.";
    const passiveObjective = help ? (rescue ? "You do not attempt the rescue. The whale remains caught; your coordinates can guide a trained team." : "You leave the task unfinished and record its location for a trained maintenance team.") : "You remain outside. Your observations are useful, but the hidden site remains unexplored.";
    const activeFinal = help ? "Document the restored route for protection" : "Map the discovery as a protected site";
    const activeReturn = whale ? "Follow the whale's route home" : "Return with a detailed discovery record";
    const passiveFinal = help ? "Signal a trained team with the coordinates" : "Complete your observation record";
    const passiveReturn = help ? "Return without calling a team" : "Surface with a brief observation report";
    const config = {schemaVersion:1,id:"personal-v1-"+subject+(rescue?"-rescue":"")+"-"+prefs.mood+"-"+prefs.focus+"-"+prefs.difficulty,
      title:mission,startNodeId:"personal-arrival",sceneCount:6,nodes:[
        {id:"personal-arrival",text:mission+". Your selected preferences shape this authored expedition; your decisions determine what you accomplish.",visual:image("calm-ocean","The expedition descending into blue water","submersible"),choices:[choice("begin","Begin the expedition","personal-event")]},
        {id:"personal-event",text:tense?"A sudden current drives loose debris across the trench entrance. Choose how to get past it before approaching your objective.":"Sunlight reaches a calm reef crossing. Choose what to examine on the way to your objective.",visual:image(tense?"trench-route":"coral-reef",tense?"Debris crossing the narrow trench":"A quiet sunlit coral reef"),choices:tense?
          [choice("shield","Shield the submersible and cross below the debris","personal-encounter","shieldedHull"),choice("wait","Wait behind the rocks for the current to ease","personal-encounter","waitedCurrent")]:
          [choice("chart","Chart the gentle current","personal-encounter","chartedCurrent"),choice("study","Study the reef markers","personal-encounter","studiedMarkers")]},
        {id:"personal-encounter",text:encounter+(hard?" Challenging expedition: taking the direct action uses your reserve power; afterwards you must return and cannot remain to protect the site.":" Easy expedition: you have reserve power for a direct action and one additional objective."),visual:image(rescue?"whale-water":ruins?"ruins-route":"calm-ocean",rescue?"A whale beside an entangling research buoy":ruins?"Ancient submerged ruins":"Open water beside the reef",whale?"whale":"submersible"),choices:[choice("act",action,"personal-active-route","actedDirectly"),choice("observe",alternate,"personal-observed-route","keptDistance")]},
        {id:"personal-active-route",text:activeObjective+(hard?" Your reserve power is spent; the return route is your only safe remaining objective.":" Your reserve power leaves time to choose a final objective."),visual:image(ruins?"ruins-route":"hidden-lagoon","The route revealed by your direct action",whale?"whale":"submersible"),choices:[choice("continue-active","Continue along the revealed route","personal-active-choice")]},
        {id:"personal-observed-route",text:passiveObjective+" You retain your reserve power and reach a clear communication channel.",visual:image("surface-route","The submersible at a clear communication channel","submersible"),choices:[choice("continue-observed","Reach the communication channel","personal-observed-choice")]},
        {id:"personal-active-choice",text:hard?"Your direct action used the reserve. Return now; staying to protect the site is unavailable on this route.":"Your direct action opened a new route. Choose how to complete the expedition.",visual:image("hidden-lagoon","The expedition's final route"),choices:hard?[choice("return-direct",activeReturn,"personal-direct-return","returnedDirectly")]:[choice("protect",activeFinal,"personal-protected","protectedSite"),choice("return-direct",activeReturn,"personal-direct-return","returnedDirectly")]},
        {id:"personal-observed-choice",text:help?"You have coordinates, not a completed intervention. Will you call a team or leave the task unresolved?":"You have an observation record, not access to the hidden site. Decide how much to complete before surfacing.",visual:image("surface-route","A clear route back to the surface"),choices:[choice("report",passiveFinal,"personal-reported","completedReport"),choice("return-observed",passiveReturn,"personal-unresolved","leftUnresolved")]},
        {id:"personal-direct-return",ending:true,text:activeObjective+" You return safely with the route you earned."+(hard?" Spending the reserve meant giving up the protection objective.":" You chose to return rather than record the site for protection."),visual:image("surface-route","The expedition returning home","submersible"),choices:[]},
        {id:"personal-reported",ending:true,text:help?(rescue?"A rescue team acknowledges your coordinates and sets out. The whale remains caught when your expedition ends; a rescue is not yet confirmed.":"A maintenance team acknowledges your coordinates. The task you declined remains unfinished until they arrive."):"You complete a careful observation record. The hidden site remains unexplored, but your notes will guide a future expedition.",visual:image("surface-route","The completed report sent from the surface","submersible"),choices:[]},
        {id:"personal-unresolved",ending:true,text:help?(rescue?"You return without calling a team. The whale remains caught and its rescue is unresolved.":whale?"You return without calling a team. The fallen debris still blocks the free whale's route.":"You return without calling a team. The broken equipment remains unrepaired."):"You surface with a brief observation report, leaving the hidden site undiscovered.",visual:image("surface-route","The submersible surfacing with an unfinished objective","submersible"),choices:[]}
      ]};
    if(!hard)config.nodes.push({id:"personal-protected",ending:true,text:activeObjective+" You record the site for protection, giving your direct action a lasting result.",visual:image("hidden-lagoon","The site recorded for protection"),choices:[]});
    if(whale)config.whaleEncounterNodeId="personal-encounter";
    const encounterNode = findNode(config, "personal-encounter");
    encounterNode.textVariants = (tense ? [
      ["shieldedHull", "Your shielded hull carries you below the debris and safely to the objective. "],
      ["waitedCurrent", "Waiting behind the rocks lets the current ease before you approach. "]
    ] : [["chartedCurrent", "Your charted current leads safely to the objective. "],
      ["studiedMarkers", "The reef markers you studied identify the approach to the objective. "]]).map(([flag,text]) => ({when:{flag,equals:true},text:text+encounterNode.text}));
    return config;
  }

  // Read-only radio guide. Authored replies use the existing graph and flags;
  // they never add dialogue history to the saved story or modify its signature.
  function companion(config, state) {
    if (!config || typeof config.id !== "string" || !config.id.startsWith("personal-v1-") || !state || !state.flags) return null;
    const node = config.nodes.find(item => item.id === state.currentNodeId);
    if (!node) return null;
    const hard = config.id.endsWith("-challenging");
    const acted = state.flags.actedDirectly === true;
    const observed = state.flags.keptDistance === true;
    const rescue = config.id.includes("-rescue-");
    const whale = config.id.startsWith("personal-v1-whale-");
    const helping = rescue || config.id.includes("-helping-");
    const ruins = config.id.startsWith("personal-v1-ruins-");
    const topics = [{id:"situation",question:node.ending ? "What did we accomplish?" : "What is happening here?",answer:
      node.ending ? "Mira: " + node.text : "Mira: " + ((node.textVariants || []).find(variant => state.flags[variant.when.flag] === variant.when.equals) || node).text}];
    if (!node.ending) topics.push({id:"options",question:"What can I do now?",answer:"Mira: Your current actions are: " + node.choices.map(choice => choice.text).join("; ") + ". Asking me does not choose an action or advance the story."});
    topics.push({id:"reserve",question:node.ending ? "How did the reserve affect our expedition?" : "How much reserve do I have?",answer:"Mira: " + (node.ending ?
      hard && acted ? "Your direct action spent the reserve. You returned without the additional protection objective; that was the tradeoff of this challenging expedition." :
      observed ? "You kept the reserve by observing. That did not unlock direct intervention or discovery: your expedition ended on the reporting route." :
      "The easy expedition left enough reserve for both direct action and a final objective. Your final choice determined what we recorded or left behind." :
      observed ? "You kept your reserve by observing. We have passed the encounter; this route offers reporting, not a second chance to intervene or protect the hidden site." :
      hard && acted ?
      "Your direct action spent the reserve. You can return safely, but the protection objective is no longer available on this route." :
      hard ? "Your reserve is intact. Taking the direct action at the encounter will spend it and remove the later protection option. Keeping your distance retains it, but does not complete the intervention or discovery." :
      acted ? "Your easy expedition retained reserve after the direct action, so the final choice can include protection as well as returning." :
      "This easy expedition has enough reserve for the direct action and a final objective. Your later options still depend on whether you act directly or keep your distance.")});
    if (acted || observed) topics.push({id:"consequence",question:"How did my choice change things?",answer:"Mira: " + (acted ?
      rescue ? "You released the cable: the whale is free. That opened its route instead of the reporting route." :
      helping ? (whale ? "You cleared the debris and reopened the free whale's route." : "You restored the warning signal instead of leaving the equipment unrepaired.") :
      whale ? "You followed the free whale and discovered its pod's sheltered gathering place." : ruins ? "You entered the mapped passage and discovered preserved carvings." : "You followed the fish and discovered a coral nursery." :
      rescue ? "You kept your distance. The whale remains caught. A report is not a confirmed rescue." :
      helping ? "You recorded the location but left the intervention unfinished. Keeping the reserve did not repair the equipment or clear the route." :
      "You stayed outside and recorded the location. The hidden site remains unexplored; observation did not open its protection route.") + (hard && acted ? " Spending your reserve also removed the protection action." : "") + (node.ending ? " " + node.text : "")});
    return {name:"Mira",topics};
  }

  const api = Object.freeze({ select, endingTitle, personalize, validPreferences, preferenceOptions, companion });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.BespokeUnderwaterStory = api;
})(typeof window !== "undefined" ? window : globalThis);
