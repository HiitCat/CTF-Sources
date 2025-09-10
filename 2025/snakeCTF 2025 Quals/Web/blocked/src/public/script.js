document.addEventListener('DOMContentLoaded', () => {
    const bgImage = document.getElementById('captcha-bg');
    const fgImage = document.getElementById('captcha-fg');
    const slider = document.getElementById('slider');
    const solutionInput = document.getElementById('solution-input');
    const submitBtn = document.getElementById('submit-btn');
    const resultMessage = document.getElementById('result-message');
    const captchaCountDisplay = document.getElementById('remaining-captchas');

    let maxSlide = 0;
    let currentCaptchaId = null;

    async function loadCaptcha() {
        solutionInput.value = '';
        slider.value = 0;
        submitBtn.disabled = false;
        solutionInput.disabled = false;

        try {
            const response = await fetch('/api/captcha');
            if (!response.ok) throw new Error('Failed to load captcha');
            const data = await response.json();

            currentCaptchaId = data.captchaId;
            fgImage.src = data.foreground;
            bgImage.src = data.background;

            maxSlide = 900 - 500;
            slider.max = maxSlide;
            bgImage.style.left = `0px`;

            resultMessage.textContent = '';

        } catch (error) {
            resultMessage.textContent = error.message;
            resultMessage.style.color = 'red';
        }
    }

    slider.addEventListener('input', () => {
        bgImage.style.left = `-${slider.value}px`;
    });

    submitBtn.addEventListener('click', async () => {
        const solution = solutionInput.value;
        if (!solution) {
            resultMessage.textContent = 'Please enter a solution.';
            resultMessage.style.color = 'orange';
            return;
        }

        if (!currentCaptchaId) {
            resultMessage.textContent = 'No captcha loaded. Please refresh.';
            resultMessage.style.color = 'red';
            return;
        }

        try {
            const response = await fetch('/api/solve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ captchaId: currentCaptchaId, solution })
            });

            const data = await response.json();

            resultMessage.textContent = data.message;
            if (data.success) {
                resultMessage.style.color = 'green';
                submitBtn.disabled = true;
                solutionInput.disabled = true;
                captchaCountDisplay.textContent = data.currentCount;

                if (data.currentCount >= 10) {
                    resultMessage.textContent += ' Redirecting to protected page...';
                    setTimeout(() => {
                        window.location.href = '/protected';
                    }, 1000);
                } else {
                    
                    setTimeout(loadCaptcha, 1000);
                }
            } else {
                loadCaptcha();
                resultMessage.style.color = 'red';
            }
        } catch (error) {
            console.error("Error:", error);
            resultMessage.textContent = 'An error occurred.';
            resultMessage.style.color = 'red';
        }
    });

    loadCaptcha();
});