import { Creator, Artwork, Job, Topic } from './types';

export const CREATORS: Creator[] = [
  {
    id: 'c1',
    name: 'Elena Void',
    handle: '@elenavoid',
    bio: 'Digital architect weaving dreams into pixels. Specialist in cyberpunk landscapes and ethereal portraits using Midjourney v6.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400',
    coverImage: 'https://images.unsplash.com/photo-1614728853970-a86c3f080614?auto=format&fit=crop&w=1200&h=400',
    available: true,
    stats: {
      successRate: 99,
      responseTime: '< 1 hr',
      completedJobs: 142
    },
    techStack: ['Midjourney v6', 'Stable Diffusion', 'Photoshop']
  },
  {
    id: 'c2',
    name: 'Arto Automata',
    handle: '@artobot',
    bio: 'Exploring the boundaries of generative surrealism. I create visual paradoxes and neon-soaked realities.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&h=400',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=400',
    available: false,
    stats: {
      successRate: 95,
      responseTime: '4 hrs',
      completedJobs: 89
    },
    techStack: ['DALL-E 3', 'Midjourney', 'Magnific AI']
  },
  {
    id: 'c3',
    name: 'Nova Synth',
    handle: '@novasynth',
    bio: '3D Artist turned Prompt Engineer. Bringing cinematic lighting and textures to AI generation.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400',
    coverImage: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1200&h=400',
    available: true,
    stats: {
      successRate: 100,
      responseTime: '< 30 min',
      completedJobs: 215
    },
    techStack: ['Midjourney v6', 'ComfyUI', 'Blender']
  },
  {
    id: 'c4',
    name: 'Kaito Gen',
    handle: '@kaitogen',
    bio: 'Specializing in anime and stylized character consistency using LoRAs and ControlNet.',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&h=400',
    coverImage: 'https://images.unsplash.com/photo-1633469924738-52101af51d87?auto=format&fit=crop&w=1200&h=400',
    available: true,
    stats: {
      successRate: 98,
      responseTime: '2 hrs',
      completedJobs: 64
    },
    techStack: ['Stable Diffusion', 'ControlNet', 'Kohya_ss']
  },
  {
    id: 'c5',
    name: 'Sarah Pixels',
    handle: '@spixels',
    bio: 'Photorealistic product photography and editorial fashion spreads generated with AI.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400',
    coverImage: 'https://images.unsplash.com/photo-1558470598-a5dda9640f6b?auto=format&fit=crop&w=1200&h=400',
    available: true,
    stats: {
      successRate: 97,
      responseTime: '1 hr',
      completedJobs: 112
    },
    techStack: ['Midjourney v6', 'Photoshop', 'Lightroom']
  }
];

export const ARTWORKS: Artwork[] = [
  {
    id: 'a1',
    title: 'Neon Rain',
    imageUrl: 'https://images.unsplash.com/photo-1555679427-1f6dfcce943b?auto=format&fit=crop&w=800&q=80',
    creatorId: 'c1',
    model: 'Midjourney v6',
    likes: 1240,
    promptSnippet: '/imagine prompt: cyberpunk street raining neon lights --ar 16:9',
    promptPrice: '$2.99',
    downloadPrice: '$45.00'
  },
  {
    id: 'a2',
    title: 'Fluid Dreams',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80',
    creatorId: 'c2',
    model: 'DALL-E 3',
    likes: 856,
    promptSnippet: 'Abstract liquid metal flowing in zero gravity, iridescence',
    promptPrice: '$1.99',
    downloadPrice: '$30.00'
  },
  {
    id: 'a3',
    title: 'Cyber Geisha',
    imageUrl: 'https://images.unsplash.com/photo-1633469924738-52101af51d87?auto=format&fit=crop&w=800&q=80',
    creatorId: 'c1',
    model: 'Stable Diffusion XL',
    likes: 2100,
    promptSnippet: 'Portrait of a cyborg geisha, intricate circuitry, porcelain skin',
    promptPrice: '$3.99',
    downloadPrice: '$60.00'
  },
  {
    id: 'a4',
    title: 'Orbital Station',
    imageUrl: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=800&q=80',
    creatorId: 'c3',
    model: 'Midjourney v5.2',
    likes: 3400,
    promptSnippet: 'Sci-fi space station orbiting a purple planet, cinematic lighting',
    promptPrice: '$4.99',
    downloadPrice: '$75.00'
  },
  {
    id: 'a5',
    title: 'Neural Network',
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    creatorId: 'c2',
    model: 'Midjourney v6',
    likes: 920,
    promptSnippet: 'Visualization of a neural network, glowing nodes, data streams',
    promptPrice: '$2.99',
    downloadPrice: '$40.00'
  },
  {
    id: 'a6',
    title: 'Synthetic Flora',
    imageUrl: 'https://images.unsplash.com/photo-1530982011887-3cc11cc85693?auto=format&fit=crop&w=800&q=80',
    creatorId: 'c3',
    model: 'ControlNet',
    likes: 1543,
    promptSnippet: 'Bioluminescent flowers in a dark forest, macro photography',
    promptPrice: '$3.50',
    downloadPrice: '$55.00'
  },
  {
    id: 'a7',
    title: 'The Architect',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    creatorId: 'c1',
    model: 'Midjourney v6',
    likes: 1890,
    promptSnippet: 'A futuristic architect designing a city with holograms',
    promptPrice: '$5.00',
    downloadPrice: '$80.00'
  },
  {
    id: 'a8',
    title: 'Retro Future',
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
    creatorId: 'c4',
    model: 'Stable Diffusion',
    likes: 880,
    promptSnippet: '80s synthwave landscape, grid floor, sunset sun',
    promptPrice: '$2.00',
    downloadPrice: '$35.00'
  },
  {
    id: 'a9',
    title: 'Ethereal Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
    creatorId: 'c5',
    model: 'Midjourney v6',
    likes: 2400,
    promptSnippet: 'High fashion editorial, haute couture made of smoke and glass',
    promptPrice: '$8.00',
    downloadPrice: '$120.00'
  }
];

