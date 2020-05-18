document.addEventListener('DOMContentLoaded', function() {
    let questions = [];
    let result = [];
    let idx;

    // All HTML elements from index.html file for manipulation
    let elems = {
        button: {
            openModal: '#btnOpenModal',
            menu: '#burger'
        },
        modal: {
            id: '#modalBlock',
            form: {
                id: '#formAnswers',
                question: '#question',
                answers: '#formAnswers',
            },
            button: {
                close: '#closeModal',
                previous: '#prev',
                next: '#next',
                send: '#send'
            }
        }
    };
    elems = applySelector(elems); // transform string CSS selectors to HTML elements

    // All handlers, which will be used in program
    const handle = {
        window: {
            width: () => {
                let clientWidth = document.documentElement.clientWidth;
                elems.button.menu.style.display = clientWidth > 768 ? 'none' : 'flex';
            }
        },
        dialog: {
            show: () => {
                idx = -1;
                render(0);
                elems.button.menu.classList.add('active');
                elems.modal.id.classList.add('d-block');
            },
            hide: () => {
                saveResult();
                elems.button.menu.classList.remove('active');
                elems.modal.id.classList.remove('d-block');
            },
            previous: () => {
                saveResult();
                let id = Math.max(idx - 1, 0);
                render(id);
            },
            next: () => {
                saveResult();
                let id = Math.min(idx + 1, questions.length);
                render(id);
            },
            send: () => {
                saveResult();
                saveAnswerToFirebase(result);
                render(idx + 1);
                setTimeout(() => {
                    elems.button.menu.classList.remove('active');
                    elems.modal.id.classList.remove('d-block');
                    result = [];
                }, 5000);
            },
            outside: (event) => {
                if (event.target === elems.modal.id) {
                    saveResult();
                    handle.dialog.hide();
                }
            }
        }
    }

    // Main procedure
    function init() {
        // Attach handlers to DOM elements
        window.addEventListener('resize', handle.window.width);
        elems.button.menu.addEventListener('click', handle.dialog.show);
        elems.button.openModal.addEventListener('click', handle.dialog.show);
        elems.modal.button.close.addEventListener('click', handle.dialog.hide);
        elems.modal.button.previous.addEventListener('click', handle.dialog.previous);
        elems.modal.button.next.addEventListener('click', handle.dialog.next);
        elems.modal.button.send.addEventListener('click', handle.dialog.send);
        elems.modal.id.addEventListener('click', handle.dialog.outside);

        // run one time window width calculation handler
        handle.window.width();

        // Asynchronous data reading from external file (load result in questions variable)
        //getData('questions.json').then((result) => questions = result.questions);

        initFirebase();
        loadFirebaseData().then(snap => questions = snap.val());
    }

    const saveResult = () => {
        const answer = [...elems.modal.form.id.elements]
            .filter((input) => input.checked || idx >= questions.length)
            .map((elem) => elem.value);

        result[idx] = {
            question: idx < questions.length ? questions[idx].question : 'User Info',
            answer: answer
        };
    };

    // Render dialog quiz window
    const render = (id) => {
        if (id === idx) {
            return; // Skip rendering, if dialog page wasn't changed
        }
        idx = id;

        if (idx < questions.length) {
            renderQuestion();
        } else if (idx === questions.length) {
            renderClientInfo();
        } else {
            renderResult();
        }

        // Enable / Disable Prev / Next buttons. Depends on current page (idx)
        elems.modal.button.previous.disabled = idx <= 0;
        switch (true) {
            case idx < questions.length:
                elems.modal.button.next.classList.remove('d-none');
                elems.modal.button.send.classList.add('d-none');
                break;
            case idx === questions.length:
                elems.modal.button.next.classList.add('d-none');
                elems.modal.button.send.classList.remove('d-none');
                break;
            default:
                elems.modal.button.previous.classList.add('d-none');
                elems.modal.button.next.classList.add('d-none');
                elems.modal.button.send.classList.add('d-none');
                break;
        }

        function renderQuestion() {
            let q = questions[idx];
            // Poplate question in dialog
            elems.modal.form.question.textContent = q.question;

            // Populate answers in dialog
            elems.modal.form.answers.innerHTML = '';
            q.answers.forEach(row => {
                const elem = document.createElement('div');
                elem.classList.add('answers-item');
                elem.classList.add('d-flex');
                elem.classList.add(row.class);
                elem.innerHTML = `
                    <input type="${q.type}" id="${row.title}" name="answer" class="d-none" value="${row.title}"/>
                    <label for="${row.title}" class="d-flex flex-column justify-content-between">
                        <img class="answerImg" src="${row.url}" alt="burger">
                        <span>${row.title}</span>
                    </label>
                `;
                elems.modal.form.answers.appendChild(elem);
            });

            if (result[idx]) {
                result[idx].answer.forEach(value => {
                    document.getElementById(value).checked = true;
                })
            }
        }

        function renderClientInfo() {
            elems.modal.form.question.textContent = 'Client information';
            elems.modal.form.answers.innerHTML = `
                <div class="form-group">
                    <label for="phone">Enter your phone number</label>
                    <input id="phone" type="phone" class="form-control" />
                </div>
            `;
            const phone = document.getElementById('phone');
            phone.addEventListener('input', (event) => {
                event.target.value = event.target.value.replace(/[^0-9+-]/, '');
            });
            if (result[idx]) {
                result[idx].answer.forEach(value => {
                    phone.value = value;
                })
            }
        }
    };

    const renderResult = () => {
        elems.modal.form.question.textContent = 'Спасибо за ваш заказ!';
        elems.modal.form.answers.innerHTML = '';
    };

    // Transform CSS selectors to DOM elements
    function applySelector(obj) {
        function applyFunction(obj, fun, context) {
            let res = {};
            Object.keys(obj).forEach(function(key) {
                res[key] = typeof obj[key] === 'object' ?
                    applyFunction(obj[key], fun, context) :
                    fun.call(context, obj[key]);
            });
            return res;
        }

        return applyFunction(obj, document.querySelector, document);
    }

    // Reading data from file by url path
    async function getData(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Can\'t read data from ${url}. Status code: ${response.status}`);
        }
        return await response.json();
    }

    function initFirebase() {
        const firebaseConfig = {
            apiKey: "AIzaSyCWT_f_Qqtx4VU-aQh9RfIyJYWP2pYP_4M",
            authDomain: "burgers-quiz.firebaseapp.com",
            databaseURL: "https://burgers-quiz.firebaseio.com",
            projectId: "burgers-quiz",
            storageBucket: "burgers-quiz.appspot.com",
            messagingSenderId: "118992367328",
            appId: "1:118992367328:web:69848ee4acaf6f9be82a85"
        };
        firebase.initializeApp(firebaseConfig);
    }

    function loadFirebaseData() {
        return firebase.database().ref().child('questions').once('value');
    }

    function saveAnswerToFirebase(order) {
        firebase.database().ref().child('orders').push(order);
    }

    init();
});
