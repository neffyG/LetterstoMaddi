// enchanted_ghibli_diary script.js

let pin = "";
const correctPin = "062125";
const MAX_PIN_LENGTH = 6;
const pinError = document.getElementById('pinError');

const metDate = new Date("2025-06-21T22:00:00-07:00");
let timerInterval;

 const allContents = {
        daily: "✨ Welcome, dear forest spirit! May your day be filled with joy and delightful discoveries. Remember to sprinkle kindness and compassion wherever your path leads! 🌸",
        daily_opened: "You've already savored today's special message, little friend! Come back tomorrow for a fresh whisper from the forest. 🌳",
        entry1: "Dear journal, today the forest air felt crisp and alive, carrying the scent of damp earth and blooming wildflowers. I spotted a tiny mushroom village nestled at the base of an ancient oak – a perfect secret hideaway. It truly felt like stepping into a hidden realm. 🖋️",
        entry2: "Remember to take gentle care of your spirit, just as the rain nurtures the leaves. Find solace in quiet moments, whether it's the warmth of sunshine on your face or the comforting glow of a firefly. These small acts of presence nourish the soul. 🌼",
        entry3: "May your dreams be as vast as the starlit sky, and your heart as brave as a venturing river. You carry a unique magic within you, destined to illuminate the world in your own wonderful way. Keep believing in the impossible! ✨",
        entry4: "The rain poured gently today, washing the world clean and leaving behind a glistening freshness. It was the perfect excuse to curl up with my favorite herbal tea and listen to the rhythmic drumming on the windowpane. There's a peaceful, hushed magic in a rainy afternoon. 🌧️☕",
        entry5: "Tonight, the moon shone like a silver coin suspended in velvet, casting long, dancing shadows. I pondered the quiet wonders of the night, and the silent stories whispered by the wind through the trees. A truly enchanting end to the day. 🌙📖",
        entry6: "Spent some time today tending to new thoughts, like planting tiny seeds in a secret garden. It felt challenging at first, but with patience and curiosity, new ideas began to sprout. Never stop nurturing the growth of your mind! 🧠💡",
        entry7: "Today, my heart overflows with gratitude for the simplest of gifts: the soft murmur of a hidden stream, the warmth of a loved one's smile, and the resilience of a tiny sapling pushing through the earth. Cultivating gratitude truly makes the ordinary extraordinary. 🙏💖",
        entry8: "Today we wandered through old library aisles, tracing our fingers over the spines of forgotten tales. The scent of aged pages filled the air like nostalgia. Even in silence, every glance felt like a shared story. 📚✨",
        entry9: "We sat under the flickering city lights, sushi rotating by like thoughts on a carousel. The night ended in questions, answers, and laughter. A strange documentary, a strange day — strangely perfect. 🍣📽️",
        entry10: "A castle in the sky and wings on the plate — we dove into dreams and spicy wings with equal hunger. There's magic in childish wonder and messy fingers. 🏰🍗",
        entry11: "It was the kind of day you don’t take photos of — you just live it. From hardware store hauls to F1 races and soft smiles in parking lots, it felt like something new was blooming. 🛠️🏎️",
        entry12: "Brunch was sweet, the bookstore even sweeter. You helped me prep for the future while we got lost in shelves of other people's pasts. ✏️📖",
        entry13: "You brought drinks — not just the kind in a cup, but the kind that nourishes the soul. Small gestures, big heart. 🍹💞",
        entry14: "We prayed together today. Ate, laughed, wandered markets and bookstores — like kids playing grown-up. Chocolate-dipped strawberries never tasted so sacred. 🛐🍓",
        entry15: "You lifted 200 cupcakes and my heart in one go. Watching you move through that kitchen was watching purpose in motion. 🧁💪",
        entry16: "The drive-in glowed like a dream as dinosaurs roared and Chilis warmed our bellies. It felt like dating in a 90s movie — but better, because it was you. 🦖🎬",
        entry17: "Korean BBQ crackled and so did the stars above us at the park. Stone-cold sweetness and warm laughs carried us into the night. 🍨🌌",
        entry18: "A study session turned into something more — Napoli pizza and academic thunder at Thunderbird. We were so focused, yet so distracted by each other. 🍕📚",
        entry19: "You brought tea when I was sick — like a soft remedy in human form. You met Nube today too. She's already obsessed. ☕🐶",
        entry20: "Fantastic 4 may not have been Oscar-worthy, but the real plot twist was us eating tacos after midnight. 🌮🦸",
        entry21: "Church, steak, and a brush with the past. You held my hand tighter when they walked by — and in that moment, I felt safe. 🙏🥩",
        entry22: "We practiced pitches and built dreams between tacos and laughter. Even the library lights felt like stage spotlights. 🌮💻",
        entry23: "Today you came after everything — after pain, after hard talks. Sherwin’s never looked so soft until you were there. 🖌️🤍",
        entry24: "Church followed by Chilis and a dollar store treasure hunt. You surprised me with shakes and your smile. A holy kind of joy. ⛪🍦",
        entry25: "Today we were still. Sushi spun and books whispered, and even your dad’s warning couldn’t dim how proud I am to love you. 🍣📚🧡",
        photo1: "Oh, the glorious warmth of summer! This picture captures a perfect afternoon by the shimmering lake, where laughter echoed among the dragonflies. It was a day woven with sunshine, gentle splashes, and pure bliss, like a memory spun from light. ☀️",
        photo2: "My heart melts every time I see this little fluffball! Their sleepy purr is the best melody, and their tiny paws bring endless joy. Truly the most adorable companion a person could ask for, a guardian of coziness. ❤️🐾",
        photo3: "Nature's artistry is simply breathtaking! This snapshot from my wanderings captures the magical way sunlight filters through the ancient, moss-covered trees, creating a dappled, emerald wonderland. Every leaf, every branch hums with life. 🌳🦋",
        time_since_met_header: "Our Enchanting Journey Together! 💖",
        music_player_header: "Melodies of Our Connection 🎶"
    };

