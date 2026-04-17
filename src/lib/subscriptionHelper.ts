// Helper para obtener logos originales y información de suscripciones
export function getSubscriptionLogo(subscriptionName: string): string {
  const name = subscriptionName?.toLowerCase().trim() || '';
  
  const logoMap: { [key: string]: string } = {
    'netflix': 'https://cdn.worldvectorlogo.com/logos/netflix-2.svg',
    'spotify': 'https://cdn.worldvectorlogo.com/logos/spotify-2.svg',
    'chatgpt': 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    'openai': 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    'claude': 'https://cdn.worldvectorlogo.com/logos/anthropic-2.svg',
    'hbo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/HBO_wordmark.svg/1200px-HBO_wordmark.svg.png',
    'hbomax': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/HBO_wordmark.svg/1200px-HBO_wordmark.svg.png',
    'amazon prime': 'https://cdn.worldvectorlogo.com/logos/amazon-prime-video.svg',
    'prime video': 'https://cdn.worldvectorlogo.com/logos/amazon-prime-video.svg',
    'disney': 'https://cdn.worldvectorlogo.com/logos/disney-plus-2.svg',
    'disneyplus': 'https://cdn.worldvectorlogo.com/logos/disney-plus-2.svg',
    'disney+': 'https://cdn.worldvectorlogo.com/logos/disney-plus-2.svg',
    'apple tv': 'https://cdn.worldvectorlogo.com/logos/apple-tv-2.svg',
    'appletvplus': 'https://cdn.worldvectorlogo.com/logos/apple-tv-2.svg',
    'apple tv+': 'https://cdn.worldvectorlogo.com/logos/apple-tv-2.svg',
    'youtube': 'https://cdn.worldvectorlogo.com/logos/youtube-3.svg',
    'youtubeplus': 'https://cdn.worldvectorlogo.com/logos/youtube-3.svg',
    'youtube premium': 'https://cdn.worldvectorlogo.com/logos/youtube-3.svg',
    'twitch': 'https://cdn.worldvectorlogo.com/logos/twitch-2.svg',
    'xbox': 'https://cdn.worldvectorlogo.com/logos/xbox-2.svg',
    'gamepass': 'https://cdn.worldvectorlogo.com/logos/xbox-2.svg',
    'playstation': 'https://cdn.worldvectorlogo.com/logos/playstation-2.svg',
    'ps5': 'https://cdn.worldvectorlogo.com/logos/playstation-2.svg',
    'nintendo': 'https://cdn.worldvectorlogo.com/logos/nintendo-1.svg',
    'steam': 'https://cdn.worldvectorlogo.com/logos/steam-3.svg',
    'crunchyroll': 'https://cdn.worldvectorlogo.com/logos/crunchyroll-1.svg',
    'dropbox': 'https://cdn.worldvectorlogo.com/logos/dropbox-2.svg',
    'google one': 'https://cdn.worldvectorlogo.com/logos/google-one.svg',
    'icloud': 'https://cdn.worldvectorlogo.com/logos/icloud-2.svg',
    'onedrive': 'https://cdn.worldvectorlogo.com/logos/microsoft-onedrive.svg',
    'microsoft 365': 'https://cdn.worldvectorlogo.com/logos/microsoft-office.svg',
    'office365': 'https://cdn.worldvectorlogo.com/logos/microsoft-office.svg',
    'notion': 'https://cdn.worldvectorlogo.com/logos/notion-2.svg',
    'figma': 'https://cdn.worldvectorlogo.com/logos/figma-1.svg',
    'adobe': 'https://cdn.worldvectorlogo.com/logos/adobe-2.svg',
    'canva': 'https://cdn.worldvectorlogo.com/logos/canva-1.svg',
    'slack': 'https://cdn.worldvectorlogo.com/logos/slack-new-2.svg',
    'discord': 'https://cdn.worldvectorlogo.com/logos/discord-6.svg',
    'telegram': 'https://cdn.worldvectorlogo.com/logos/telegram-1.svg',
    'github': 'https://cdn.worldvectorlogo.com/logos/github-icon-2.svg',
    'gitlab': 'https://cdn.worldvectorlogo.com/logos/gitlab.svg',
    'udemy': 'https://cdn.worldvectorlogo.com/logos/udemy-3.svg',
    'skillshare': 'https://cdn.worldvectorlogo.com/logos/skillshare.svg',
    'masterclass': 'https://cdn.worldvectorlogo.com/logos/masterclass-3.svg',
    'coursera': 'https://cdn.worldvectorlogo.com/logos/coursera-2.svg',
  };
  
  // Buscar coincidencia exacta
  if (logoMap[name]) {
    return logoMap[name];
  }
  
  // Buscar coincidencia parcial
  for (const [key, logo] of Object.entries(logoMap)) {
    if (name.includes(key) || key.includes(name)) {
      return logo;
    }
  }
  
  // Default: color azul
  return '';
}

// Helper para obtener el color de la suscripción basado en el nombre
export function getSubscriptionColor(subscriptionName: string): string {
  // Todos usan el mismo color primario blue
  return 'bg-blue-600';
}

// Helper para obtener iniciales de un nombre
export function getInitials(name?: string | null): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
