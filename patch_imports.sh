#!/bin/bash
sed -i '11a\
import { AdvancedWouldYouRather } from "./games/AdvancedWouldYouRather";\
import { AdvancedNeverHaveIEver } from "./games/AdvancedNeverHaveIEver";\
import { AdvancedHowWellDoYouKnow } from "./games/AdvancedHowWellDoYouKnow";\
' src/components/CoupleGamesView.tsx
