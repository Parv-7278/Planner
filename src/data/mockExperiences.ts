import { Experience } from '../types';

export const MOCK_EXPERIENCES: Experience[] = [
  // 1. FOOD & DINING
  {
    id: 'exp-food-1',
    name: 'Olive Bar & Kitchen',
    tagline: 'Rustic Mediterranean culinary haven beneath the Banyan tree',
    category: 'food',
    subcategory: 'fine-dining',
    description: 'Set in a charming colonial building with pebbled courtyard and towering banyan tree in Mehrauli. Signature wood-fired pizzas, burrata salads, handmade artisanal pastas, and handcrafted botanical cocktails.',
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'
    ],
    venue: {
      id: 'venue-olive',
      name: 'Olive Bar & Kitchen',
      area: 'Mehrauli',
      city: 'New Delhi',
      address: 'One Style Mile, Haveli 6, Kalka Das Marg, Mehrauli, New Delhi 110030',
      lat: 28.5245,
      lng: 77.1855,
      metroStation: 'Qutub Minar Metro (Yellow Line)',
      parkingAvailable: true
    },
    pricePerPerson: 1800,
    durationMinutes: 90,
    rating: 4.8,
    reviewCount: 1420,
    openingHours: '12:30 PM',
    closingHours: '11:30 PM',
    ageRestriction: 'All ages welcome (21+ after 10 PM)',
    dietaryOptions: ['vegetarian', 'vegan', 'halal', 'jain'],
    tags: ['romantic', 'date', 'outdoor', 'fine dining', 'aesthetic', 'cocktails'],
    features: ['Valet Parking', 'Courtyard Seating', 'Live Acoustic', 'Wheelchair Accessible'],
    whatIsIncluded: ['Reserved Table', 'Complimentary Bread Basket', 'Chef Welcome Amuse-Bouche'],
    whatToBring: ['Smart casual dress code', 'Valid photo ID if ordering cocktails'],
    cancellationPolicy: 'Free cancellation up to 2 hours before reservation time.',
    trendingScore: 98,
    weatherFit: 'all',
    slots: [
      { id: 's-olive-1', time: '12:30 PM', rawTime: '12:30', availableSeats: 8, price: 1800, status: 'available' },
      { id: 's-olive-2', time: '01:30 PM', rawTime: '13:30', availableSeats: 4, price: 1800, status: 'few_left' },
      { id: 's-olive-3', time: '07:30 PM', rawTime: '19:30', availableSeats: 0, price: 2000, status: 'sold_out', waitlistLength: 14 },
      { id: 's-olive-4', time: '09:00 PM', rawTime: '21:00', availableSeats: 2, price: 2000, status: 'few_left' }
    ]
  },
  {
    id: 'exp-food-2',
    name: 'Champa Gali Artisanal Roastery & Cafe',
    tagline: 'Fairy lights, cold brews, and indie music in an artsy hidden lane',
    category: 'food',
    subcategory: 'cafe',
    description: 'Tucked away in Saidulajab, Champa Gali is an intimate lane adorned with fairy lights, rustic walls, and independent roasteries. Enjoy pour-over single origin coffees, fresh berry cheesecakes, and sourdough sandwiches.',
    images: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80'
    ],
    venue: {
      id: 'venue-champa',
      name: 'Blue Tokai & Jugmug Thela',
      area: 'Saket / Saidulajab',
      city: 'New Delhi',
      address: 'Lane 3, Champa Gali, Westend Marg, Saidulajab, New Delhi 110030',
      lat: 28.5173,
      lng: 77.2014,
      metroStation: 'Saket Metro (Yellow Line)',
      parkingAvailable: false
    },
    pricePerPerson: 450,
    durationMinutes: 60,
    rating: 4.6,
    reviewCount: 980,
    openingHours: '10:00 AM',
    closingHours: '10:00 PM',
    dietaryOptions: ['vegetarian', 'vegan'],
    tags: ['coffee', 'casual', 'aesthetic', 'friends', 'reading', 'pet friendly'],
    features: ['Pet Friendly', 'Free High-speed Wi-Fi', 'Outdoor Seating', 'Indie Book Nook'],
    whatIsIncluded: ['Priority Cafe Seating', 'Coffee Tasting Flight Voucher'],
    whatToBring: ['Book or notebook', 'Camera for aesthetic photos'],
    cancellationPolicy: 'Instant free cancellation anytime.',
    trendingScore: 92,
    weatherFit: 'all',
    slots: [
      { id: 's-champa-1', time: '11:00 AM', rawTime: '11:00', availableSeats: 12, price: 450, status: 'available' },
      { id: 's-champa-2', time: '04:00 PM', rawTime: '16:00', availableSeats: 6, price: 450, status: 'few_left' },
      { id: 's-champa-3', time: '06:00 PM', rawTime: '18:00', availableSeats: 0, price: 450, status: 'waitlist', waitlistLength: 8 }
    ]
  },
  {
    id: 'exp-food-3',
    name: 'Old Delhi Heritage Food Trail',
    tagline: 'Guided sensory voyage through 200-year-old culinary legends of Chandni Chowk',
    category: 'food',
    subcategory: 'food-tour',
    description: 'Explore the labyrinthine alleys of Shahjahanabad with an expert culinary curator. Feast on legendary Daulat ki Chaat, Natraj Dahi Bhalle, stuffed parathas at Gali Paranthe Wali, and saffron jalebis soaked in desi ghee.',
    images: [
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80'
    ],
    venue: {
      id: 'venue-chandni',
      name: 'Chandni Chowk Heritage Gate',
      area: 'Old Delhi',
      city: 'Delhi',
      address: 'Meeting point: Chandni Chowk Metro Station Gate 1, Delhi 110006',
      lat: 28.6506,
      lng: 77.2303,
      metroStation: 'Chandni Chowk Metro Station',
      parkingAvailable: false
    },
    pricePerPerson: 1200,
    durationMinutes: 120,
    rating: 4.9,
    reviewCount: 640,
    openingHours: '09:00 AM',
    closingHours: '08:00 PM',
    dietaryOptions: ['vegetarian', 'jain'],
    tags: ['street food', 'heritage', 'culture', 'tourist', 'adventurous', 'photography'],
    features: ['Certified Local Historian Guide', '7 Food Tastings Included', 'Sanitized Drinking Water'],
    whatIsIncluded: ['All 7 food & dessert tastings', 'Local guide narration', 'Rickshaw ride through Dariba Kalan'],
    whatToBring: ['Comfortable walking sneakers', 'Empty stomach', 'Wet wipes'],
    cancellationPolicy: 'Full refund if cancelled 12 hours prior to start.',
    trendingScore: 95,
    weatherFit: 'pleasant_outdoor',
    slots: [
      { id: 's-trail-1', time: '10:00 AM', rawTime: '10:00', availableSeats: 5, price: 1200, status: 'few_left' },
      { id: 's-trail-2', time: '04:00 PM', rawTime: '16:00', availableSeats: 0, price: 1200, status: 'sold_out', waitlistLength: 6 }
    ]
  },

  // 2. CREATIVE WORKSHOPS
  {
    id: 'exp-craft-1',
    name: 'The Clay Company - Wheel Pottery Workshop',
    tagline: 'Feel the meditative spin of the wheel & sculpt your own ceramic cup',
    category: 'workshops',
    subcategory: 'pottery',
    description: 'Immerse your hands in wet terracotta and porcelain clay. Under master ceramicists, learn centering, pulling, shaping on motorized wheels, and surface carving. Take home your own kiln-fired masterpiece.',
    images: [
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80'
    ],
    venue: {
      id: 'venue-clay',
      name: 'The Clay Company Studio',
      area: 'Hauz Khas Village',
      city: 'New Delhi',
      address: '1st Floor, Building 16, Hauz Khas Village, New Delhi 110016',
      lat: 28.5539,
      lng: 77.1942,
      metroStation: 'IIT Delhi / Green Park Metro',
      parkingAvailable: false
    },
    pricePerPerson: 1100,
    durationMinutes: 90,
    rating: 4.9,
    reviewCount: 520,
    openingHours: '11:00 AM',
    closingHours: '07:00 PM',
    ageRestriction: 'Ages 8 and above',
    tags: ['pottery', 'creative', 'romantic', 'date', 'peaceful', 'kids friendly'],
    features: ['Individual Pottery Wheel', 'Apron Provided', 'Kiln Glazing & Baking', 'Free Tea / Coffee'],
    whatIsIncluded: ['Clay and wheel access', 'Dedicated instructor guidance', '1 fired ceramic piece mailed to your address'],
    whatToBring: ['Trimmed fingernails recommended', 'Comfortable clothes you do not mind splashing clay on'],
    cancellationPolicy: 'Reschedule or cancel up to 4 hours before the session.',
    trendingScore: 97,
    weatherFit: 'all',
    slots: [
      { id: 's-pot-1', time: '11:30 AM', rawTime: '11:30', availableSeats: 6, price: 1100, status: 'available' },
      { id: 's-pot-2', time: '02:00 PM', rawTime: '14:00', availableSeats: 2, price: 1100, status: 'few_left' },
      { id: 's-pot-3', time: '04:00 PM', rawTime: '16:00', availableSeats: 0, price: 1100, status: 'sold_out', waitlistLength: 9 },
      { id: 's-pot-4', time: '05:30 PM', rawTime: '17:30', availableSeats: 4, price: 1100, status: 'available' }
    ]
  },
  {
    id: 'exp-craft-2',
    name: 'Sip & Paint Canvas Masterclass',
    tagline: 'Paint under glowing fairy lights with mocktails and canvas easel',
    category: 'workshops',
    subcategory: 'painting',
    description: 'No prior painting skill required! Guided by contemporary artists, you will create a sunset skyline or abstract masterpiece on stretched canvas while sipping refreshing artisan coolers and enjoying upbeat acoustic tracks.',
    images: [
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80'
    ],
    venue: {
      id: 'venue-artstudio',
      name: 'Canvas Collective Delhi',
      area: 'Greater Kailash 1',
      city: 'New Delhi',
      address: 'M-Block Market, 2nd Floor, GK-1, New Delhi 110048',
      lat: 28.5529,
      lng: 77.2372,
      metroStation: 'Kailash Colony Metro',
      parkingAvailable: true
    },
    pricePerPerson: 850,
    durationMinutes: 90,
    rating: 4.8,
    reviewCount: 380,
    openingHours: '02:00 PM',
    closingHours: '09:00 PM',
    tags: ['painting', 'art', 'relaxing', 'friends', 'date', 'creative'],
    features: ['Canvas & Acrylic Kits Provided', 'Welcome Drink Included', 'Take Home Stretched Frame'],
    whatIsIncluded: ['12x16 inch canvas', 'Acrylic paints, brushes, palettes', 'Step-by-step master instructor'],
    whatToBring: ['Your creative vibes only'],
    cancellationPolicy: 'Cancel up to 6 hours before for full credit.',
    trendingScore: 91,
    weatherFit: 'all',
    slots: [
      { id: 's-paint-1', time: '03:30 PM', rawTime: '15:30', availableSeats: 8, price: 850, status: 'available' },
      { id: 's-paint-2', time: '06:00 PM', rawTime: '18:00', availableSeats: 1, price: 850, status: 'few_left' }
    ]
  },

  // 3. ENTERTAINMENT & MOVIES
  {
    id: 'exp-ent-1',
    name: 'PVR Director’s Cut - Luxury Recliner Cinema',
    tagline: 'Ultra-plush leather recliners, personal butler service & laser projection',
    category: 'movies',
    subcategory: 'movie',
    description: 'Redefine movie-watching in ultra-luxury. Enjoy 4K Dolby Atmos laser projection from motorized heated recliners, complete with blanket, pillow, and gourmet culinary menu curated by master chefs delivered silently to your seat.',
    images: [
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80'
    ],
    venue: {
      id: 'venue-pvr',
      name: 'PVR Director’s Cut Ambience',
      area: 'Vasant Kunj',
      city: 'New Delhi',
      address: '3rd Floor, Ambience Mall, Nelson Mandela Marg, Vasant Kunj, New Delhi 110070',
      lat: 28.5402,
      lng: 77.1558,
      metroStation: 'Chhatarpur / Vasant Vihar Metro',
      parkingAvailable: true
    },
    pricePerPerson: 950,
    durationMinutes: 150,
    rating: 4.9,
    reviewCount: 2310,
    openingHours: '10:00 AM',
    closingHours: '01:00 AM',
    tags: ['movie', 'luxury', 'date', 'relaxation', 'indoor', 'air conditioned'],
    features: ['Motorized Recliners', 'In-Seat Butler Call', 'Dolby Atmos Sound', 'Gourmet Lounge Access'],
    whatIsIncluded: ['Cinema Recliner Ticket', 'Gourmet Truffle Popcorn Voucher', 'Lounge access'],
    whatToBring: ['Govt Photo ID for A-rated screenings'],
    cancellationPolicy: 'Refundable up to 1 hour before showtime (less 10% convenience fee).',
    trendingScore: 99,
    weatherFit: 'indoor_only',
    slots: [
      { id: 's-mov-1', time: '01:00 PM', rawTime: '13:00', availableSeats: 14, price: 950, status: 'available' },
      { id: 's-mov-2', time: '04:15 PM', rawTime: '16:15', availableSeats: 3, price: 950, status: 'few_left' },
      { id: 's-mov-3', time: '07:30 PM', rawTime: '19:30', availableSeats: 0, price: 1100, status: 'sold_out', waitlistLength: 22 },
      { id: 's-mov-4', time: '10:15 PM', rawTime: '22:15', availableSeats: 6, price: 950, status: 'available' }
    ]
  },
  {
    id: 'exp-ent-2',
    name: 'India Habitat Centre - Live Theatre & Stage Play',
    tagline: 'Compelling live drama in Delhi’s cultural and intellectual landmark',
    category: 'movies',
    subcategory: 'theatre',
    description: 'Experience an evocative live stage play featuring award-winning theatrical ensembles. The Stein Auditorium offers acoustics designed for pure vocal intimacy, amidst the iconic red-brick architecture and art galleries of IHC.',
    images: [
      'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=1200&q=80'
    ],
    venue: {
      id: 'venue-ihc',
      name: 'Stein Auditorium, India Habitat Centre',
      area: 'Lodhi Road',
      city: 'New Delhi',
      address: 'Lodhi Road, Near Air Force Bal Bharati School, New Delhi 110003',
      lat: 28.5898,
      lng: 77.2251,
      metroStation: 'JLN Stadium Metro (Violet Line)',
      parkingAvailable: true
    },
    pricePerPerson: 600,
    durationMinutes: 105,
    rating: 4.8,
    reviewCount: 840,
    openingHours: '06:00 PM',
    closingHours: '10:00 PM',
    tags: ['theatre', 'culture', 'drama', 'intellectual', 'art', 'peaceful'],
    features: ['Acoustic Stein Auditorium', 'Pre-show Gallery Access', 'Ample Underground Parking'],
    whatIsIncluded: ['Auditorium Stalls Ticket', 'Playbill Souvenir Program'],
    whatToBring: ['Arrive 20 mins prior; latecomers admitted only during intermission'],
    cancellationPolicy: 'Non-refundable within 24 hours of performance.',
    trendingScore: 89,
    weatherFit: 'indoor_only',
    slots: [
      { id: 's-th-1', time: '06:30 PM', rawTime: '18:30', availableSeats: 8, price: 600, status: 'available' },
      { id: 's-th-2', time: '08:30 PM', rawTime: '20:30', availableSeats: 0, price: 600, status: 'sold_out', waitlistLength: 5 }
    ]
  },

  // 4. ACTIVITIES & GAMING
  {
    id: 'exp-act-1',
    name: 'Mystery Rooms - The Lost Chamber Escape Mystery',
    tagline: 'Race against 60-minute ticking clocks, decode cryptic puzzles & break out',
    category: 'activities',
    subcategory: 'escape-room',
    description: 'You and your team are locked inside a themed chamber filled with hidden passages, mechanical locks, UV clues, and sensor triggers. Unravel the story, communicate quickly, and escape before the timer hits zero.',
    images: [
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80'
    ],
    venue: {
      id: 'venue-mr',
      name: 'Mystery Rooms Connaught Place',
      area: 'Connaught Place',
      city: 'New Delhi',
      address: 'Block E-12, Inner Circle, Connaught Place, New Delhi 110001',
      lat: 28.6328,
      lng: 77.2197,
      metroStation: 'Rajiv Chowk Metro (Gate 6)',
      parkingAvailable: true
    },
    pricePerPerson: 800,
    durationMinutes: 60,
    rating: 4.8,
    reviewCount: 1650,
    openingHours: '11:00 AM',
    closingHours: '11:00 PM',
    ageRestriction: 'Ages 10+',
    tags: ['gaming', 'friends', 'thrilling', 'teamwork', 'indoor', 'group'],
    features: ['Air Conditioned Themed Rooms', 'Locker for Belongings', 'Game Master Support', 'Post-Game Photoshoot'],
    whatIsIncluded: ['60-minute escape mission entry', 'Escape certificate & victory polaroid'],
    whatToBring: ['Sneakers recommended for mobility'],
    cancellationPolicy: 'Reschedule anytime 2 hours before game slot.',
    trendingScore: 94,
    weatherFit: 'indoor_only',
    slots: [
      { id: 's-mr-1', time: '12:00 PM', rawTime: '12:00', availableSeats: 6, price: 800, status: 'available' },
      { id: 's-mr-2', time: '03:00 PM', rawTime: '15:00', availableSeats: 6, price: 800, status: 'available' },
      { id: 's-mr-3', time: '05:30 PM', rawTime: '17:30', availableSeats: 0, price: 900, status: 'waitlist', waitlistLength: 7 },
      { id: 's-mr-4', time: '07:30 PM', rawTime: '19:30', availableSeats: 6, price: 900, status: 'few_left' }
    ]
  },
  {
    id: 'exp-act-2',
    name: 'Microgravity VR & Holographic Arena',
    tagline: 'Zero-latency multiplayer free-roam virtual reality & esports',
    category: 'activities',
    subcategory: 'vr',
    description: 'Step into an untethered, warehouse-scale free roam VR arena. Suit up with wireless haptic backpacks, motion tracking, and VR blasters to battle zombies, explore alien planets, or compete in neon laser arenas.',
    images: [
      'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=1200&q=80'
    ],
    venue: {
      id: 'venue-mg',
      name: 'Microgravity World',
      area: 'Cyber City Gurgaon',
      city: 'Gurugram',
      address: 'DLF Phase 2, Near Sikanderpur Metro, Sector 25, Gurugram 122002',
      lat: 28.4817,
      lng: 77.0931,
      metroStation: 'Sikanderpur Metro Station',
      parkingAvailable: true
    },
    pricePerPerson: 750,
    durationMinutes: 45,
    rating: 4.7,
    reviewCount: 710,
    openingHours: '12:00 PM',
    closingHours: '10:30 PM',
    tags: ['vr', 'gaming', 'arcade', 'friends', 'futuristic', 'thrill'],
    features: ['Free-roam warehouse space', 'Haptic feedback vests', 'Full HD VR Headsets'],
    whatIsIncluded: ['2 Premium VR Mission rounds', 'Safety briefing and gear fitting'],
    whatToBring: ['Comfortable flat shoes'],
    cancellationPolicy: 'Free cancellation up to 3 hours prior.',
    trendingScore: 90,
    weatherFit: 'indoor_only',
    slots: [
      { id: 's-vr-1', time: '01:30 PM', rawTime: '13:30', availableSeats: 8, price: 750, status: 'available' },
      { id: 's-vr-2', time: '04:00 PM', rawTime: '16:00', availableSeats: 2, price: 750, status: 'few_left' },
      { id: 's-vr-3', time: '06:30 PM', rawTime: '18:30', availableSeats: 4, price: 850, status: 'available' }
    ]
  },

  // 5. CULTURE & HERITAGE
  {
    id: 'exp-cult-1',
    name: 'National Gallery of Modern Art (NGMA) Tour',
    tagline: 'Historic palace of the Maharaja of Jaipur displaying modern art treasures',
    category: 'culture',
    subcategory: 'gallery',
    description: 'Wander through serene marble corridors and sunlit sculpture gardens hosting India’s premier collection of modern art. View legendary masterworks by Amrita Sher-Gil, Rabindranath Tagore, Jamini Roy, and MF Husain.',
    images: [
      'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80'
    ],
    venue: {
      id: 'venue-ngma',
      name: 'Jaipur House, NGMA',
      area: 'India Gate Circle',
      city: 'New Delhi',
      address: 'Jaipur House, Shershah Road, Near India Gate, New Delhi 110003',
      lat: 28.6083,
      lng: 77.2343,
      metroStation: 'Khan Market Metro (Violet Line)',
      parkingAvailable: true
    },
    pricePerPerson: 150,
    durationMinutes: 90,
    rating: 4.8,
    reviewCount: 3100,
    openingHours: '10:00 AM',
    closingHours: '06:00 PM',
    tags: ['museum', 'art', 'culture', 'peaceful', 'date', 'photography', 'educational'],
    features: ['Curator Audio Guide', 'Sculpture Garden Cafe', 'Bookstore & Souvenir Shop', 'Wheelchair Access'],
    whatIsIncluded: ['Museum Entry Ticket', 'Access to Temporary International Exhibition Wing'],
    whatToBring: ['Earphones for smartphone audio guide'],
    cancellationPolicy: 'Refundable up to 2 hours prior.',
    trendingScore: 93,
    weatherFit: 'all',
    slots: [
      { id: 's-ngma-1', time: '10:30 AM', rawTime: '10:30', availableSeats: 30, price: 150, status: 'available' },
      { id: 's-ngma-2', time: '01:30 PM', rawTime: '13:30', availableSeats: 25, price: 150, status: 'available' },
      { id: 's-ngma-3', time: '03:45 PM', rawTime: '15:45', availableSeats: 12, price: 150, status: 'available' }
    ]
  },
  {
    id: 'exp-cult-2',
    name: 'Qutub Minar Sunset Heritage Experience',
    tagline: '12th-century soaring minaret, iron pillar mysteries & golden hour light',
    category: 'culture',
    subcategory: 'monument',
    description: 'A UNESCO World Heritage sanctuary boasting the world’s tallest brick minaret. Explore intricately carved sandstone colonnades, ancient calligraphy bands, and the rust-resistant 1600-year-old Iron Pillar as the sun sets over Delhi.',
    images: [
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&w=1200&q=80'
    ],
    venue: {
      id: 'venue-qutub',
      name: 'Qutub Minar Complex',
      area: 'Mehrauli',
      city: 'New Delhi',
      address: 'Seth Sarai, Mehrauli, New Delhi 110030',
      lat: 28.5244,
      lng: 77.1855,
      metroStation: 'Qutub Minar Metro',
      parkingAvailable: true
    },
    pricePerPerson: 250,
    durationMinutes: 75,
    rating: 4.9,
    reviewCount: 5400,
    openingHours: '07:00 AM',
    closingHours: '08:00 PM',
    tags: ['heritage', 'monument', 'photography', 'history', 'outdoor', 'tourist', 'family'],
    features: ['Skip-the-line QR entry', 'Illuminated Night Walk', 'Landscaped Lawns'],
    whatIsIncluded: ['Priority Entry E-ticket', 'Digital Heritage Map Guide'],
    whatToBring: ['Sunglasses, camera, comfortable walking shoes'],
    cancellationPolicy: 'Instant free cancellation up to 1 hour before.',
    trendingScore: 96,
    weatherFit: 'pleasant_outdoor',
    slots: [
      { id: 's-qut-1', time: '03:30 PM', rawTime: '15:30', availableSeats: 20, price: 250, status: 'available' },
      { id: 's-qut-2', time: '05:00 PM', rawTime: '17:00', availableSeats: 5, price: 250, status: 'few_left' },
      { id: 's-qut-3', time: '06:15 PM', rawTime: '18:15', availableSeats: 0, price: 250, status: 'waitlist', waitlistLength: 11 }
    ]
  },

  // 6. NATURE & OUTDOOR
  {
    id: 'exp-nat-1',
    name: 'Sunder Nursery Heritage Park & Botanical Picnic',
    tagline: '90-acre Mughal garden wonder with marble fountains, peacocks & lake',
    category: 'outdoor',
    subcategory: 'picnic',
    description: 'Often called Delhi’s Central Park, this restored 16th-century Mughal estate features glistening lotus ponds, flower beds in full bloom, 6 UNESCO monuments, and open manicured lawns. Perfect for artisanal picnic baskets and lazy reading.',
    images: [
      'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
    ],
    venue: {
      id: 'venue-sunder',
      name: 'Sunder Nursery Park',
      area: 'Nizamuddin',
      city: 'New Delhi',
      address: 'Bharat Scouts and Guides Marg, Opposite Humayun’s Tomb, Nizamuddin, New Delhi 110013',
      lat: 28.5933,
      lng: 77.2458,
      metroStation: 'JLN Stadium Metro / Sarai Kale Khan',
      parkingAvailable: true
    },
    pricePerPerson: 200,
    durationMinutes: 105,
    rating: 4.9,
    reviewCount: 4200,
    openingHours: '07:00 AM',
    closingHours: '09:00 PM',
    tags: ['nature', 'picnic', 'peaceful', 'romantic', 'family', 'photography', 'relaxing'],
    features: ['Lakeside Cafe', 'Organic Weekend Farmers Market', 'Pet Friendly Designated Zones', 'Clean Restrooms'],
    whatIsIncluded: ['Park Access Pass', 'Picnic Mat Reservation Voucher'],
    whatToBring: ['Picnic mat, frisbee, favorite book'],
    cancellationPolicy: 'Free cancellation anytime before entry.',
    trendingScore: 98,
    weatherFit: 'pleasant_outdoor',
    slots: [
      { id: 's-sn-1', time: '10:00 AM', rawTime: '10:00', availableSeats: 40, price: 200, status: 'available' },
      { id: 's-sn-2', time: '02:30 PM', rawTime: '14:30', availableSeats: 30, price: 200, status: 'available' },
      { id: 's-sn-3', time: '04:30 PM', rawTime: '16:30', availableSeats: 8, price: 200, status: 'few_left' }
    ]
  },
  {
    id: 'exp-nat-2',
    name: 'Asola Bhatti Sanctuary - Forest Sunrise Cycling',
    tagline: 'Pedal through dense forest trails to hidden turquoise rocky lakes',
    category: 'outdoor',
    subcategory: 'cycling',
    description: 'Escape the city rush inside the Southern Delhi Ridge. Ride premium geared mountain bikes along dirt pathways, spot spotted deer and migratory birds, and pause at the dramatic cliffs overlooking Neeli Jheel (Blue Lake).',
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80'
    ],
    venue: {
      id: 'venue-asola',
      name: 'Asola Bhatti Wildlife Sanctuary Gate 2',
      area: 'Tughlakabad / Surajkund',
      city: 'New Delhi',
      address: 'Conservation Education Centre, Asola, New Delhi 110044',
      lat: 28.4908,
      lng: 77.2625,
      metroStation: 'Tughlakabad Metro',
      parkingAvailable: true
    },
    pricePerPerson: 750,
    durationMinutes: 120,
    rating: 4.7,
    reviewCount: 410,
    openingHours: '06:00 AM',
    closingHours: '11:00 AM',
    ageRestriction: 'Ages 12+',
    tags: ['adventure', 'cycling', 'nature', 'fitness', 'morning', 'peaceful'],
    features: ['Trek MTB Bicycle Included', 'Safety Helmet & Elbow Guards', 'First-aid & Hydration Station'],
    whatIsIncluded: ['21-speed mountain bike rental', 'Naturalist trail lead', 'Energy drink & banana snack'],
    whatToBring: ['Athletic wear, backpack for water bottle'],
    cancellationPolicy: 'Refundable up to 8 hours prior.',
    trendingScore: 87,
    weatherFit: 'pleasant_outdoor',
    slots: [
      { id: 's-cyc-1', time: '06:30 AM', rawTime: '06:30', availableSeats: 10, price: 750, status: 'available' },
      { id: 's-cyc-2', time: '08:00 AM', rawTime: '08:00', availableSeats: 4, price: 750, status: 'few_left' }
    ]
  },

  // 7. SPORTS & ADVENTURE
  {
    id: 'exp-spo-1',
    name: 'Siri Fort Sports Complex - Indoor Badminton & Squash',
    tagline: 'Commonwealth Games grade wooden courts & premium racquet gear',
    category: 'sports',
    subcategory: 'badminton',
    description: 'Play on world-class Olympic-grade sprung teakwood badminton courts used during international championships. Top-tier lighting, air circulation, and racquet rentals make it ideal for energetic matches with friends.',
    images: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80'
    ],
    venue: {
      id: 'venue-sirifort',
      name: 'Siri Fort Sports Complex',
      area: 'August Kranti Marg',
      city: 'New Delhi',
      address: 'August Kranti Marg, Siri Fort Road, New Delhi 110049',
      lat: 28.5522,
      lng: 77.2185,
      metroStation: 'Hauz Khas Metro',
      parkingAvailable: true
    },
    pricePerPerson: 400,
    durationMinutes: 60,
    rating: 4.7,
    reviewCount: 1100,
    openingHours: '06:00 AM',
    closingHours: '09:00 PM',
    tags: ['sports', 'fitness', 'badminton', 'active', 'friends', 'indoor'],
    features: ['Olympic Teakwood Court', 'Locker Room & Showers', 'Racquet & Feather Shuttle Rental'],
    whatIsIncluded: ['Court booking for 1 hour', '2 Carbon-graphite racquets + 1 shuttle barrel'],
    whatToBring: ['Non-marking gum-sole sports shoes mandatory'],
    cancellationPolicy: 'Free cancellation 4 hours before slot.',
    trendingScore: 88,
    weatherFit: 'indoor_only',
    slots: [
      { id: 's-spo-1', time: '11:00 AM', rawTime: '11:00', availableSeats: 2, price: 400, status: 'few_left' },
      { id: 's-spo-2', time: '03:00 PM', rawTime: '15:00', availableSeats: 4, price: 400, status: 'available' },
      { id: 's-spo-3', time: '05:00 PM', rawTime: '17:00', availableSeats: 0, price: 500, status: 'sold_out', waitlistLength: 4 }
    ]
  },
  {
    id: 'exp-spo-2',
    name: 'F9 Go-Karting - High-Speed Track Racing',
    tagline: 'Multi-level banked turns, 270cc Honda engines & live telemetry lap timing',
    category: 'sports',
    subcategory: 'go-karting',
    description: 'Feel the adrenaline pump as you corner at speed on an outdoor professional asphalt karting circuit. Track features chicanes, hairpins, and straightaways with live F1-style timing boards tracking your fastest lap.',
    images: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80'
    ],
    venue: {
      id: 'venue-f9',
      name: 'F9 Go Karting Circuit',
      area: 'Sector 17 / 18 Link',
      city: 'Gurugram',
      address: 'Sector 17-18 Link Road, Near IFFCO Chowk, Gurugram 122001',
      lat: 28.4875,
      lng: 77.0624,
      metroStation: 'IFFCO Chowk Metro',
      parkingAvailable: true
    },
    pricePerPerson: 700,
    durationMinutes: 45,
    rating: 4.8,
    reviewCount: 1890,
    openingHours: '01:00 PM',
    closingHours: '10:00 PM',
    ageRestriction: 'Ages 14+',
    tags: ['adventure', 'thrill', 'racing', 'friends', 'sports', 'competitive'],
    features: ['270cc 4-Stroke Honda Karts', 'FIA Standard Full-face Helmets', 'Live Lap Display Screen'],
    whatIsIncluded: ['10 Racing Laps session', 'Balaclava & Racing Suit', 'Digital Lap Timing Printout'],
    whatToBring: ['Closed sports shoes required (no flip-flops/sandals)'],
    cancellationPolicy: 'Reschedule anytime up to 2 hours prior.',
    trendingScore: 95,
    weatherFit: 'pleasant_outdoor',
    slots: [
      { id: 's-kart-1', time: '02:00 PM', rawTime: '14:00', availableSeats: 6, price: 700, status: 'available' },
      { id: 's-kart-2', time: '05:00 PM', rawTime: '17:00', availableSeats: 1, price: 700, status: 'few_left' },
      { id: 's-kart-3', time: '07:30 PM', rawTime: '19:30', availableSeats: 0, price: 800, status: 'waitlist', waitlistLength: 12 }
    ]
  },

  // 8. SHOPPING & MARKETS
  {
    id: 'exp-shop-1',
    name: 'Dilli Haat INA - Artisan Crafts & Regional Flavours',
    tagline: 'Open-air craft bazaar bringing master artisans from all 28 Indian states',
    category: 'shopping',
    subcategory: 'flea-market',
    description: 'An open-air thatched roof craft village showcasing authentic handloom pashminas, Madhubani paintings, tribal brass art, and blue pottery. End the visit by feasting on momos from Sikkim stall or litti chokha from Bihar.',
    images: [
      'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80'
    ],
    venue: {
      id: 'venue-dillihaat',
      name: 'Dilli Haat INA',
      area: 'INA / Kidwai Nagar',
      city: 'New Delhi',
      address: 'Sri Aurobindo Marg, Laxmi Bai Nagar, New Delhi 110023',
      lat: 28.5732,
      lng: 77.2081,
      metroStation: 'INA Metro (Pink & Yellow interchange, Gate 2)',
      parkingAvailable: true
    },
    pricePerPerson: 100,
    durationMinutes: 90,
    rating: 4.7,
    reviewCount: 4600,
    openingHours: '10:30 AM',
    closingHours: '10:00 PM',
    tags: ['shopping', 'handicrafts', 'cultural', 'street food', 'tourist', 'family'],
    features: ['Direct Artisan Stalls', 'All Indian State Food Pavilions', 'Open-air Amphitheatre'],
    whatIsIncluded: ['Skip-the-line Admission QR Entry'],
    whatToBring: ['Cloth tote bag for craft purchases'],
    cancellationPolicy: 'Non-refundable but valid all day.',
    trendingScore: 92,
    weatherFit: 'all',
    slots: [
      { id: 's-dh-1', time: '11:00 AM', rawTime: '11:00', availableSeats: 50, price: 100, status: 'available' },
      { id: 's-dh-2', time: '03:00 PM', rawTime: '15:00', availableSeats: 50, price: 100, status: 'available' },
      { id: 's-dh-3', time: '06:00 PM', rawTime: '18:00', availableSeats: 35, price: 100, status: 'available' }
    ]
  },
  {
    id: 'exp-shop-2',
    name: 'Khan Market Independent Bookstores & Vintage Cafes',
    tagline: 'Charming literary browsing at Bahrisons, boutique fragrances & gelatos',
    category: 'shopping',
    subcategory: 'bookstore',
    description: 'One of Delhi’s most stylish enclaves. Browse floor-to-ceiling wooden bookshelves at legendary Bahrisons and Faqir Chand, discover bespoke Indian skincare at Forest Essentials, and grab Italian pistachio gelato.',
    images: [
      'https://images.unsplash.com/photo-1507842229450-7907e49e415f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1526721940322-10fb6e3ae94a?auto=format&fit=crop&w=1200&q=80'
    ],
    venue: {
      id: 'venue-khan',
      name: 'Khan Market Prominade',
      area: 'Khan Market',
      city: 'New Delhi',
      address: 'Rabindra Nagar, Khan Market, New Delhi 110003',
      lat: 28.6003,
      lng: 77.2274,
      metroStation: 'Khan Market Metro (Gate 1)',
      parkingAvailable: true
    },
    pricePerPerson: 300,
    durationMinutes: 75,
    rating: 4.8,
    reviewCount: 2200,
    openingHours: '10:00 AM',
    closingHours: '09:30 PM',
    tags: ['books', 'shopping', 'peaceful', 'date', 'reading', 'boutique'],
    features: ['Historic Independent Bookstores', 'Specialty Coffee Bars', 'Artisan Bakeries'],
    whatIsIncluded: ['Curated Literary Walking Map', '10% Discount Coupon at Partner Cafe'],
    whatToBring: ['Love for books and cozy strolls'],
    cancellationPolicy: 'Free cancellation anytime.',
    trendingScore: 90,
    weatherFit: 'all',
    slots: [
      { id: 's-km-1', time: '11:30 AM', rawTime: '11:30', availableSeats: 25, price: 300, status: 'available' },
      { id: 's-km-2', time: '04:30 PM', rawTime: '16:30', availableSeats: 20, price: 300, status: 'available' }
    ]
  },

  // 9. RELAXATION & WELLNESS
  {
    id: 'exp-rel-1',
    name: 'The Imperial Spa - Himalayan Salt & Aromatherapy',
    tagline: 'Opulent colonial sanctuary with pure essential oils & Tibetan singing bowls',
    category: 'relaxation',
    subcategory: 'spa',
    description: 'Step into an oasis of tranquillity modeled on royal Mughal architecture. Enjoy soothing pressure massage using organic cold-pressed sesame oils, a private steam session, and the resonant vibrations of bronze singing bowls.',
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80'
    ],
    venue: {
      id: 'venue-imperial',
      name: 'The Imperial Spa & Salon',
      area: 'Janpath',
      city: 'New Delhi',
      address: 'Janpath Lane, Connaught Place, New Delhi 110001',
      lat: 28.6223,
      lng: 77.2188,
      metroStation: 'Janpath Metro Station',
      parkingAvailable: true
    },
    pricePerPerson: 2800,
    durationMinutes: 75,
    rating: 4.9,
    reviewCount: 680,
    openingHours: '09:00 AM',
    closingHours: '09:00 PM',
    tags: ['spa', 'wellness', 'relaxation', 'luxury', 'peaceful', 'romantic'],
    features: ['Private Treatment Suite', 'Eucalyptus Steam & Jacuzzi', 'Herbal Infusion Tea Bar'],
    whatIsIncluded: ['60-minute therapeutic massage', '15-minute steam & sauna', 'Organic herbal welcome elixir'],
    whatToBring: ['Robes and slippers provided at venue'],
    cancellationPolicy: 'Free cancellation up to 6 hours before appointment.',
    trendingScore: 94,
    weatherFit: 'indoor_only',
    slots: [
      { id: 's-spa-1', time: '11:00 AM', rawTime: '11:00', availableSeats: 3, price: 2800, status: 'available' },
      { id: 's-spa-2', time: '02:30 PM', rawTime: '14:30', availableSeats: 1, price: 2800, status: 'few_left' },
      { id: 's-spa-3', time: '05:30 PM', rawTime: '17:30', availableSeats: 0, price: 3200, status: 'sold_out', waitlistLength: 3 }
    ]
  },

  // 10. NIGHTLIFE & LOUNGES
  {
    id: 'exp-night-1',
    name: 'The Piano Man Jazz Club - Live Performance & Cocktails',
    tagline: 'Prohibition-era mahogany speakeasy with stellar live jazz & soulful blues',
    category: 'nightlife',
    subcategory: 'live-music',
    description: 'Delhi’s iconic musical haven. Built over two tiers of warm brass and polished mahogany around a central baby grand piano. Experience spellbinding live jazz, swing, funk, and blues while enjoying crafted cocktails and tapas.',
    images: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80'
    ],
    venue: {
      id: 'venue-pianoman',
      name: 'The Piano Man Safdarjung',
      area: 'Safdarjung Enclave',
      city: 'New Delhi',
      address: 'Commercial Complex B 6-7/22, Opposite Deer Park, Safdarjung Enclave, New Delhi 110029',
      lat: 28.5577,
      lng: 77.1953,
      metroStation: 'Green Park Metro Station',
      parkingAvailable: true
    },
    pricePerPerson: 1200,
    durationMinutes: 120,
    rating: 4.8,
    reviewCount: 2900,
    openingHours: '07:00 PM',
    closingHours: '01:00 AM',
    ageRestriction: '21+ only',
    tags: ['nightlife', 'live music', 'cocktails', 'jazz', 'date', 'friends', 'aesthetic'],
    features: ['Live Jazz Band', 'Mezzanine Balcony Seating', 'Mixology Cocktail Bar'],
    whatIsIncluded: ['Show cover entry ticket', 'Welcome signature mocktail / cocktail voucher'],
    whatToBring: ['Valid Government ID for age verification'],
    cancellationPolicy: 'Cancellation permitted up to 4 hours prior.',
    trendingScore: 98,
    weatherFit: 'night_only',
    slots: [
      { id: 's-pm-1', time: '08:00 PM', rawTime: '20:00', availableSeats: 0, price: 1200, status: 'sold_out', waitlistLength: 16 },
      { id: 's-pm-2', time: '10:15 PM', rawTime: '22:15', availableSeats: 4, price: 1200, status: 'few_left' }
    ]
  },
  {
    id: 'exp-night-2',
    name: 'Dear Donna - Rooftop Lounge overlooking Qutub Greens',
    tagline: 'Botanical greenhouse conservatory, velvet booths & sunset DJ sets',
    category: 'nightlife',
    subcategory: 'lounge',
    description: 'An elegant glasshouse lounge with lush tropical foliage, brass chandeliers, and an open terrace. Sip elderflower spritzers, dance to deep house grooves, and soak in evening views of the historic Qutub forested skyline.',
    images: [
      'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80'
    ],
    venue: {
      id: 'venue-donna',
      name: 'Dear Donna',
      area: 'Qutub Hotel, Mehrauli',
      city: 'New Delhi',
      address: 'Ground Floor, Qutub Hotel, Shaheed Jeet Singh Marg, New Delhi 110016',
      lat: 28.5369,
      lng: 77.1892,
      metroStation: 'Qutub Minar Metro',
      parkingAvailable: true
    },
    pricePerPerson: 1600,
    durationMinutes: 90,
    rating: 4.7,
    reviewCount: 1530,
    openingHours: '06:00 PM',
    closingHours: '01:00 AM',
    ageRestriction: '21+ after 09:00 PM',
    tags: ['rooftop', 'nightlife', 'cocktails', 'party', 'date', 'dance'],
    features: ['Terrace Conservatory', 'Live DJ Sets', 'Tapas Kitchen', 'Valet Parking'],
    whatIsIncluded: ['Table reservation for 90 mins', 'Tasting platter credit'],
    whatToBring: ['Smart casual attire mandatory'],
    cancellationPolicy: 'Free cancellation 2 hours before.',
    trendingScore: 94,
    weatherFit: 'night_only',
    slots: [
      { id: 's-dd-1', time: '07:00 PM', rawTime: '19:00', availableSeats: 5, price: 1600, status: 'available' },
      { id: 's-dd-2', time: '09:15 PM', rawTime: '21:15', availableSeats: 0, price: 1800, status: 'waitlist', waitlistLength: 10 }
    ]
  },

  // 11. FAMILY & KIDS
  {
    id: 'exp-fam-1',
    name: 'Museum of Illusions Connaught Place',
    tagline: 'Gravity-defying rooms, vortex tunnels & mind-bending optical tricks',
    category: 'family',
    subcategory: 'museum',
    description: 'Step into an interactive optical wonderland where nothing is as it seems! Walk along the ceiling in the Reverse Room, shrink or grow giants in the Ames Room, test your balance through the spinning Vortex Tunnel.',
    images: [
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80'
    ],
    venue: {
      id: 'venue-illusions',
      name: 'Museum of Illusions CP',
      area: 'Connaught Place',
      city: 'New Delhi',
      address: 'A-30 to 35, First Floor, Inner Circle, Connaught Place, New Delhi 110001',
      lat: 28.6335,
      lng: 77.2185,
      metroStation: 'Rajiv Chowk Metro (Gate 8)',
      parkingAvailable: true
    },
    pricePerPerson: 550,
    durationMinutes: 60,
    rating: 4.7,
    reviewCount: 3800,
    openingHours: '11:00 AM',
    closingHours: '08:30 PM',
    tags: ['family', 'kids', 'photography', 'fun', 'indoor', 'interactive'],
    features: ['Over 50 Interactive Exhibits', 'Trained Photo Guides', 'Smart Playroom with Puzzles'],
    whatIsIncluded: ['Full Museum Access Ticket', 'Vortex Tunnel and Ames Room access'],
    whatToBring: ['Fully charged phone/camera for mind-bending photos!'],
    cancellationPolicy: 'Full refund if cancelled 2 hours prior.',
    trendingScore: 96,
    weatherFit: 'indoor_only',
    slots: [
      { id: 's-ill-1', time: '12:00 PM', rawTime: '12:00', availableSeats: 16, price: 550, status: 'available' },
      { id: 's-ill-2', time: '02:30 PM', rawTime: '14:30', availableSeats: 8, price: 550, status: 'available' },
      { id: 's-ill-3', time: '05:00 PM', rawTime: '17:00', availableSeats: 2, price: 550, status: 'few_left' }
    ]
  },

  // 12. DATES & ROMANCE
  {
    id: 'exp-date-1',
    name: 'Sunset Boating & Lake Garden Walk at Hauz Khas',
    tagline: '13th-century madrasa ruins, tranquil deer lake & golden sunset glow',
    category: 'dates',
    subcategory: 'monument',
    description: 'Begin with a quiet stroll through the stone pavilion arches of the medieval Sultanate reservoir. Watch migratory ducks drift across the lake as the sky turns rose-gold, followed by coffee on Hauz Khas Village lakeside balconies.',
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=1200&q=80'
    ],
    venue: {
      id: 'venue-hklake',
      name: 'Hauz Khas Fort & Lake Complex',
      area: 'Hauz Khas',
      city: 'New Delhi',
      address: 'Hauz Khas Village, Near Deer Park, New Delhi 110016',
      lat: 28.5532,
      lng: 77.1945,
      metroStation: 'Green Park Metro Station',
      parkingAvailable: false
    },
    pricePerPerson: 100,
    durationMinutes: 75,
    rating: 4.8,
    reviewCount: 3900,
    openingHours: '08:00 AM',
    closingHours: '07:00 PM',
    tags: ['date', 'romantic', 'sunset', 'heritage', 'photography', 'peaceful'],
    features: ['Historic Stone Balconies', 'Lake Walking Trail', 'Lakeside Rooftop Cafes Adjacent'],
    whatIsIncluded: ['Monument Grounds Entry', 'Sunset Spotting Guide'],
    whatToBring: ['Comfortable walking shoes, sunglasses'],
    cancellationPolicy: 'Valid all day, instant entry.',
    trendingScore: 97,
    weatherFit: 'pleasant_outdoor',
    slots: [
      { id: 's-hk-1', time: '04:00 PM', rawTime: '16:00', availableSeats: 30, price: 100, status: 'available' },
      { id: 's-hk-2', time: '05:30 PM', rawTime: '17:30', availableSeats: 15, price: 100, status: 'available' }
    ]
  }
];
