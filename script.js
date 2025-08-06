// enchanted_ghibli_diary script.js

let pin = "";
const correctPin = "062125";
const MAX_PIN_LENGTH = 6;
const pinError = document.getElementById('pinError');

const metDate = new Date("2025-06-21T22:00:00-07:00");
let timerInterval;

 const allContents = {
        daily: "✨ Hi :) i know this is long overdue, but today is your special day my love, look around the website and enjoy it Mads its all yours!! I hope I can make the rest of this day as sepcial as you are to me!🌸 I love you Madi!",
        //daily_opened: "You've already savored today's special message, little friend! Come back tomorrow for a fresh whisper from the forest. 🌳",
        entry1: "Hey mads!!! Welcome to my journal, I know you might be wondering what it is, but this is a collection of all the memories we have made together, and I hope you enjoy it as much as I do! \n- I love you 💖",
        entry2: "Today was the first time I had seen her in years. I was so nervous; rustling my hands, picking at my cuticles as I waited for her. When I finally saw her, I didn’t know what to say. I had known her for years, yet at the same time, it felt like I knew nothing about her. I know she must’ve felt the same way, but we powered through. As the night went on and we finished watching The Last Rodeo, it felt just like those Sundays years ago when we worked at Sonic and talked about the most random things.I had missed that. I realized I had missed her. Not in a romantic way, but as a close friend I hadn’t seen in so long. – Neftali",
        entry3: "Our second and much needed hangout. I felt like we still had so much to catch up on. After we watched Lilo and Stitch and yes, she cried a little too; I took her to Tempe. We walked around the campus and talked. But something was different. The way she listened to me, really listened, when I opened up about leaving the cult, about the things I’ve been through… Something in our relationship shifted that night. I don’t know exactly what it was. I just know that something changed.– Neftali",
        entry4: "I forgot the GIFTS!!I messaged her to ask if she wanted to go shopping with me for some presents I forgot for my friend’s upcoming birthday.To my surprise, she said yes.When we arrived at the mall, I was nervous she looked really pretty in her flannel shirt, and I was trying hard to play it cool. We bought the gifts and decided to hit the Round 1 arcade. We played and had the time of our lives. Even with my messed up knee, we still played volleyball and jumped on the trampolines. Afterward, we went downstairs where I tried to win her some plushies but as luck would have it, I couldn’t. She did, though. She won me two: a Zoro plushie and a Pickle Rick. Her sense of humor and her eyes, damn, her eyes had me completely encapsulated the entire time.I think I am starting to fall for her. – Neftali",
        entry5: "Never going to Applebee’s again in my life. It was horrible. Madi ordered some artichoke dip and yeah, it was pretty bad too (sorry Mads). Afterwards, we were both feeling so underwhelmed we decided to YOLO and go to the How to Train Your Dragon movie. We stopped by Walmart to pick up a few things, and that’s when I found out she’s a cheese girly, might be her Italian side. While we were walking through the aisles, my heart was pounding. I knew I liked her, but I couldn’t tell her. At the drive-ins, we didn’t even watch the movie, we just talked and talked. Those were the fastest two hours of my life. -- Neftali",
        entry6: "I really like this girl, I am going to go to her coffee shop to see her. wish me luck furture self!-------- It was awsome, OG juan's truck was messed up though had to get a tow truck to get it, I think im up in brownie points rn. – Neftali",
        entry7: "She came to my work!! We went to Culver’s, it was mid too. That’s 0 for 2 on restaurants right now 😂 But... I think she might like me, right? She wouldn’t have come if she didn’t, or am I just crazy?! I want to tell her how I feel. I might actually do it.– Neftali",
        entry8: "SHE LIKESSSSSS MEEEEEEEEE!!!!!!! She really likes me! i took her to go get pho and the whole time I was so nervous. After that i wook her to the tempe parking lot by the bridge and confessed. AND SHE SAID SHEEE LIKESSSS MEEEEE!!! I cant belive it, im over the moon rn--Neftali",
        entry9: "She interrogated me about the cult, which I absolutely don’t blame her for. She asked, and I answered. I was worried she’d lose interest, but she assured me she didn’t. We ate sushi and continued to talk. The night was fun. Neftali",
        entry10: "I did it fellas, I took her to go see a Studio Ghibli movie. I wanted her to like it so badly because they’re the best and I love them a lot. She laid down on my shoulder at the movie theater and I was geeked. Neftali",
        entry11: "We went to Home Depot and looked at chandeliers, believe it or not. We walked around like a married couple, it was kinda funny. We then went to go see the F1 movie, which was pretty good, and afterwards we went back to Home Depot where we talked about her past and how she got kicked out. We also soft launched, which was amazing. Neftali",
        entry12: "It was the 4th of July weekend and we went to eat brunch at IHOP. It was so good. Afterwards we went to Changing Hands Bookstore and we both bought some books. Then we went to the library and I helped her with the placement test for math, but we didn’t finish. Neftali",
        entry13: "She came to Sherwin to bring me and Daisy drinks. Daisy loved her and I was so happy to see her. We talked for a while, then we parted ways. Neftali",
        entry14: "I went to church, it was amazing. I was happy to be able to see how others worship. Afterward we went to Ranch Market where we tried to find the horchata mix, but we couldn’t. We went to Bobby Q, note to self, take her later in the year and eat outside. Afterwards we went to Barnes & Noble, got some ice cream and snacks, and then she had to go home to take the boys their food. Neftali (kissed her too btw)",
        entry15: "Bananas, so many bananas. Poor Madi had to bake so many cupcakes. I went to help her unload them. I met Stella, Chloe, and Nico today. They were all chill as hell. Neftali",
        entry16: "We went to see Jurassic Park. The movie was kinda mid, but the Chili’s, oh my God, it was so good. I owe Madi big time for this, need to cash some checks. Neftali",
        entry17: "We went to eat Korean BBQ and she loved it. I was cooking the whole time and she was just watching me, probably because I got a haircut and she was objectifying me. We also got some ice cream. Afterwards we went to the park and had to walk off some of the food. She popped my pimples and looked so cute focusing on it. Neftali",
        entry18: "We went to get pizza and wings from Napoli, it was bomb. Afterwards we went to the park, practiced her pitch, and I started working on her website. Neftali",
        entry19: "My tonsils feel like shit. My body aches and I feel like I can’t swallow. Madi asked if I wanted anything and she brought me coffee. She met Nube and even said hi to Pablito. It was a little awkward but funny. I’m just so happy she brought me this. Neftali",
        entry20: "That movie was badass. Madi cried for Sue, but it was fine because she survived with plot armor. After the movie, we stayed up and talked about the issues with the people getting sued. We also got some Salsita tacos. Neftali",
        entry21: "Another Sunday, another dollar. After the service, we went to Texas. Madi saw her parents. I was shocked she saw her dad and they talked outside for a while. We came back in and she told me how it went. She also texted her mom and they both seemed to reconnect. I wish her the best and hope this keeps going. Neftali",
        entry22: "Went to Cholla to work on the website. We finished it. Madi really liked it and I do too. She showed her mom, who loved it as well. We grabbed Taco Bell and called it a night. Neftali",
        entry23: "She pulled up to Sherwin after lunch with her parents. She brought me a sandwich, it was pretty good. We talked, then she went back home. Neftali",
        entry24: "Hey Madi, we ended up going to Five Below. I was buying stuff for her while shopping, which she might’ve known, but she said she didn’t pay much attention to it. Then we went to church to try and find some things, but we couldn’t. We got In-N-Out milkshakes afterwards. Neftali",
        entry25: "This man said, let me wait and ask Gladys. I’m a grown-ass man and I do as I please, so I will ask her out whenever I want to, not when you find the time to go have lunch with me. Neftali",
        entry26: "We had dinner with her parents and now I’m her mom’s best friend. We talked and shit-talked and I’m so glad Madi was able to go back home after three years. Neftali",

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

//make it one time a day or forever
function openDailyLetter() {
    /*const today = new Date().toDateString();
    const lastOpened = localStorage.getItem('dailyLetterDate');
    const id = (lastOpened === today) ? 'daily_opened' : 'daily';
    if (id === 'daily') localStorage.setItem('dailyLetterDate', today);
    showScroll(id);
    */
    showScroll('daily');
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
    //add entry labels and content
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
        { id: 'entry25', label: '08/03 Ask Delay' },
        { id: 'entry26', label: '08/06 Parent day' }
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

//Add memory album images
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

