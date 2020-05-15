document.addEventListener('DOMContentLoaded', function() {
    let elems = {
        button: {
            openModal: '#btnOpenModal',
            menu: '#burger'
        },
        modal: {
            id: '#modalBlock',
            close: '#closeModal',
            question: '#question',
            answers: '#formAnswers'
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
                playTest();
            },
            hide: () => {
                elems.button.menu.classList.remove('active');
                elems.modal.id.classList.remove('d-block');
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
        elems.modal.close.addEventListener('click', handle.dialog.hide);
        elems.modal.id.addEventListener('click', handle.dialog.outside);

        handle.window.width();
    }

    const playTest = () => {
        const renderQuestions = () => {
            elems.modal.question.textContent = 'Какого цвета бургер вы хотите?';

            const type = 'radio';
            const data = [
                { id: 'answerItem1', text: 'Стандарт', img: './image/burger.png', class: 'flex-column' },
                { id: 'answerItem2', text: 'Черный', img: './image/burgerBlack.png', class: 'justify-content-center' }
            ];

            elems.modal.answers.innerHTML = '';
            data.forEach(row => {
                const elem = document.createElement('div');
                elem.classList.add('answers-item');
                elem.classList.add('d-flex');
                elem.classList.add(row.class);
                elem.innerHTML = `
                    <input type="${type}" id="${row.id}" name="answer" class="d-none">
                    <label for="${row.id}" class="d-flex flex-column justify-content-between">
                        <img class="answerImg" src="${row.img}" alt="burger">
                        <span>${row.text}</span>
                    </label>
                `;
                elems.modal.answers.appendChild(elem);
            });
        }
        renderQuestions();
    }

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

    init();
});
