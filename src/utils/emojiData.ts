// Curated massive emoji collection categorized by emotion, romance, food, fun, nature, and gaming
export interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: string[];
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'classic',
    name: 'Classic Marks',
    icon: '✕',
    emojis: ['✕', '◯', '✖️', '⭕', '❤️', '💖', '💘', '🤍', '🖤', '💜', '💙', '💚', '💛', '🧡'],
  },
  {
    id: 'romance',
    name: 'Love & Romance',
    icon: '💕',
    emojis: [
      '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '❤️', '🧡', '💛', '💚', '💙', '💜',
      '🤎', '🖤', '🤍', '💋', '💌', '💍', '💐', '🌹', '🥀', '🌺', '🌸', '🌼', '🌷', '✨',
      '🥰', '😍', '😘', '😗', '😙', '😚', '😻', '🏩', '💒', '💏', '👩‍❤️‍💋‍👨', '👩‍❤️‍👨', '💑'
    ],
  },
  {
    id: 'reactions',
    name: 'Expressive Faces',
    icon: '😎',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰',
      '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭',
      '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔',
      '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯',
      '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '😮', '😯', '😲', '😳', '🥺', '😦',
      '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱',
      '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '🤖'
    ],
  },
  {
    id: 'couple_cute',
    name: 'Cute & Animals',
    icon: '🐱',
    emojis: [
      '🐱', '🐶', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈',
      '🙉', '🙊', '🐒', '🦆', '🐧', '🐦', '🐥', '🐣', '🐤', '🦉', '🦋', '🐝', '🐞', '🐢',
      '🐙', '🐬', '🐳', '🦄', '🐾', '🐈', '🐕', '🐩', '🦔', '🐿️', '🐇', '🐹', '🦦', '🦭'
    ],
  },
  {
    id: 'fun_food',
    name: 'Food & Sweeties',
    icon: '🍰',
    emojis: [
      '🍓', '🍒', '🍎', '🍇', '🍉', '🍑', '🍍', '🥭', '🥝', '🥑', '🍔', '🍟', '🍕', '🌭',
      '🥪', '🌮', '🌯', '🍣', '🍤', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧',
      '🍫', '🍬', '🍭', '🍮', '🍯', '☕', '🍵', '🧃', '🥤', '🧋', '🥂', '🍾', '🍿', '🧇'
    ],
  },
  {
    id: 'vibes_symbols',
    name: 'Crowns & Magic',
    icon: '👑',
    emojis: [
      '👑', '💎', '🔥', '⚡', '⭐', '🌟', '💫', '✨', '🌙', '☀️', '🌈', '🪐', '🚀', '🎯',
      '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🪄', '🔮', '🧿', '🍀', '🎉', '🎊', '🎀', '🎁',
      '👑', '🌹', '🕊️', '🧸', '🎈', '🕯️', '💡', '🎵', '🎶', '🎷', '🎸', '🎹', '🎲', '♟️'
    ],
  },
  {
    id: 'sports_play',
    name: 'Sports & Play',
    icon: '⚽',
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '🥊', '🥋', '⛳',
      '🏹', '🎣', '🤿', '🎿', '🛹', '🛼', '🎮', '🕹️', '👾', '🧩', '🃏', '🎴', '🎭', '🎨'
    ],
  },
];

// Helper to quickly search or filter emojis
export function searchAllEmojis(term: string): string[] {
  if (!term.trim()) {
    // Return sample favorites
    return EMOJI_CATEGORIES.flatMap((c) => c.emojis).slice(0, 80);
  }
  const clean = term.toLowerCase().trim();
  const matchedCategories = EMOJI_CATEGORIES.filter((c) =>
    c.name.toLowerCase().includes(clean)
  );
  if (matchedCategories.length > 0) {
    return Array.from(new Set(matchedCategories.flatMap((c) => c.emojis)));
  }
  // Otherwise return full set filtered
  return Array.from(new Set(EMOJI_CATEGORIES.flatMap((c) => c.emojis)));
}
