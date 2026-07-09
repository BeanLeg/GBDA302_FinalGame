# Hear No Evil: Assignment 2 - Group Number: Group 2B

## Description

Hear No Evil is a top down survival horror puzzle game that explores themes of spatial psychological claustrophobia and vulnerability through the lens of a protagonist with a profound hearing impairment [2]. The player is then dropped into a dark, abandoned mansion layout and tasked with locating a hidden key that emits a soft visual glow, so they can open a locked door and escape, although, because the character is hard of hearing, enemies sneaking up from behind are completely silent and invisible until the player manually spins around to catch them directly in their field of vision. This design relies on a highly restrictive, mouse driven flashlight vision cone where anything outside the active sight beam is entirely blacked out. This mechanics driven configuration forces players to balance environmental exploration against an escalating, tactile feedback loop where survival depends entirely on your reaction speed [2].

## Design Rationale

Our prototype relies on an interactive loop tying action, feedback, player decisions, and progression together without heavy instruction menus. Players navigate corridors using keyboard inputs while directing a restricted, mouse driven visibility field across the canvas. Immediate visual and haptic feedback triggers when entities approach, forcing real-time tactical changes as players pivot their view cone to freeze stalking targets. Successful execution drives level progression, allowing users to secure the key and clear the stage. We integrated sensory limits directly into our core gameplay loop instead of treating them as a narrative dressing. Matching Sweetser and Wyeth's GameFlow principles, we mapped the character's profound hearing loss directly to challenge scaling and learning mechanisms [2]. By substituting traditional auditory cues with a physical ground-vibration warning, our screenshake scripts simulate feeling heavy thuds through floorboards when an unseen enemy draws near. This mechanic demands fast player evaluation: turn around immediately to trigger the entity freeze constraint, or check the spatial overlay to avoid dead ends. Additionally, we carefully applied Gaver's technology affordance framework to guide players through environmental mechanics naturally [1]. The soft visual glow of the hidden key establishes a perceptible affordance that draws player intent, while changing the exit door from red to green instinctively signals completion [1]. Based on our TA Jieun Lee's framework for observation, our feedback elements include a bounded cursor tracking bubble and a brief post death red predator silhouette outline, ensuring players quickly adapt their positioning strategy after a failure [3].

## Setup and Interaction Instructions

## Prerequisites

You will need a modern desktop web browser, specifically Google Chrome, to run the sketch smoothly.
There are no local installations or software dependencies required because the entire client-side framework executes directly through our live GitHub Pages playable link.

## Gameplay Controls

Movement: Press the W, A, S, D keys on your keyboard to guide your character's velocity through the mansion corridors.
Flashlight Orientation: Move your Mouse pointer across the screen canvas to guide the trajectory of your directional lighting beam. The hardware cursor is replaced by stylized yellow tracking dot, so you never lose control alignment.
Objective: Scan the dark rooms to find the glowing key asset while constantly sweeping your flashlight backward to freeze the stalking vampire before it reaches you.

## Iteration Notes

## Post-Playtest (Changes Implemented)

Bounded Yellow Dot Flashlight Cursor: We completely eliminated our original hidden hardware mouse tracking setup because playtesters fumble with inputs and lost track of where they were looking. Replacing it with a custom yellow dot restricted to a fixed tracking track close to the avatar keeps your aiming intuitive without breaking our light mask coordinates.
Minimalist Spatial Mini-Map Overlay: Based on a direct design recommendation from our teaching team, we programmed a basic, non-intrusive onscreen mini-map overlay in the corner of the UI [3]. Since our flashlight cone blacks out the rest of the map, playtesters were constantly getting stuck in blind spots, so this wall outline provides just enough spatial awareness to navigate corners safely [3].
Pacing of Screen-Shake and Calibrated Audio: Our initial playtesting data revealed that our ground-vibration feedback was triggering way too late, leaving players with zero time to react. We re-scripted the threshold intervals so the camera shakes noticeably earlier, and we mixed in muffled footsteps with directional binaural adjustments to make our disability integration feel fair and deeply immersive.

