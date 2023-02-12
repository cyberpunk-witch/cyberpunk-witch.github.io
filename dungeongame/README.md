This is a game I'm fiddling with in my spare time.
I'm not really 100% sure what the final form will be
I'm just gonna add features and improve it for now
plot and everything else will come later. I want it
to be improved to the point it is kind of fun for me to make stuff with.

notes
--combat is currently coupled with the monster behavior
inside of its 'act' sequence

probably fixed:
--GRASS AND PORTALS SOMETIMES MALFUNCTION - fix. We broke something. This was working. This could be a side effect of resizing. -- fixed by undoing resizing hack
--hp cannot recover - FIXED
---- figure out a 'base hp' for each level, and recover up to that over time, each move - fixed

wishlist
--general code cleanup and simplification sorely needed.  But we need to manage complexity.
--each function should do one thing well, and then functions should be composed. start from there.
--also just look for things that look hacky, and add a 'hack' comment. then remove all the hack comments 
--sometimes I seem to die suddenly? maybe I'm not paying attention... look at damage scaling, fight logic just in case. maybe a balance issue. seems like hp but I die sometimes too.
   -- might also be timing
--cannot resize
  --proposed fix: 
    resize event, get current size of window, change out tileset, regenerate but retain ascii map, entities, player stats etc
--maybe wait until after fixing 'cannot save'
-- simple fix: change from onresize to just getting initial screensize
-- complex fix: fiddle with the display logic to get it to actually change the display as intended
--change to real time instead of movement based
--create inventory system
--add inventory tab to sidebar menu
--allow swapping weapons
--weapon detail screen
--make potion use voluntary instead of immediate
--change attack mechanics 
--different attacks with different buttons - primary and secondary attack (two button)
--add current attack changes to menu
--add scrolls to create 'magic' attacks that can be used as attacks
--add poison mechanics for some monsters
--add mana, healing magic
--monster death notices sometimes don't show
--change sounds logic so checking if background sounds is on is inherent to 'play' function and doesn't have to be checked each time
--add VOLUME CONTROL cause the sounds are awful by default*
--add graphics for sound control (sliders?)
--improve graphics, improve sounds
--more types of monsters per level*
--sound effects BUG - toggling sound effects doesn't work reliably, sound effects without music maybe fails
--do we go back or keep with resizing? not being able to resize looks gross. We should keep with resizing and figure out the map system
--separate functions and state, move state management into separate entity entirely. 
entities, components, systems
entities are unique ids like mobs or players
components carry data, entities link to component data
systems act on specific components across all entities
--improved lighting system, or figure out how to use rot.js' built-in lighting stuff (I believe it DOES have something for that) for fog-of-war
--add a system wherein mapped areas are visible (but not lit) on map. like dark gray squares. (maybe add a mechanism for just adding custom tiles rather than
relying on the map thing to map tiles onto canvas? -- look at what it is inserting... )
--make monster pursuit only happen when they are near you