function enterDigit(digit) {
    if (pin.length < MAX_PIN_LENGTH) {
        pin += digit;
        updateDots();
        pinError.style.display = 'none';
    }
}

function clearPin() {
    pin = pin.slice(0, -1);
    updateDots();
    pinError.style.display = 'none';
}

function updateDots() {
    document.querySelectorAll('.pin-dot').forEach((dot, index) => {
        dot.classList.toggle('filled', index < pin.length);
    });
}

function submitPin() {
    if (pin === correctPin) {
        document.getElementById('pinOverlay').style.display = 'none';
        pinError.style.display = 'none';
        closeAllOverlays();
    } else {
        pin = "";
        updateDots();
        pinError.style.display = 'block';
    }
}

function openDailyLetter() {
    const today = new Date().toDateString();
    const lastOpened = localStorage.getItem('dailyLetterDate');
    const id = (lastOpened === today) ? 'daily_opened' : 'daily';
    if (id === 'daily') localStorage.setItem('dailyLetterDate', today);
    showScroll(id);
}

function openNotebookPage() {
    document.getElementById('notebookPageOverlay').style.display = 'flex';
    populateNotebookTabs();
    closeScroll(); closeMusicPlayer(); stopTimer();
}

function closeNotebookPage() {
    document.getElementById('notebookPageOverlay').style.display = 'none';
}

function populateNotebookTabs() {
    const notebookTabs = document.getElementById('notebookTabs');
    const contentArea = document.getElementById('notebookContentArea');

    const entryLabels = [
        { id: 'entry1', label: 'Our dates:' },
        { id: 'entry2', label: 'Last Rodeo 05/24/25' },
        { id: 'entry3', label: 'Lilo n Stitch / CFA? / Tempe 05/30/25' },
        { id: 'entry4', label: 'Round 1 / In-N-Out 06/03/25' },
        { id: 'entry5', label: 'Applebee’s / HTTYD 06/13/25' },
        { id: 'entry6', label: 'Coffee Shop 06/19' },
        { id: 'entry7', label: '06/20 Culver’s Lunch' },
        { id: 'entry8', label: '06/21 Confession Day' },
        { id: 'entry9', label: '06/27 Sushi & Talk' },
        { id: 'entry10', label: '06/28 Castle in the Sky' },
        { id: 'entry11', label: '07/01 Soft Launch' },
        { id: 'entry12', label: '07/04 Placement Test' },
        { id: 'entry13', label: '07/05 Sherwin Drinks' },
        { id: 'entry14', label: '07/13 Big Sunday' },
        { id: 'entry15', label: '07/14 Cupcakes' },
        { id: 'entry16', label: '07/18 Dino Drive-In' },
        { id: 'entry17', label: '07/21 BBQ & Park' },
        { id: 'entry18', label: '07/23 Study Day' },
        { id: 'entry19', label: '07/24 Sick Day' },
        { id: 'entry20', label: '07/26 Fantastic 4' },
        { id: 'entry21', label: '07/27 Roadhouse + Parents' },
        { id: 'entry22', label: '07/30 Website Grind' },
        { id: 'entry23', label: '08/01 Sherwin' },
        { id: 'entry24', label: '08/02 Full Day' },
        { id: 'entry25', label: '08/03 Ask Delay' }
    ];

    notebookTabs.innerHTML = "";
    contentArea.innerHTML = "";

    entryLabels.forEach(entry => {
        const tab = document.createElement('div');
        tab.className = 'notebook-tab';
        tab.dataset.content = entry.id;
        tab.textContent = entry.label;
        tab.onclick = () => showNotebookContent(entry.id);
        notebookTabs.appendChild(tab);

        const div = document.createElement('div');
        div.id = `notebook-${entry.id}`;
        div.innerHTML = allContents[entry.id] || '';
        contentArea.appendChild(div);
    });
}


