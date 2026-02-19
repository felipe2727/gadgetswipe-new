-- Seed 25 test gadgets across categories
-- Uses category IDs from the initial migration (fetched by slug)

INSERT INTO gadgets (title, description, image_url, price_cents, source_url, source_site, category_id, tags, is_active, content_status) VALUES

-- AUDIO (3)
('Sony WF-1000XM5 Earbuds', 'Industry-leading noise cancellation in the smallest, lightest design ever. Crystal clear calls and all-day comfort.', 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600&h=800&fit=crop', 27999, 'https://www.amazon.com/dp/B0C33XXS56', 'amazon', (SELECT id FROM categories WHERE slug = 'audio'), ARRAY['earbuds', 'noise-cancelling', 'sony', 'wireless'], true, 'approved'),

('Marshall Emberton II Speaker', 'Portable Bluetooth speaker with 360-degree sound. 30+ hours battery life, IP67 dust and water resistant.', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=800&fit=crop', 14999, 'https://www.amazon.com/dp/B09XKVN2GF', 'amazon', (SELECT id FROM categories WHERE slug = 'audio'), ARRAY['speaker', 'bluetooth', 'portable', 'marshall'], true, 'approved'),

('FiiO BTR7 DAC/Amp', 'Hi-res Bluetooth DAC and headphone amplifier. Dual ES9219MQ chips, balanced output, LDAC support.', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=800&fit=crop', 19999, 'https://www.amazon.com/dp/B0BHKGZP2X', 'amazon', (SELECT id FROM categories WHERE slug = 'audio'), ARRAY['dac', 'amp', 'bluetooth', 'hi-res'], true, 'approved'),

-- WEARABLE (3)
('Apple Watch Ultra 2', 'The most rugged Apple Watch with 72-hour battery, precision dual-frequency GPS, and customizable Action Button.', 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=800&fit=crop', 79999, 'https://www.amazon.com/dp/B0CHX3QBCH', 'amazon', (SELECT id FROM categories WHERE slug = 'wearable'), ARRAY['smartwatch', 'apple', 'fitness', 'gps'], true, 'approved'),

('Oura Ring Gen 3', 'Smart ring that tracks sleep, activity, heart rate, and body temperature. Titanium design, 7-day battery.', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=800&fit=crop', 29900, 'https://ouraring.com/product/rings/horizon', 'producthunt', (SELECT id FROM categories WHERE slug = 'wearable'), ARRAY['smart-ring', 'sleep-tracker', 'health', 'titanium'], true, 'approved'),

('Ray-Ban Meta Smart Glasses', 'Smart glasses with built-in camera, speakers, and Meta AI. Livestream, take calls, and capture moments hands-free.', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=800&fit=crop', 29900, 'https://www.ray-ban.com/meta-smart-glasses', 'gadgetflow', (SELECT id FROM categories WHERE slug = 'wearable'), ARRAY['smart-glasses', 'camera', 'ai', 'meta'], true, 'approved'),

-- SMART HOME (3)
('Philips Hue Gradient Lightstrip', 'Multi-color LED strip that creates ambient lighting behind your TV or along walls. Works with all smart assistants.', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=800&fit=crop', 22999, 'https://www.amazon.com/dp/B097CS67K7', 'amazon', (SELECT id FROM categories WHERE slug = 'smart_home'), ARRAY['lighting', 'smart-home', 'philips-hue', 'led'], true, 'approved'),

('Aqara Video Doorbell G4', 'Smart doorbell with facial recognition, local storage, HomeKit support, and no subscription required.', 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=800&fit=crop', 11999, 'https://www.aqara.com/en/product/video-doorbell-g4', 'producthunt', (SELECT id FROM categories WHERE slug = 'smart_home'), ARRAY['doorbell', 'smart-home', 'homekit', 'security'], true, 'approved'),

('Switchbot Curtain 3', 'Retrofit smart curtain motor. Solar-powered, whisper-quiet, works with Alexa and Google Home. No wiring needed.', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&h=800&fit=crop', 8999, 'https://www.switch-bot.com/products/switchbot-curtain-3', 'reddit', (SELECT id FROM categories WHERE slug = 'smart_home'), ARRAY['curtain', 'automation', 'solar', 'smart-home'], true, 'approved'),

-- EDC (3)
('Leatherman FREE P4', 'Premium multi-tool with magnetic locking, one-hand opening, 21 tools. Built in Portland, 25-year warranty.', 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600&h=800&fit=crop', 16995, 'https://www.leatherman.com/free-p4-832640.html', 'uncrate', (SELECT id FROM categories WHERE slug = 'edc'), ARRAY['multi-tool', 'edc', 'leatherman', 'titanium'], true, 'approved'),

('Orbitkey Key Organizer', 'Slim key organizer that eliminates jingle. Holds 2-7 keys, includes bottle opener and SIM ejector.', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop', 4490, 'https://www.orbitkey.com/collections/key-organiser', 'gadgetflow', (SELECT id FROM categories WHERE slug = 'edc'), ARRAY['key-organizer', 'edc', 'minimalist'], true, 'approved'),

('Rovyvon Aurora A8x Flashlight', 'Tiny rechargeable flashlight with 650 lumens. UV light, red beacon, GITD body. Weighs just 25g.', 'https://images.unsplash.com/photo-1567174396505-3e232e63fabe?w=600&h=800&fit=crop', 3999, 'https://www.rovyvon.com/products/a8x', 'reddit', (SELECT id FROM categories WHERE slug = 'edc'), ARRAY['flashlight', 'edc', 'rechargeable', 'compact'], true, 'approved'),

-- GAMING (2)
('Steam Deck OLED', 'Portable gaming PC with vibrant HDR OLED display, 50% more battery life, and faster WiFi. Play your entire Steam library.', 'https://images.unsplash.com/photo-1640955014216-75201056c829?w=600&h=800&fit=crop', 54999, 'https://store.steampowered.com/steamdeck', 'reddit', (SELECT id FROM categories WHERE slug = 'gaming'), ARRAY['gaming', 'portable', 'oled', 'steam'], true, 'approved'),

('8BitDo Ultimate Controller', 'Hall effect sticks and triggers with zero drift. Bluetooth, 2.4G, and USB-C. Custom profiles via app.', 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600&h=800&fit=crop', 6999, 'https://www.8bitdo.com/ultimate-bluetooth-controller', 'gadgetflow', (SELECT id FROM categories WHERE slug = 'gaming'), ARRAY['controller', 'gaming', 'bluetooth', 'hall-effect'], true, 'approved'),

-- PRODUCTIVITY (3)
('Logitech MX Master 3S', 'Silent clicks, 8K DPI tracking on any surface, MagSpeed scroll wheel. Connect to 3 devices simultaneously.', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=800&fit=crop', 9999, 'https://www.amazon.com/dp/B09HM94VDS', 'amazon', (SELECT id FROM categories WHERE slug = 'productivity'), ARRAY['mouse', 'ergonomic', 'wireless', 'logitech'], true, 'approved'),

('reMarkable 2 Paper Tablet', 'E-ink writing tablet that feels like paper. Zero distractions, handwriting-to-text conversion, cloud sync.', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=800&fit=crop', 44900, 'https://remarkable.com/store/remarkable-2', 'producthunt', (SELECT id FROM categories WHERE slug = 'productivity'), ARRAY['tablet', 'e-ink', 'writing', 'note-taking'], true, 'approved'),

('Elgato Stream Deck MK.2', '15 customizable LCD keys for shortcuts, scenes, and macros. Plugin ecosystem with 250+ integrations.', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=800&fit=crop', 14999, 'https://www.elgato.com/en/stream-deck', 'uncrate', (SELECT id FROM categories WHERE slug = 'productivity'), ARRAY['stream-deck', 'macros', 'streaming', 'shortcuts'], true, 'approved'),

-- PHOTOGRAPHY (2)
('Insta360 X4', '8K 360-degree action camera with AI-powered editing. Invisible selfie stick, FlowState stabilization.', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=800&fit=crop', 49999, 'https://www.insta360.com/product/insta360-x4', 'gadgetflow', (SELECT id FROM categories WHERE slug = 'photography'), ARRAY['camera', '360', 'action-cam', '8k'], true, 'approved'),

('Peak Design Everyday Sling 6L', 'Compact camera sling bag with FlexFold dividers, weatherproof shell, and quick-access side zip.', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop', 10995, 'https://www.peakdesign.com/products/everyday-sling', 'uncrate', (SELECT id FROM categories WHERE slug = 'photography'), ARRAY['bag', 'camera-bag', 'sling', 'edc'], true, 'approved'),

-- AUTOMOTIVE (2)
('VIOFO A139 Pro Dash Cam', '4K HDR front + rear dash cam with Sony STARVIS 2 sensor. GPS, parking mode, buffered recording.', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=800&fit=crop', 29999, 'https://www.amazon.com/dp/B0C5M9DVJL', 'amazon', (SELECT id FROM categories WHERE slug = 'automotive'), ARRAY['dashcam', '4k', 'gps', 'parking-mode'], true, 'approved'),

('Jowua Wireless Car Charger for Tesla', 'Auto-clamping 15W MagSafe car charger designed specifically for Tesla Model 3/Y center console.', 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&h=800&fit=crop', 5999, 'https://jowua.com/products/magsafe-car-charger', 'reddit', (SELECT id FROM categories WHERE slug = 'automotive'), ARRAY['charger', 'tesla', 'magsafe', 'wireless'], true, 'approved'),

-- OUTDOOR (2)
('BioLite CampStove 2+', 'Wood-burning camp stove that generates electricity to charge your devices. 3W USB output, real-time fire metrics.', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=800&fit=crop', 19995, 'https://www.bioliteenergy.com/products/campstove-2-plus', 'uncrate', (SELECT id FROM categories WHERE slug = 'outdoor'), ARRAY['camping', 'stove', 'charger', 'outdoor'], true, 'approved'),

('Garmin inReach Mini 2', 'Satellite communicator for off-grid adventures. SOS, two-way messaging, GPS tracking. Works anywhere on Earth.', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=800&fit=crop', 39999, 'https://www.garmin.com/en-US/p/765374', 'gadgetflow', (SELECT id FROM categories WHERE slug = 'outdoor'), ARRAY['satellite', 'gps', 'sos', 'hiking'], true, 'approved'),

-- HEALTH (2)
('Theragun Mini 2.0', 'Ultra-portable percussion massager. 3 speeds, QuietForce Technology, 150-minute battery. Fits in your pocket.', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=800&fit=crop', 19900, 'https://www.therabody.com/theragun-mini', 'producthunt', (SELECT id FROM categories WHERE slug = 'health'), ARRAY['massage', 'recovery', 'portable', 'fitness'], true, 'approved'),

('Levels CGM (Continuous Glucose Monitor)', 'See how food affects your metabolic health in real-time. Sensor + app with personalized insights and scores.', 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=800&fit=crop', 19900, 'https://www.levels.link/cgm', 'producthunt', (SELECT id FROM categories WHERE slug = 'health'), ARRAY['health', 'glucose', 'metabolic', 'biohacking'], true, 'approved');