export const JOBS: Job[] = [
  {
    id: 'j1',
    title: 'Cyberpunk Cityscape for Game Background',
    company: 'Neon Studios',
    budget: '$300 - $500',
    type: 'Fixed Price',
    tags: ['Midjourney', 'Environment', '4K'],
    postedAt: '2h ago',
    description: 'We need a set of 5 high-resolution cyberpunk city environments for a visual novel. Must include rain, neon signs, and distinct color palettes.'
  },
  {
    id: 'j2',
    title: 'Consistent Character Model Training',
    company: 'Indie Devs Inc.',
    budget: '$50/hr',
    type: 'Hourly',
    tags: ['Stable Diffusion', 'LoRA', 'Training'],
    postedAt: '5h ago',
    description: 'Looking for an expert to train a LoRA for our main character. We have the concept art, need consistent outputs in different poses.'
  },
  {
    id: 'j3',
    title: 'Surreal Album Art Cover',
    company: 'Echo Records',
    budget: '$200',
    type: 'Fixed Price',
    tags: ['DALL-E 3', 'Abstract', 'Album Art'],
    postedAt: '1d ago',
    description: 'Need a trippy, Dali-esque album cover for a psychedelic rock band. Themes: melting clocks, space, deserts.'
  },
  {
    id: 'j4',
    title: 'Product Mockups in Lifestyle Settings',
    company: 'Luxe Goods',
    budget: '$150 - $250',
    type: 'Fixed Price',
    tags: ['Photorealism', 'Product', 'Midjourney'],
    postedAt: '1d ago',
    description: 'Generate photorealistic lifestyle shots of our cosmetic bottles on marble countertops with specific lighting.'
  }
];

export const TOPICS: Topic[] = [
  {
    id: 't1',
    title: 'Is Midjourney v6 better at hands now?',
    author: '@elenavoid',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=50&h=50',
    category: 'General',
    replies: 42,
    views: '1.2k',
    isHot: true,
    preview: 'I have been testing the new alpha and the fingers seem much more consistent...'
  },
  {
    id: 't2',
    title: 'Best settings for SDXL Lightning?',
    author: '@kaitogen',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&h=50',
    category: 'Workflow',
    replies: 15,
    views: '450',
    preview: 'Trying to get sub-second generation times but keeping quality high. Any tips?'
  },
  {
    id: 't3',
    title: 'Copyright update for AI Art in 2024',
    author: '@novasynth',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=50&h=50',
    category: 'News',
    replies: 128,
    views: '5.6k',
    isHot: true,
    preview: 'Just saw the latest ruling from the copyright office. This changes things for commercial work...'
  },
  {
    id: 't4',
    title: 'Show off your weekly creations!',
    author: '@spixels',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=50&h=50',
    category: 'Showcase',
    replies: 89,
    views: '2.1k',
    preview: 'Theme for this week: Underwater Cities. Post your best generations below!'
  }
];