function showNotebookContent(id) {
    document.querySelectorAll('#notebookContentArea > div')
        .forEach(d => d.classList.remove('active'));

    const envelope = document.getElementById('entryEnvelope');
    envelope.style.display = 'block';
    setTimeout(() => {
        document.getElementById(`notebook-${id}`).classList.add('active');
        envelope.style.display = 'none';
    }, 800);

    document.querySelectorAll('.notebook-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.content === id);
    });
}

function closeEntryContent() {
    document.querySelectorAll('#notebookContentArea > div')
        .forEach(div => div.classList.remove('active'));
    document.querySelectorAll('.notebook-tab')
        .forEach(tab => tab.classList.remove('active'));
}

function toggleAlbum() {
    document.getElementById('scrollContent').innerHTML =
        `<h3>Summer Memories</h3>${allContents.photo1}<br><br>` +
        `<h3>Favorite Pet Pic</h3>${allContents.photo2}<br><br>` +
        `<h3>Nature's Beauty</h3>${allContents.photo3}`;
    document.getElementById('scrollOverlay').style.display = 'block';
    closeNotebookPage(); closeMusicPlayer(); stopTimer();
}

function openTimeSinceMet() {
    document.getElementById('scrollContent').innerHTML =
        `<h3>${allContents.time_since_met_header}</h3><div id="timerDisplay"></div>`;
    document.getElementById('scrollOverlay').style.display = 'block';
    closeNotebookPage(); closeMusicPlayer(); startTimer();
}

function startTimer() {
    stopTimer(); updateTimeSinceMet();
    timerInterval = setInterval(updateTimeSinceMet, 1000);
}

function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
}

function updateTimeSinceMet() {
    const now = new Date();
    const seconds = Math.floor((now - metDate) / 1000);
    const days = Math.floor(seconds / 86400);
    const hrs = String(Math.floor((seconds % 86400) / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    document.getElementById('timerDisplay').textContent = `${days} days, ${hrs}h ${mins}m ${secs}s`;
}

function showScroll(id) {
    document.getElementById('scrollContent').innerHTML = allContents[id] || '';
    document.getElementById('scrollOverlay').style.display = 'block';
    closeNotebookPage(); closeMusicPlayer(); stopTimer();
}

function closeScroll() {
    document.getElementById('scrollOverlay').style.display = 'none';
    stopTimer();
}

function openMusicPlayer() {
    document.getElementById('musicOverlay').style.display = 'flex';
    closeScroll(); closeNotebookPage(); stopTimer();
}

function closeMusicPlayer() {
    document.getElementById('musicOverlay').style.display = 'none';
}

function closeAllOverlays() {
    closeScroll(); closeNotebookPage(); closeMusicPlayer(); stopTimer();
}

function pingMadi() {
    window.location.href = "sms:+16026958531?body=Madi,%20I%20need%20you!";
}

document.addEventListener('DOMContentLoaded', () => {
    populateNotebookTabs();
});

function populateMemoryAlbumImages() {
    const album = document.getElementById('memoryAlbum');
    const imageFilenames = [
    'IMG_0032.jpg', 'IMG_0038.jpg', 'IMG_1064.jpg',
    'IMG_4221.jpg', 'IMG_4311.jpg', 'IMG_4327.jpg',
    'IMG_4459.jpg', 'IMG_4543.jpg', 'IMG_4571.jpg',
    'IMG_7905.jpg', 'lp_image.jpg'
];

    album.innerHTML = "";
    imageFilenames.forEach(filename => {
        const img = document.createElement('img');
        img.src = `photo/${filename}`;
        img.alt = 'Memory';
        img.className = 'memory-photo';
        album.appendChild(img);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    populateNotebookTabs();
    populateMemoryAlbumImages();
});

function toggleAlbum() {
    document.getElementById('notebookPageOverlay').style.display = 'none';
    document.getElementById('scrollOverlay').style.display = 'none';
    document.getElementById('musicOverlay').style.display = 'none';
    document.getElementById('memoryPageOverlay').style.display = 'block';
}


function closeMemoryPage() {
    document.getElementById('memoryPageOverlay').style.display = 'none';
}

