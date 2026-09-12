#!/bin/bash

# Define the start and end patterns for the replacement
START_PATTERN="          {/\* MODE 1: WOULD YOU RATHER \*/}"
END_PATTERN="          {/\* MODE 4: DEEP CONVERSATION STARTERS \*/}"

# Generate the new content
cat << 'INNER_EOF' > new_games_content.txt
          {/* MODE 1: WOULD YOU RATHER */}
          {selectedGame === 'would-you-rather' && <AdvancedWouldYouRather />}

          {/* MODE 2: NEVER HAVE I EVER */}
          {selectedGame === 'never-have-i-ever' && <AdvancedNeverHaveIEver />}

          {/* MODE 3: HOW WELL DO YOU KNOW ME */}
          {selectedGame === 'how-well' && <AdvancedHowWellDoYouKnow />}

INNER_EOF

# Perform the replacement using awk
awk -v start="$START_PATTERN" -v end="$END_PATTERN" '
  BEGIN { p = 1 }
  $0 ~ start { 
    p = 0; 
    system("cat new_games_content.txt"); 
  }
  $0 ~ end { p = 1 }
  p { print $0 }
' src/components/CoupleGamesView.tsx > temp_CoupleGamesView.tsx

mv temp_CoupleGamesView.tsx src/components/CoupleGamesView.tsx