## Post-Showcase (Planned Long-Term Improvements)

Visual Freezing States for Entities: If we continue iterating this system for our final milestone, we plan to implement explicit visual asset changes on our enemies the exact second they enter the light mask, such as specialized freeze animations, to give players clear validation that their look action succeeded.
Dynamic Furniture and Asset Population: To expand our layout complexity and improve level pacing, our art subgroup wants to import detailed 32x32 pixel obstacle arrays like carpets, tables, and chairs. This will introduce physics-based pathfinding barriers to the level instead of letting players sprint straight through empty halls.

## Assets

| File                            | Source                                                                                               |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `assets/images/wall_tile.png`   | Mansion Interior Wall with Trim" original top-down pixel asset custom drawn by our group members.    |
| `assets/images/floor_tile.png`  | Spruce Planks Grid Alignment Layout" original wooden matrix asset custom drawn by our group members. |
| `assets/images/door_sprite.png` | Dynamic Status Gateway Asset" original open/locked state doorway custom drawn by our group members.  |
| `assets/images/furniture.json`  | Placement coordinate configuration maps designed entirely by our group members.                      |
| `assets/sounds/scarymusic.mp3`  | https://youtu.be/7ifWmw6U2dE?si=sjZFYGp-G1oG_V4K [4]                                                 |
| `assets/sounds/whisper.mp3`     | https://www.youtube.com/watch?v=7JOEKMiHJn0 [5]                                                      |
| `assets/sounds/seen.mp3`        | Generated by Claude AI                                                                               |
| `assets/sounds/gameover.mp3`    | https://www.youtube.com/watch?v=A9eHuIJ5M3o [6]                                                      |
| `assets/sounds/footstep1.mp3`   | https://pixabay.com/sound-effects/film-special-effects-st1-footstep-sfx-323053/ [7]                  |
| `assets/sounds/footstep2.mp3`   | https://pixabay.com/sound-effects/film-special-effects-st2-footstep-sfx-323055/ [8]                  |
| `assets/sounds/breathing.mp3`   | https://pixabay.com/sound-effects/people-heavy-breathing-sound-effect-type-01-294190/ [9]            |

## References

[1] Cardona-Rivera RE, Young RM. A cognitivist theory of affordances for games. In: Proceedings of DiGRA 2013 Conference: DeFragging Game Studies. Digital Games Research Association; 2013.
[2] Sweetser P, Wyeth P. GameFlow: a model for evaluating player enjoyment in games. Computers in Entertainment. 2005;3(3):3-3. doi:10.1145/1077246.1077253.
[3] Lee J. Week 6: Understanding Player Behaviour Through Observation and Simple Metrics. Course notes presented at: GBDA302: Global Digital Project 2; June 2026; University of Waterloo.
[4] TheMSsoundeffects. 2013. Distorted screams sound effect. (August 2013). Retrieved July 9, 2026 from https://www.youtube.com/watch?v=7ifWmw6U2dE
[5] WXYZVNNE. 2022. Four voices whispering : Horror film sound effects - youtube. (March 2022). Retrieved July 9, 2026 from https://www.youtube.com/watch?v=7JOEKMiHJn0
[6] ElktheBeast. 2023.(January 2023). Retrieved July 9, 2026 from https://www.youtube.com/watch?v=A9eHuIJ5M3o
[7]Data_pion. Free footstep sound effects download - pixabay. Retrieved July 9, 2026 from https://pixabay.com/sound-effects/search/footstep/
[8] data_pion. Free footstep sound effects download - pixabay. Retrieved July 9, 2026 from https://pixabay.com/sound-effects/search/footstep/
[9] ribhavagrawal. Heavy breathing sound effect - type 01 | royalty-free music - pixabay. Retrieved July 9, 2026 from https://pixabay.com/sound-effects/people-heavy-breathing-sound-effect-type-01-294190/
