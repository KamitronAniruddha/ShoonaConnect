#!/bin/bash
awk '
  /{\/\* MODE 4: DEEP CONVERSATION STARTERS \*\/}/ {
    print "          {/* MODE 1: WOULD YOU RATHER */}"
    print "          {selectedGame === \x27would-you-rather\x27 && <AdvancedWouldYouRather />}"
    print ""
    print "          {/* MODE 2: NEVER HAVE I EVER */}"
    print "          {selectedGame === \x27never-have-i-ever\x27 && <AdvancedNeverHaveIEver />}"
    print ""
    print "          {/* MODE 3: HOW WELL DO YOU KNOW ME */}"
    print "          {selectedGame === \x27how-well\x27 && <AdvancedHowWellDoYouKnow />}"
    print ""
  }
  {print}
' src/components/CoupleGamesView.tsx > temp.tsx
mv temp.tsx src/components/CoupleGamesView.tsx
