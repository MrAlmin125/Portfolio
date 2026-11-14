 (function() {
            'use strict';

            var config = document.getElementById('configData');
            var name1 = config.dataset.name1 || 'মিঃ আমিন';
            var name2 = config.dataset.name2 || 'মনিকা';
            var img1 = config.dataset.image1 || 'assets/images/lover-1.jpg';
            var img2 = config.dataset.image2 || 'assets/images/lover-2.jpg';
            var petalCount = parseInt(config.dataset.petalCount, 10) || 18;
            var specialDate = config.dataset.specialDate || '2026-08-20';
            var loveStartDate = config.dataset.loveStartDate || '2026-08-15';
            var dedicationText = config.dataset.dedication || 'তুমি আমার জীবনের সবচেয়ে সুন্দর অনুভূতি';
            var letterTemplate = config.dataset.letter || '';

            function parseDate(dateStr) {
                if (!dateStr) return new Date();
                var parts = dateStr.split('-');
                if (parts.length === 3) {
                    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                }
                return new Date(dateStr);
            }

            var typeContents = [
                { text: 'আমি তোমাকে ভালোবাসি', name: name2 },
                { text: 'তুমি আমার প্রাণ', name: name2 },
                { text: 'তুমি আমার স্বপ্ন', name: name2 },
                { text: 'তুমি আমার সবকিছু', name: name2 },
                { text: 'তোমার জন্য আমার হৃদয়', name: name2 },
                { text: 'তুমি আমার অনন্ত', name: name2 }
            ];

            var allQuotes = [
                { emoji: '✨', text: 'তোমার সাথে প্রতিটি মুহূর্ত বিশেষ।' },
                { emoji: '🌹', text: 'তুমি আমার জীবনের সবচেয়ে সুন্দর অংশ।' },
                { emoji: '💖', text: 'আমার সাথে থাকার জন্য ধন্যবাদ।' },
                { emoji: '🌟', text: 'তুমি আমার জীবনের আলো।' },
                { emoji: '💕', text: 'তোমার ভালোবাসা আমার সবকিছু।' },
                { emoji: '🌸', text: 'তোমার মতো সুন্দর কেউ নেই।' },
                { emoji: '🌺', text: 'তুমি আমার হৃদয়ের রানি।' },
                { emoji: '💗', text: 'তোমার জন্য আমার ভালোবাসা চিরন্তন।' }
            ];

            var splashScreen = document.getElementById('splashScreen');
            var splashName = document.getElementById('splashName');
            var splashFlowers = document.getElementById('splashFlowers');
            var appCard = document.getElementById('appCard');
            var flyingImages = document.getElementById('flyingImages');

            if (splashName) {
                splashName.textContent = name2;
            }

            if (flyingImages) {
                var flyingImgUrls = [
                    img1 || 'assets/images/lover-1.jpg',
                    img2 || 'assets/images/lover-2.jpg'
                ];
                
                for (var i = 0; i < 25; i++) {
                    var img = document.createElement('img');
                    img.className = 'fly-img';
                    img.src = flyingImgUrls[Math.floor(Math.random() * flyingImgUrls.length)];
                    img.style.left = Math.random() * 90 + '%';
                    img.style.width = (35 + Math.random() * 40) + 'px';
                    img.style.height = img.style.width;
                    img.style.animationDuration = (8 + Math.random() * 12) + 's';
                    img.style.animationDelay = (Math.random() * 10) + 's';
                    if (Math.random() > 0.5) {
                        img.style.border = '3px solid rgba(200, 100, 120, 0.4)';
                    }
                    flyingImages.appendChild(img);
                }
            }

            var splashBubbles = document.getElementById('splashBubbles');
            if (splashBubbles) {
                var bubbleEmojis = ['❤️', '💕', '💗', '💖', '💝'];
                for (var i = 0; i < 15; i++) {
                    var bubble = document.createElement('div');
                    bubble.className = 'splash-bubble';
                    var size = 20 + Math.random() * 40;
                    bubble.style.width = size + 'px';
                    bubble.style.height = size + 'px';
                    bubble.style.left = Math.random() * 90 + '%';
                    bubble.style.animationDuration = (10 + Math.random() * 15) + 's';
                    bubble.style.animationDelay = (Math.random() * 10) + 's';
                    bubble.style.setProperty('--tx', (Math.random() - 0.5) * 200 + 'px');
                    if (Math.random() > 0.6) {
                        bubble.textContent = bubbleEmojis[Math.floor(Math.random() * bubbleEmojis.length)];
                        bubble.style.fontSize = (10 + Math.random() * 14) + 'px';
                        bubble.style.display = 'flex';
                        bubble.style.alignItems = 'center';
                        bubble.style.justifyContent = 'center';
                        bubble.style.background = 'none';
                        bubble.style.border = 'none';
                    }
                    splashBubbles.appendChild(bubble);
                }
            }

            var splashFloating = document.getElementById('splashFloating');
            if (splashFloating) {
                var floatEmojis = ['❤️', '💕', '💗', '💖', '💝', '🌸', '🌺', '🌷', '🌹'];
                for (var i = 0; i < 20; i++) {
                    var item = document.createElement('div');
                    item.className = 'splash-float-item';
                    item.textContent = floatEmojis[Math.floor(Math.random() * floatEmojis.length)];
                    item.style.left = Math.random() * 90 + '%';
                    item.style.fontSize = (1.2 + Math.random() * 1.6) + 'rem';
                    item.style.animationDuration = (8 + Math.random() * 12) + 's';
                    item.style.animationDelay = (Math.random() * 8) + 's';
                    item.style.setProperty('--fx', (Math.random() - 0.5) * 300 + 'px');
                    splashFloating.appendChild(item);
                }
            }

            if (splashFlowers) {
                var flowerEmojis = ['🌸', '🌺', '🌷', '🌹', '💐', '🌻'];
                for (var i = 0; i < 20; i++) {
                    var flower = document.createElement('div');
                    flower.className = 'splash-flower';
                    flower.textContent = flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)];
                    var x = Math.random() * 80 + 10;
                    var y = Math.random() * 80 + 10;
                    flower.style.left = x + '%';
                    flower.style.top = y + '%';
                    flower.style.setProperty('--tx', (Math.random() - 0.5) * 300 + 'px');
                    flower.style.setProperty('--ty', (Math.random() - 0.5) * 300 + 'px');
                    flower.style.animationDelay = (Math.random() * 3) + 's';
                    flower.style.fontSize = (1.5 + Math.random() * 2) + 'rem';
                    splashFlowers.appendChild(flower);
                }
            }

            setTimeout(function() {
                if (splashScreen) {
                    splashScreen.classList.add('hidden');
                }
                if (appCard) {
                    appCard.classList.add('visible');
                }
                var bgMusic = document.getElementById('bgMusic');
                if (bgMusic) {
                    bgMusic.volume = 0.3;
                    bgMusic.play().catch(function() {});
                }
            }, 4500);

            var bubbleContainer = document.getElementById('bubbleContainer');
            if (bubbleContainer) {
                var mainBubbleEmojis = ['❤️', '💕', '💗', '💖'];
                for (var i = 0; i < 12; i++) {
                    var bubble = document.createElement('div');
                    bubble.className = 'bubble';
                    var size = 15 + Math.random() * 35;
                    bubble.style.width = size + 'px';
                    bubble.style.height = size + 'px';
                    bubble.style.left = Math.random() * 90 + '%';
                    bubble.style.animationDuration = (12 + Math.random() * 18) + 's';
                    bubble.style.animationDelay = (Math.random() * 12) + 's';
                    bubble.style.setProperty('--tx', (Math.random() - 0.5) * 150 + 'px');
                    if (Math.random() > 0.7) {
                        bubble.textContent = mainBubbleEmojis[Math.floor(Math.random() * mainBubbleEmojis.length)];
                        bubble.style.fontSize = (8 + Math.random() * 12) + 'px';
                        bubble.style.display = 'flex';
                        bubble.style.alignItems = 'center';
                        bubble.style.justifyContent = 'center';
                        bubble.style.background = 'none';
                        bubble.style.border = 'none';
                    }
                    bubbleContainer.appendChild(bubble);
                }
            }

            var floatingElements = document.getElementById('floatingElements');
            if (floatingElements) {
                var mainFloatEmojis = ['❤️', '💕', '💗', '🌸', '🌺', '🌷', '🌹', '💖'];
                for (var i = 0; i < 15; i++) {
                    var item = document.createElement('div');
                    item.className = 'float-item';
                    item.textContent = mainFloatEmojis[Math.floor(Math.random() * mainFloatEmojis.length)];
                    item.style.left = Math.random() * 90 + '%';
                    item.style.fontSize = (1.2 + Math.random() * 1.4) + 'rem';
                    item.style.animationDuration = (10 + Math.random() * 15) + 's';
                    item.style.animationDelay = (Math.random() * 10) + 's';
                    item.style.setProperty('--fx', (Math.random() - 0.5) * 200 + 'px');
                    floatingElements.appendChild(item);
                }
            }

            var heartRain = document.getElementById('heartRain');
            if (heartRain) {
                var heartEmojis = ['❤️', '💕', '💗', '💖', '💝', '♥️'];
                for (var i = 0; i < 20; i++) {
                    var heart = document.createElement('div');
                    heart.className = 'heart-drop';
                    heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
                    heart.style.left = Math.random() * 100 + '%';
                    heart.style.fontSize = (14 + Math.random() * 20) + 'px';
                    heart.style.animationDuration = (12 + Math.random() * 18) + 's';
                    heart.style.animationDelay = (Math.random() * 20) + 's';
                    heart.style.opacity = 0.2 + Math.random() * 0.4;
                    heartRain.appendChild(heart);
                }
            }

            var sparkleContainer = document.getElementById('sparkleContainer');
            if (sparkleContainer) {
                for (var i = 0; i < 25; i++) {
                    var sparkle = document.createElement('div');
                    sparkle.className = 'sparkle';
                    sparkle.style.left = Math.random() * 100 + '%';
                    sparkle.style.top = Math.random() * 100 + '%';
                    sparkle.style.animationDelay = (Math.random() * 5) + 's';
                    sparkle.style.animationDuration = (2 + Math.random() * 3) + 's';
                    sparkle.style.width = (4 + Math.random() * 6) + 'px';
                    sparkle.style.height = sparkle.style.width;
                    sparkleContainer.appendChild(sparkle);
                }
            }

            var overlay = document.getElementById('petalOverlay');
            if (overlay) {
                overlay.innerHTML = '';
                var colors = ['#ffb6c1', '#f28b9e', '#f7a5b5', '#ffcdd6', '#e8849a'];
                for (var i = 0; i < petalCount; i++) {
                    var petal = document.createElement('div');
                    petal.className = 'petal';
                    var size = 14 + Math.random() * 18;
                    var left = 5 + Math.random() * 88;
                    var delay = 0.1 + Math.random() * 0.9;
                    var duration = 2.0 + Math.random() * 1.4;
                    var rotation = Math.random() * 360;
                    var color = colors[Math.floor(Math.random() * colors.length)];
                    petal.style.width = size + 'px';
                    petal.style.height = size + 'px';
                    petal.style.left = left + '%';
                    petal.style.top = '-6%';
                    petal.style.background = 'radial-gradient(circle at 30% 30%, ' + color + ', #e06a80)';
                    petal.style.animationDuration = duration + 's';
                    petal.style.animationDelay = delay + 's';
                    petal.style.transform = 'rotate(' + rotation + 'deg) scale(0.5)';
                    petal.style.borderRadius = Math.random() > 0.5 ? '80% 0 80% 0' : '0 80% 0 80%';
                    petal.style.boxShadow = '0 0 10px rgba(220, 100, 130, 0.15)';
                    overlay.appendChild(petal);
                }
                setTimeout(function() {
                    if (overlay) {
                        overlay.innerHTML = '';
                        overlay.style.display = 'none';
                    }
                }, 4000);
            }

            document.getElementById('name1Display').textContent = name1;
            document.getElementById('name2Display').textContent = name2;
            document.getElementById('profileName1').textContent = name1;
            document.getElementById('profileName2').textContent = name2;
            document.getElementById('dedicationName').textContent = name2;

            document.getElementById('modalName').textContent = name2;
            document.getElementById('modalSender').textContent = name1;
            var letter = letterTemplate.replace(/\[NAME\]/g, name2);
            var paragraphs = letter.split('\n').filter(function(p) { return p.trim(); });
            document.getElementById('modalLetter').innerHTML = paragraphs.map(function(p) { return '<p>' + p.trim() +
                    '</p>'; }).join('') +
                '<div class="signature">- তোমার ' + name1 + '</div>';

            var typewriterEl = document.getElementById('typewriterText');
            var loverNameTypewriter = document.getElementById('loverNameTypewriter');
            var heartEmojiLast = document.getElementById('heartEmojiLast');
            var cursorBlink = document.getElementById('cursorBlink');

            if (typewriterEl && loverNameTypewriter && heartEmojiLast && cursorBlink) {
                var contentIndex = 0;
                var charIndex = 0;
                var nameIndex = 0;
                var isDeleting = false;
                var isPaused = false;

                function typeEffect() {
                    var currentContent = typeContents[contentIndex];
                    var text = currentContent.text;
                    var loverName = currentContent.name;

                    if (!isDeleting && !isPaused) {
                        if (charIndex < text.length) {
                            typewriterEl.textContent = text.substring(0, charIndex + 1);
                            charIndex++;
                            setTimeout(typeEffect, 100 + Math.random() * 50);
                            return;
                        }
                        if (charIndex >= text.length && nameIndex < loverName.length) {
                            if (nameIndex === 0) {
                                typewriterEl.textContent = text + ' ';
                            }
                            loverNameTypewriter.textContent = loverName.substring(0, nameIndex + 1);
                            nameIndex++;
                            setTimeout(typeEffect, 120 + Math.random() * 40);
                            return;
                        }
                        if (charIndex >= text.length && nameIndex >= loverName.length) {
                            heartEmojiLast.style.display = 'inline-block';
                            isPaused = true;
                            setTimeout(function() {
                                isPaused = false;
                                isDeleting = true;
                                setTimeout(typeEffect, 300);
                            }, 2500);
                            return;
                        }
                    } else if (isDeleting) {
                        if (heartEmojiLast.style.display !== 'none') {
                            heartEmojiLast.style.display = 'none';
                            setTimeout(typeEffect, 100);
                            return;
                        }
                        if (nameIndex > 0) {
                            nameIndex--;
                            loverNameTypewriter.textContent = loverName.substring(0, nameIndex);
                            setTimeout(typeEffect, 50 + Math.random() * 30);
                            return;
                        }
                        if (charIndex > 0) {
                            charIndex--;
                            typewriterEl.textContent = text.substring(0, charIndex);
                            setTimeout(typeEffect, 40 + Math.random() * 30);
                            return;
                        }
                        if (charIndex === 0 && nameIndex === 0) {
                            isDeleting = false;
                            contentIndex = (contentIndex + 1) % typeContents.length;
                            setTimeout(typeEffect, 600);
                            return;
                        }
                    }
                }

                setTimeout(typeEffect, 2500);
            }

            var qText1 = document.getElementById('qText1');
            var qText2 = document.getElementById('qText2');
            var qText3 = document.getElementById('qText3');
            var qEmoji1 = document.getElementById('qEmoji1');
            var qEmoji2 = document.getElementById('qEmoji2');
            var qEmoji3 = document.getElementById('qEmoji3');
            var qCursor1 = document.getElementById('qCursor1');
            var qCursor2 = document.getElementById('qCursor2');
            var qCursor3 = document.getElementById('qCursor3');
            var quoteDiv1 = document.getElementById('quoteDiv1');
            var quoteDiv2 = document.getElementById('quoteDiv2');
            var quoteDiv3 = document.getElementById('quoteDiv3');

            if (qText1 && qText2 && qText3) {
                var currentQuoteIndex = 0;
                var charPositions = [0, 0, 0];

                function getQuoteAt(index) {
                    return allQuotes[index % allQuotes.length];
                }

                function setText(line, text) {
                    var el = [qText1, qText2, qText3][line];
                    if (el) el.textContent = text;
                }

                function setEmoji(line, emoji) {
                    var el = [qEmoji1, qEmoji2, qEmoji3][line];
                    if (el) el.textContent = emoji;
                }

                function showDiv(line, show) {
                    var el = [quoteDiv1, quoteDiv2, quoteDiv3][line];
                    var emoji = [qEmoji1, qEmoji2, qEmoji3][line];
                    if (el) el.classList.toggle('visible', show);
                    if (emoji) emoji.classList.toggle('visible', show);
                }

                function showCursor(line, show) {
                    var el = [qCursor1, qCursor2, qCursor3][line];
                    if (el) el.classList.toggle('active', show);
                }

                function startNextSet() {
                    var q1 = getQuoteAt(currentQuoteIndex);
                    var q2 = getQuoteAt(currentQuoteIndex + 1);
                    var q3 = getQuoteAt(currentQuoteIndex + 2);

                    charPositions = [0, 0, 0];

                    showDiv(0, false);
                    showDiv(1, false);
                    showDiv(2, false);

                    showDiv(0, true);
                    setEmoji(0, q1.emoji);
                    var pos1 = 0;

                    function typeLine1() {
                        if (pos1 < q1.text.length) {
                            pos1++;
                            setText(0, q1.text.substring(0, pos1));
                            showCursor(0, true);
                            setTimeout(typeLine1, 60 + Math.random() * 30);
                        } else {
                            showCursor(0, false);
                            setTimeout(function() {
                                showDiv(1, true);
                                setEmoji(1, q2.emoji);
                                var pos2 = 0;

                                function typeLine2() {
                                    if (pos2 < q2.text.length) {
                                        pos2++;
                                        setText(1, q2.text.substring(0, pos2));
                                        showCursor(1, true);
                                        setTimeout(typeLine2, 60 + Math.random() *
                                        30);
                                    } else {
                                        showCursor(1, false);
                                        setTimeout(function() {
                                            showDiv(2, true);
                                            setEmoji(2, q3.emoji);
                                            var pos3 = 0;

                                            function typeLine3() {
                                                if (pos3 < q3.text
                                                    .length) {
                                                    pos3++;
                                                    setText(2, q3
                                                        .text
                                                        .substring(
                                                            0,
                                                            pos3
                                                        )
                                                    );
                                                    showCursor(
                                                        2,
                                                        true
                                                    );
                                                    setTimeout(
                                                        typeLine3,
                                                        60 +
                                                        Math
                                                        .random() *
                                                        30
                                                    );
                                                } else {
                                                    showCursor(
                                                        2,
                                                        false
                                                    );
                                                    setTimeout(
                                                        function() {
                                                            var deletePos = [
                                                                pos1,
                                                                pos2,
                                                                pos3
                                                            ];

                                                            function deleteAll() {
                                                                var anyLeft =
                                                                    false;
                                                                for (
                                                                    var i =
                                                                    0; i <
                                                                    3; i++
                                                                ) {
                                                                    if (
                                                                        deletePos[
                                                                            i
                                                                        ] >
                                                                        0
                                                                    ) {
                                                                        anyLeft =
                                                                            true;
                                                                        deletePos[
                                                                            i
                                                                        ]--;
                                                                        setText(
                                                                            i,
                                                                            getQuoteAt(
                                                                                currentQuoteIndex +
                                                                                i
                                                                            )
                                                                            .text
                                                                            .substring(
                                                                                0,
                                                                                deletePos[
                                                                                    i
                                                                                ]
                                                                            )
                                                                        );
                                                                    }
                                                                }
                                                                if (
                                                                    anyLeft
                                                                ) {
                                                                    setTimeout(
                                                                        deleteAll,
                                                                        30 +
                                                                        Math
                                                                        .random() *
                                                                        20
                                                                    );
                                                                } else {
                                                                    currentQuoteIndex =
                                                                        (currentQuoteIndex +
                                                                            3) %
                                                                        allQuotes
                                                                        .length;
                                                                    for (
                                                                        var i =
                                                                        0; i <
                                                                        3; i++
                                                                    ) {
                                                                        setText(
                                                                            i,
                                                                            ''
                                                                        );
                                                                        showDiv(
                                                                            i,
                                                                            false
                                                                        );
                                                                    }
                                                                    setTimeout(
                                                                        startNextSet,
                                                                        500
                                                                    );
                                                                }
                                                            }
                                                            deleteAll();
                                                        },
                                                        2500
                                                    );
                                                }
                                            }
                                            typeLine3();
                                        }, 500);
                                    }
                                }
                                typeLine2();
                            }, 500);
                        }
                    }
                    typeLine1();
                }

                setTimeout(startNextSet, 3000);
            }

            // ===== LOVE COUNTER =====
            var loveCounterDays = document.getElementById('loveCounterDays');
            if (loveCounterDays) {
                var startDate = parseDate(loveStartDate);
                var now = new Date();
                var diffTime = Math.abs(now - startDate);
                var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                loveCounterDays.textContent = diffDays;
            }

            var meterFill = document.getElementById('loveMeterFill');
            var meterPercent = document.getElementById('loveMeterPercent');
            if (meterFill && meterPercent) {
                var currentPercent = 0;

                function animateMeter() {
                    if (currentPercent < 100) {
                        currentPercent += 1;
                        meterFill.style.width = currentPercent + '%';
                        meterPercent.textContent = currentPercent + '%';
                        setTimeout(animateMeter, 40);
                    }
                }
                setTimeout(animateMeter, 2800);
            }

            // ===== COUNTDOWN TIMER =====
            var countdownDays = document.getElementById('countdownDays');
            var countdownHours = document.getElementById('countdownHours');
            var countdownMinutes = document.getElementById('countdownMinutes');
            var countdownSeconds = document.getElementById('countdownSeconds');

            if (countdownDays && countdownHours && countdownMinutes && countdownSeconds) {
                var targetDate = parseDate(specialDate);

                function updateCountdown() {
                    var now = new Date();
                    var distance = targetDate - now;
                    
                    if (distance <= 0) {
                        countdownDays.textContent = '🎉';
                        countdownHours.textContent = '🎉';
                        countdownMinutes.textContent = '🎉';
                        countdownSeconds.textContent = '🎉';
                        return;
                    }
                    
                    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    
                    countdownDays.textContent = String(days).padStart(2, '0');
                    countdownHours.textContent = String(hours).padStart(2, '0');
                    countdownMinutes.textContent = String(minutes).padStart(2, '0');
                    countdownSeconds.textContent = String(seconds).padStart(2, '0');
                }

                updateCountdown();
                setInterval(updateCountdown, 1000);
            }

            var heartCount = 0;
            var heartBtn = document.getElementById('heartBtn');
            var heartCountEl = document.getElementById('heartCount');
            if (heartBtn && heartCountEl) {
                heartBtn.addEventListener('click', function(e) {
                    heartCount++;
                    heartCountEl.textContent = heartCount;
                    var rect = this.getBoundingClientRect();
                    var heart = document.createElement('div');
                    heart.textContent = '❤️';
                    heart.style.position = 'fixed';
                    heart.style.fontSize = (24 + Math.random() * 30) + 'px';
                    heart.style.left = (rect.left + rect.width / 2 - 20 + (Math.random() - 0.5) * 40) + 'px';
                    heart.style.top = (rect.top - 10) + 'px';
                    heart.style.pointerEvents = 'none';
                    heart.style.zIndex = '999';
                    heart.style.transition = 'all 1.5s cubic-bezier(0.2, 0.8, 0.4, 1)';
                    heart.style.opacity = '1';
                    document.body.appendChild(heart);
                    setTimeout(function() {
                        heart.style.transform =
                            'translateY(-' + (120 + Math.random() * 180) + 'px) scale(1.8) rotate(' + (Math
                            .random() * 360) + 'deg)';
                        heart.style.opacity = '0';
                    }, 50);
                    setTimeout(function() {
                        heart.remove();
                    }, 1600);
                    this.querySelector('.heart-emoji-big').style.transform = 'scale(1.4)';
                    setTimeout(function() {
                        heartBtn.querySelector('.heart-emoji-big').style.transform = 'scale(1)';
                    }, 200);
                });
            }

            // ===== FIXED MODAL - PERFECT CENTER =====
            var modal = document.getElementById('loveLetterModal');
            var openBtn = document.getElementById('loveLetterBtn');
            var closeBtn = document.getElementById('modalClose');

            function openModal() {
                if (modal) {
                    // First scroll to top of page
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                    
                    // Then show modal after a short delay
                    setTimeout(function() {
                        modal.classList.add('active');
                        document.body.style.overflow = 'hidden';
                        
                        // Reset modal scroll to top
                        var modalContent = modal.querySelector('.modal-content');
                        if (modalContent) {
                            modalContent.scrollTop = 0;
                        }
                    }, 350);
                }
            }

            function closeModal() {
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }

            if (openBtn && modal) {
                openBtn.addEventListener('click', openModal);
            }
            if (closeBtn && modal) {
                closeBtn.addEventListener('click', closeModal);
            }
            if (modal) {
                modal.addEventListener('click', function(e) {
                    if (e.target === this) {
                        closeModal();
                    }
                });
                document.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape' && modal.classList.contains('active')) {
                        closeModal();
                    }
                });
            }

            var musicToggle = document.getElementById('musicToggle');
            var bgMusic = document.getElementById('bgMusic');
            var isMusicPlaying = false;

            if (musicToggle && bgMusic) {
                bgMusic.volume = 0.3;
                bgMusic.addEventListener('play', function() {
                    musicToggle.textContent = '🔊';
                    musicToggle.classList.add('playing');
                    isMusicPlaying = true;
                });
                bgMusic.addEventListener('pause', function() {
                    if (isMusicPlaying) {
                        musicToggle.textContent = '🎵';
                        musicToggle.classList.remove('playing');
                        isMusicPlaying = false;
                    }
                });
                musicToggle.addEventListener('click', function() {
                    if (isMusicPlaying) {
                        bgMusic.pause();
                        this.textContent = '🎵';
                        this.classList.remove('playing');
                        isMusicPlaying = false;
                    } else {
                        bgMusic.play().then(function() {
                            musicToggle.textContent = '🔊';
                            musicToggle.classList.add('playing');
                            isMusicPlaying = true;
                        }).catch(function() {});
                    }
                });
            }

            window.addEventListener('beforeunload', function() {
                document.body.style.overflow = '';
            });

        })();