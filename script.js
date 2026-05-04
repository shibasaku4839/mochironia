window.addEventListener("load", () => {
    // =========================
    // 設定
    // =========================

    const imageCount = 35;

    // 白目サイズ（100〜200）
    const minEyeWidth = 100;
    const maxEyeWidth = 200;

    // 黒目サイズ（白目に対する割合）
    const pupilMinRatio = 0.42;
    const pupilMaxRatio = 0.58;

    // 黒目の動ける範囲
    // 小さくするとあまり動かない
    // 大きくすると端まで動く
    const moveRangeXRatio = 0.22;
    const moveRangeYRatio = 0.10;

    // カーソルへの吸いつき
    const attractionRange = 1200;
    const attractionPower = 0.18; // 小さいほど吸いつき強い

    const originalFrame = document.getElementById("shirome");
    const originalPupil = document.getElementById("kurome");

    const frameAspect = originalFrame.naturalHeight / originalFrame.naturalWidth;

    const placedEyes = [];

    function getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }

    function isOverlapping(newX, newY, newWidth, newHeight) {
        for (let i = 0; i < placedEyes.length; i++) {
            const placed = placedEyes[i];

            const newCenterX = newX + newWidth / 2;
            const newCenterY = newY + newHeight / 2;

            const placedCenterX = placed.x + placed.width / 2;
            const placedCenterY = placed.y + placed.height / 2;

            const dx = newCenterX - placedCenterX;
            const dy = newCenterY - placedCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const minDistance = (newWidth + placed.width) * 0.33;

            if (distance < minDistance) {
                return true;
            }
        }
        return false;
    }

    // =========================
    // 目を生成
    // =========================

    for (let i = 0; i < imageCount; i++) {
        const eyeWidth = getRandom(minEyeWidth, maxEyeWidth);
        const eyeHeight = eyeWidth * frameAspect;

        const eye = document.createElement("div");
        eye.classList.add("eye");
        eye.style.width = `${eyeWidth}px`;
        eye.style.height = `${eyeHeight}px`;

        // 白目
        const frame = originalFrame.cloneNode(true);
        frame.removeAttribute("id");
        frame.className = "eye-frame";

        // 黒目を表示する範囲
        const pupilClip = document.createElement("div");
        pupilClip.classList.add("pupil-clip");

        // 黒目を動かす箱
        const pupilWrap = document.createElement("div");
        pupilWrap.classList.add("pupil-wrap");

        const pupilRatio = getRandom(pupilMinRatio, pupilMaxRatio);
        const pupilSize = eyeWidth * pupilRatio;

        pupilWrap.style.width = `${pupilSize}px`;
        pupilWrap.style.height = `${pupilSize}px`;

        const pupil = originalPupil.cloneNode(true);
        pupil.removeAttribute("id");
        pupil.className = "eye-mid";

        pupilWrap.appendChild(pupil);
        pupilClip.appendChild(pupilWrap);

        // 追加順
        eye.appendChild(frame);
        eye.appendChild(pupilClip);

        // 画面からはみ出してもOK
        const minX = -eyeWidth * 0.5;
        const maxX = window.innerWidth - eyeWidth * 0.5;
        const minY = -eyeHeight * 0.5;
        const maxY = window.innerHeight - eyeHeight * 0.5;

        let randomX;
        let randomY;
        let attempts = 0;

        do {
            randomX = getRandom(minX, maxX);
            randomY = getRandom(minY, maxY);
            attempts++;
        } while (isOverlapping(randomX, randomY, eyeWidth, eyeHeight) && attempts < 300);

        placedEyes.push({
            x: randomX,
            y: randomY,
            width: eyeWidth,
            height: eyeHeight
        });

        const randomRotation = getRandom(0, 360);

        eye.style.left = `${randomX}px`;
        eye.style.top = `${randomY}px`;
        eye.style.transform = `rotate(${randomRotation}deg)`;
        eye.dataset.rotation = randomRotation;

        document.body.appendChild(eye);
    }

    // =========================
    // マウスに吸い寄せる
    // =========================

    document.addEventListener("mousemove", (event) => {
        const eyes = document.querySelectorAll(".eye");

        eyes.forEach((eye) => {
            const pupilWrap = eye.querySelector(".pupil-wrap");
            const rect = eye.getBoundingClientRect();

            const eyeCenterX = rect.left + rect.width / 2;
            const eyeCenterY = rect.top + rect.height / 2;

            const dx = event.clientX - eyeCenterX;
            const dy = event.clientY - eyeCenterY;

            const distance = Math.sqrt(dx * dx + dy * dy);

            let strength = Math.max(0, 1 - distance / attractionRange);
            strength = Math.pow(strength, attractionPower);

            // 目の回転を考慮してローカル座標に変換
            const rotation = Number(eye.dataset.rotation);
            const rad = -rotation * Math.PI / 180;

            const localX = dx * Math.cos(rad) - dy * Math.sin(rad);
            const localY = dx * Math.sin(rad) + dy * Math.cos(rad);

            const angle = Math.atan2(localY, localX);

            const maxMoveX = rect.width * moveRangeXRatio;
            const maxMoveY = rect.height * moveRangeYRatio;

            const moveX = Math.cos(angle) * maxMoveX * strength;
            const moveY = Math.sin(angle) * maxMoveY * strength;

            pupilWrap.style.transform =
                `translate(-50%, -50%) translate(${moveX}px, ${moveY}px)`;
        });
    });
});