document.addEventListener('DOMContentLoaded', function() {
    let questions = [];
    let idx;

    let elems = {
        button: {
            openModal: '#btnOpenModal',
            menu: '#burger'
        },
        modal: {
            id: '#modalBlock',
            question: '#question',
            answers: '#formAnswers',
            button: {
                close: '#closeModal',
                previous: '#prev',
                next: '#next'
            }
        }
    };
    elems = applySelector(elems);

    const handle = {
        window: {
            width: () => {
                let clientWidth = document.documentElement.clientWidth;
                elems.button.menu.style.display = clientWidth > 768 ? 'none' : 'flex';
            }
        },
        dialog: {
            show: () => {
                elems.button.menu.classList.add('active');
                elems.modal.id.classList.add('d-block');
                idx = -1;
                render(0);
            },
            hide: () => {
                elems.button.menu.classList.remove('active');
                elems.modal.id.classList.remove('d-block');
            },
            previous: () => {
                let id = Math.max(idx - 1, 0);
                render(id);
            },
            next: () => {
                let id = Math.min(idx + 1, questions.length - 1);
                render(id);
            },
            outside: (event) => {
                if (event.target === elems.modal.id) {
                    handle.dialog.hide();
                }
            }
        }
    }

    function init() {
        window.addEventListener('resize', handle.window.width);
        elems.button.menu.addEventListener('click', handle.dialog.show);
        elems.button.openModal.addEventListener('click', handle.dialog.show);
        elems.modal.button.close.addEventListener('click', handle.dialog.hide);
        elems.modal.button.previous.addEventListener('click', handle.dialog.previous);
        elems.modal.button.next.addEventListener('click', handle.dialog.next);
        elems.modal.id.addEventListener('click', handle.dialog.outside);

        handle.window.width();

        getData('questions.json').then((result) => questions = result.questions);
    }

    const render = (id) => {
        if (id === idx) {
            return;
        }
        idx = id;

        let q = questions[idx];
        console.log('q: ', q);
        elems.modal.question.textContent = q.question;

        elems.modal.answers.innerHTML = '';
        q.answers.forEach(row => {
            const elem = document.createElement('div');
            elem.classList.add('answers-item');
            elem.classList.add('d-flex');
            elem.classList.add(row.class);
            elem.innerHTML = `
                <input type="${q.type}" id="${row.title}" name="answer" class="d-none" />
                <label for="${row.title}" class="d-flex flex-column justify-content-between">
                    <img class="answerImg" src="${row.url}" alt="burger">
                    <span>${row.title}</span>
                </label>
            `;
            elems.modal.answers.appendChild(elem);
        });
    };

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

    async function getData(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Can\'t read data from ${url}. Status code: ${response.status}`);
        }
        return await response.json();
    }

    init();
});
