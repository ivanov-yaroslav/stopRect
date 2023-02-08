(() => {
    "use strict";
    const modules_flsModules = {};
    let bodyLockStatus = true;
    let bodyUnlock = (delay = 500) => {
        let body = document.querySelector("body");
        if (bodyLockStatus) {
            let lock_padding = document.querySelectorAll("[data-lp]");
            setTimeout((() => {
                for (let index = 0; index < lock_padding.length; index++) {
                    const el = lock_padding[index];
                    el.style.paddingRight = "0px";
                }
                body.style.paddingRight = "0px";
                document.documentElement.classList.remove("lock");
            }), delay);
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };
    function functions_menuClose() {
        bodyUnlock();
        document.documentElement.classList.remove("menu-open");
    }
    function FLS(message) {
        setTimeout((() => {
            if (window.FLS) console.log(message);
        }), 0);
    }
    let gotoblock_gotoBlock = (targetBlock, noHeader = false, speed = 500, offsetTop = 0) => {
        const targetBlockElement = document.querySelector(targetBlock);
        if (targetBlockElement) {
            let headerItem = "";
            let headerItemHeight = 0;
            if (noHeader) {
                headerItem = "header.header";
                const headerElement = document.querySelector(headerItem);
                if (!headerElement.classList.contains("_header-scroll")) {
                    headerElement.style.cssText = `transition-duration: 0s;`;
                    headerElement.classList.add("_header-scroll");
                    headerItemHeight = headerElement.offsetHeight;
                    headerElement.classList.remove("_header-scroll");
                    setTimeout((() => {
                        headerElement.style.cssText = ``;
                    }), 0);
                } else headerItemHeight = headerElement.offsetHeight;
            }
            let options = {
                speedAsDuration: true,
                speed,
                header: headerItem,
                offset: offsetTop,
                easing: "easeOutQuad"
            };
            document.documentElement.classList.contains("menu-open") ? functions_menuClose() : null;
            if ("undefined" !== typeof SmoothScroll) (new SmoothScroll).animateScroll(targetBlockElement, "", options); else {
                let targetBlockElementPosition = targetBlockElement.getBoundingClientRect().top + scrollY;
                targetBlockElementPosition = headerItemHeight ? targetBlockElementPosition - headerItemHeight : targetBlockElementPosition;
                targetBlockElementPosition = offsetTop ? targetBlockElementPosition - offsetTop : targetBlockElementPosition;
                window.scrollTo({
                    top: targetBlockElementPosition,
                    behavior: "smooth"
                });
            }
            FLS(`[gotoBlock]: Юхуу...їдемо до ${targetBlock}`);
        } else FLS(`[gotoBlock]: Йой... Такого блоку немає на сторінці: ${targetBlock}`);
    };
    function formFieldsInit(options = {
        viewPass: false,
        autoHeight: false
    }) {
        document.body.addEventListener("focusin", (function(e) {
            const targetElement = e.target;
            if ("INPUT" === targetElement.tagName || "TEXTAREA" === targetElement.tagName) {
                if (!targetElement.hasAttribute("data-no-focus-classes")) {
                    targetElement.classList.add("_form-focus");
                    targetElement.parentElement.classList.add("_form-focus");
                }
                targetElement.hasAttribute("data-validate") ? formValidate.removeError(targetElement) : null;
            }
        }));
        document.body.addEventListener("focusout", (function(e) {
            const targetElement = e.target;
            if ("INPUT" === targetElement.tagName || "TEXTAREA" === targetElement.tagName) {
                if (!targetElement.hasAttribute("data-no-focus-classes")) {
                    targetElement.classList.remove("_form-focus");
                    targetElement.parentElement.classList.remove("_form-focus");
                }
                targetElement.hasAttribute("data-validate") ? formValidate.validateInput(targetElement) : null;
            }
        }));
        if (options.viewPass) document.addEventListener("click", (function(e) {
            let targetElement = e.target;
            if (targetElement.closest('[class*="__viewpass"]')) {
                let inputType = targetElement.classList.contains("_viewpass-active") ? "password" : "text";
                targetElement.parentElement.querySelector("input").setAttribute("type", inputType);
                targetElement.classList.toggle("_viewpass-active");
            }
        }));
        if (options.autoHeight) {
            const textareas = document.querySelectorAll("textarea[data-autoheight]");
            if (textareas.length) {
                textareas.forEach((textarea => {
                    const startHeight = textarea.hasAttribute("data-autoheight-min") ? Number(textarea.dataset.autoheightMin) : Number(textarea.offsetHeight);
                    const maxHeight = textarea.hasAttribute("data-autoheight-max") ? Number(textarea.dataset.autoheightMax) : 1 / 0;
                    setHeight(textarea, Math.min(startHeight, maxHeight));
                    textarea.addEventListener("input", (() => {
                        if (textarea.scrollHeight > startHeight) {
                            textarea.style.height = `auto`;
                            setHeight(textarea, Math.min(Math.max(textarea.scrollHeight, startHeight), maxHeight));
                        }
                    }));
                }));
                function setHeight(textarea, height) {
                    textarea.style.height = `${height}px`;
                }
            }
        }
    }
    let formValidate = {
        getErrors(form) {
            let error = 0;
            let formRequiredItems = form.querySelectorAll("*[data-required]");
            let formRequiredItemsPass = form.querySelectorAll('[data-required="pass"]');
            if (formRequiredItems.length) formRequiredItems.forEach((formRequiredItem => {
                if ((null !== formRequiredItem.offsetParent || "SELECT" === formRequiredItem.tagName) && !formRequiredItem.disabled && "pass" !== formRequiredItem.dataset.required && "promo" !== formRequiredItem.dataset.required) error += this.validateInput(formRequiredItem);
            }));
            if (formRequiredItemsPass.length) {
                const pass1 = form.querySelector("#pass1");
                const pass2 = form.querySelector("#pass2");
                if (pass1 && pass2) if (pass1.value !== pass2.value) {
                    this.removeError(pass1);
                    this.addError(pass2);
                    error++;
                } else if (!pass1.value.trim() && !pass2.value.trim()) {
                    this.addError(pass1);
                    error++;
                } else {
                    this.removeError(pass1);
                    this.removeError(pass2);
                }
            }
            return error;
        },
        validateInput(formRequiredItem) {
            let error = 0;
            if ("email" === formRequiredItem.dataset.required) {
                formRequiredItem.value = formRequiredItem.value.replace(" ", "");
                if (this.emailTest(formRequiredItem)) {
                    this.addError(formRequiredItem);
                    error++;
                } else this.removeError(formRequiredItem);
            } else if ("checkbox" === formRequiredItem.type && !formRequiredItem.checked) {
                this.addError(formRequiredItem);
                error++;
            } else if (!formRequiredItem.value.trim()) {
                this.addError(formRequiredItem);
                error++;
            } else this.removeError(formRequiredItem);
            return error;
        },
        addError(formRequiredItem) {
            formRequiredItem.classList.add("_form-error");
            formRequiredItem.parentElement.classList.add("_form-error");
            let inputError = formRequiredItem.parentElement.querySelector(".form__error");
            if (inputError) formRequiredItem.parentElement.removeChild(inputError);
            if (formRequiredItem.dataset.error) formRequiredItem.parentElement.insertAdjacentHTML("beforeend", `<div class="form__error">${formRequiredItem.dataset.error}</div>`);
        },
        removeError(formRequiredItem) {
            formRequiredItem.classList.remove("_form-error");
            formRequiredItem.parentElement.classList.remove("_form-error");
            if (formRequiredItem.parentElement.querySelector(".form__error")) formRequiredItem.parentElement.removeChild(formRequiredItem.parentElement.querySelector(".form__error"));
        },
        formClean(form) {
            form.reset();
            setTimeout((() => {
                let inputs = form.querySelectorAll("input,textarea");
                for (let index = 0; index < inputs.length; index++) {
                    const el = inputs[index];
                    el.parentElement.classList.remove("_form-focus");
                    el.classList.remove("_form-focus");
                    formValidate.removeError(el);
                }
                let checkboxes = form.querySelectorAll(".checkbox__input");
                if (checkboxes.length > 0) for (let index = 0; index < checkboxes.length; index++) {
                    const checkbox = checkboxes[index];
                    checkbox.checked = false;
                }
                if (modules_flsModules.select) {
                    let selects = form.querySelectorAll(".select");
                    if (selects.length) for (let index = 0; index < selects.length; index++) {
                        const select = selects[index].querySelector("select");
                        modules_flsModules.select.selectBuild(select);
                    }
                }
            }), 0);
        },
        emailTest(formRequiredItem) {
            return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(formRequiredItem.value);
        }
    };
    function formSubmit() {
        const forms = document.forms;
        if (forms.length) for (const form of forms) {
            form.addEventListener("submit", (function(e) {
                const form = e.target;
                formSubmitAction(form, e);
            }));
            form.addEventListener("reset", (function(e) {
                const form = e.target;
                formValidate.formClean(form);
            }));
        }
        async function formSubmitAction(form, e) {
            const error = !form.hasAttribute("data-no-validate") ? formValidate.getErrors(form) : 0;
            if (0 === error) {
                const ajax = form.hasAttribute("data-ajax");
                if (ajax) {
                    e.preventDefault();
                    const formAction = form.getAttribute("action") ? form.getAttribute("action").trim() : "#";
                    const formMethod = form.getAttribute("method") ? form.getAttribute("method").trim() : "GET";
                    const formData = new FormData(form);
                    form.classList.add("_sending");
                    const response = await fetch(formAction, {
                        method: formMethod,
                        body: formData
                    });
                    if (response.ok) {
                        let responseResult = await response.json();
                        form.classList.remove("_sending");
                        formSent(form, responseResult);
                    } else {
                        alert("Помилка");
                        form.classList.remove("_sending");
                    }
                } else if (form.hasAttribute("data-dev")) {
                    e.preventDefault();
                    formSent(form);
                }
            } else {
                e.preventDefault();
                if (form.querySelector("._form-error") && form.hasAttribute("data-goto-error")) {
                    const formGoToErrorClass = form.dataset.gotoError ? form.dataset.gotoError : "._form-error";
                    gotoblock_gotoBlock(formGoToErrorClass, true, 1e3);
                }
            }
        }
        function formSent(form, responseResult = ``) {
            document.dispatchEvent(new CustomEvent("formSent", {
                detail: {
                    form
                }
            }));
            setTimeout((() => {
                if (modules_flsModules.popup) {
                    const popup = form.dataset.popupMessage;
                    popup ? modules_flsModules.popup.open(popup) : null;
                }
            }), 0);
            formValidate.formClean(form);
            formLogging(`Форму відправлено!`);
        }
        function formLogging(message) {
            FLS(`[Форми]: ${message}`);
        }
    }
    let addWindowScrollEvent = false;
    setTimeout((() => {
        if (addWindowScrollEvent) {
            let windowScroll = new Event("windowScroll");
            window.addEventListener("scroll", (function(e) {
                document.dispatchEvent(windowScroll);
            }));
        }
    }), 0);
    const promo = document.querySelector(".promocode");
    if (promo) {
        const promoButton = promo.querySelector(".promocode__button");
        const promoInput = promo.querySelector(".promocode__input");
        promo.addEventListener("click", (e => {
            const target = e.target;
            if (target === promoButton) if (promoInput && promoInput.value.length && !promoInput.classList.contains("_form-error")) formValidate.addError(promoInput); else if (!promoInput.value) formValidate.removeError(promoInput);
        }));
    }
    window["FLS"] = true;
    formFieldsInit({
        viewPass: false,
        autoHeight: false
    });
    formSubmit();
    
    
    //
    
    const myPassMeter = passwordStrengthMeter({
    containerElement: '#pswmeter',
    passwordInput: '#pass1',
    borderRadius: 3,
    height: 5,
    pswMinLength: 7,
});

passMessage();

function passMessage() {
    const myInput = document.getElementById('pass1');
    const myInput2 = document.getElementById('pass2');
    const submitButton = document.getElementById('button-submit');
    const letter = document.getElementById('letter');
    const number = document.getElementById('number');
    const length = document.getElementById('length');

    // When the user clicks on the password field, show the message box
    myInput.addEventListener('focusin', e => {
        document.querySelector('.pass-message').classList.add('show-message');
    });

    // When the user clicks outside of the password field, hide the message box
    myInput.addEventListener('focusout', e => {
        document.querySelector('.pass-message').classList.remove('show-message');
        const test = /(?=.*\d)(?=.*[a-z]).{7,}/g;

        if (
            !myInput.value.match(test) &&
            !myInput.classList.contains('_form-error') &&
            myInput.value.length
        ) {
            addError(myInput, 'Not all conditions are met!');
        }
    });

    myInput2.addEventListener('focusout', e => {});

    myInput2.addEventListener('input', e => {
        confirmPassword();
    });

    // When the user starts to type something inside the password field

    myInput.addEventListener('input', e => {
        const spaces = /\s/g;
        confirmPassword();

        if (myInput.value.match(spaces)) {
            addError(myInput, 'This symbol is not allowed!');
            return;
        } else if (myInput.classList.contains('_form-error')) {
            removeError(myInput);
        }

        const lowerCaseLetters = /[a-z]/g;
        if (myInput.value.match(lowerCaseLetters)) {
            letter.classList.remove('invalid');
            letter.classList.add('valid');
        } else {
            letter.classList.remove('valid');
            letter.classList.add('invalid');
        }

        // Validate numbers
        const numbers = /[0-9]/g;
        if (myInput.value.match(numbers)) {
            number.classList.remove('invalid');
            number.classList.add('valid');
        } else {
            number.classList.remove('valid');
            number.classList.add('invalid');
        }

        // Validate length
        if (myInput.value.length >= 7) {
            length.classList.remove('invalid');
            length.classList.add('valid');
        } else {
            length.classList.remove('valid');
            length.classList.add('invalid');
        }
    });

    function confirmPassword() {
        const test = /(?=.*\d)(?=.*[a-z]).{7,}/g;
        if (
            myInput.value.match(test) &&
            !myInput.value.match(/\s/g) &&
            myInput.value === myInput2.value
        ) {
            submitButton.removeAttribute('disabled');
            removeError(myInput2);
        } else {
            submitButton.setAttribute('disabled', true);
            if (myInput2.value.length) {
                addError(myInput2, 'Passwords must be the same and meet the requirements!');
            } else {
                removeError(myInput2);
            }
        }
    }
}

function addError(formRequiredItem, message) {
    formRequiredItem.classList.add('_form-error');
    formRequiredItem.parentElement.classList.add('_form-error');
    let inputError = formRequiredItem.parentElement.querySelector('.form__error');
    if (inputError) formRequiredItem.parentElement.removeChild(inputError);
    if (message) {
        formRequiredItem.parentElement.insertAdjacentHTML(
            'beforeend',
            `<div class="form__error">${message}</div>`
        );
    }
}
function removeError(formRequiredItem) {
    formRequiredItem.classList.remove('_form-error');
    formRequiredItem.parentElement.classList.remove('_form-error');
    if (formRequiredItem.parentElement.querySelector('.form__error')) {
        formRequiredItem.parentElement.removeChild(
            formRequiredItem.parentElement.querySelector('.form__error')
        );
    }
}

function passwordStrengthMeter(a) {
    function b() {
        let a = c();
        d(a);
    }
    function c() {
        let a = 0,
            b = /(?=.*[a-z])/,
            c = /(?=.*[0-9])/,
            d = new RegExp('(?=.{' + j + ',})');
        return (
            i.match(b) && ++a,
            i.match(c) && ++a,
            i.match(d) && ++a,
            0 == a && 0 < i.length && ++a,
            a
        );
    }
    function d(a) {
        1 === a
            ? ((g.className = 'password-strength-meter-score psms-25'),
              k && (k.textContent = l[1] || 'Too simple'),
              f.dispatchEvent(new Event('onScore1', { bubbles: !0 })))
            : 2 === a
            ? ((g.className = 'password-strength-meter-score psms-50'),
              k && (k.textContent = l[2] || 'Simple'),
              f.dispatchEvent(new Event('onScore2', { bubbles: !0 })))
            : 3 === a
            ? ((g.className = 'password-strength-meter-score psms-75'),
              k && (k.textContent = l[3] || "That's OK"),
              f.dispatchEvent(new Event('onScore3', { bubbles: !0 })))
            : ((g.className = 'password-strength-meter-score'),
              k && (k.textContent = l[0] || 'No data'),
              f.dispatchEvent(new Event('onScore0', { bubbles: !0 })));
    }
    const e = document.createElement('style');
    document.body.prepend(e),
        (e.innerHTML = `
    ${a.containerElement} {
      height: ${a.height || 4}px;
      background-color: #eee;
      position: relative;
      overflow: hidden;
      border-radius: ${a.borderRadius.toString() || 2}px;
    }
    ${a.containerElement} .password-strength-meter-score {
      height: inherit;
      width: 0%;
      transition: .3s ease-in-out;
      background: ${a.colorScore1 || '#ff7700'};
    }
    ${a.containerElement} .password-strength-meter-score.psms-25 {width: 33%; background: ${
            a.colorScore1 || '#ff7700'
        };}
    ${a.containerElement} .password-strength-meter-score.psms-50 {width: 66%; background: ${
            a.colorScore2 || '#ffff00'
        };}
    ${a.containerElement} .password-strength-meter-score.psms-75 {width: 100%; background: ${
            a.colorScore4 || '#00ff00'
        };}`);
    const f = document.getElementById(a.containerElement.slice(1));
    f.classList.add('password-strength-meter');
    let g = document.createElement('div');
    g.classList.add('password-strength-meter-score'), f.appendChild(g);
    const h = document.getElementById(a.passwordInput.slice(1));
    let i = '';
    h.addEventListener('keyup', function () {
        const spaces = /\s/g;
        if (this.value.match(spaces)) {
            return;
        }
        (i = this.value), b();
    });
    let j = a.pswMinLength || 8,
        k = a.showMessage ? document.getElementById(a.messageContainer.slice(1)) : null,
        l =
            void 0 === a.messagesList
                ? ['No data', 'Too simple', 'Simple', "That's OK", 'Great password!']
                : a.messagesList;
    return k && (k.textContent = l[0] || 'No data'), { containerElement: f, getScore: c };
}
})();
(() => {
    const timer = document.querySelector('[data-timer]');

    if (timer) {
        const deadline = timer.dataset.timer;
        setClock();

        function getTimeRemainig(andTime) {
            const t = Date.parse(andTime) - new Date();
            const days = Math.floor(t / (1000 * 60 * 60 * 24));
            const hours = Math.floor((t / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((t / (1000 * 60)) % 60);
            const seconds = Math.floor((t / 1000) % 60);

            return {
                total: t,
                days,
                hours,
                minutes,
                seconds,
            };
        }

        function getZero(num) {
            if (num < 10) {
                return `0${num}`;
            } else return num;
        }

        function setClock() {
            const days = timer.querySelector('#days');
            const hours = timer.querySelector('#hours');
            const minutes = timer.querySelector('#minutes');
            const seconds = timer.querySelector('#seconds');
            const timeInterval = setInterval(updateClock, 1000);

            updateClock();

            function updateClock() {
                const t = getTimeRemainig(deadline);

                days.innerHTML = getZero(t.days);
                hours.innerHTML = getZero(t.hours);
                minutes.innerHTML = getZero(t.minutes);
                seconds.innerHTML = getZero(t.seconds);
                if (t.total <= 0) {
                    clearInterval(timeInterval);

                    days.innerHTML = 0;
                    hours.innerHTML = 0;
                    minutes.innerHTML = 0;
                    seconds.innerHTML = 0;
                }
            }
        }
    }
})();
