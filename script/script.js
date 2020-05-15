document.addEventListener('DOMContentLoaded', function() {
    const btnOpenModal = document.getElementById('btnOpenModal');
    const modalBlock = document.getElementById('modalBlock');
    const closeModal = document.getElementById('closeModal');
    const questionTitle = document.getElementById('question');
    const formAnswers = document.getElementById('formAnswers');

    btnOpenModal.addEventListener('click', () => {
        modalBlock.classList.add('d-block');
        playTest();
    });

    closeModal.addEventListener('click', () => {
        modalBlock.classList.remove('d-block');
    });

    const playTest = () => {
        const renderQuestions = () => {
            questionTitle.textContent = 'Какого цвета бургер вы хотите?';
            const type = 'radio';
            const data = [
                { id: 'answerItem1', text: 'Стандарт', img: './image/burger.png', class: 'flex-column' },
                { id: 'answerItem2', text: 'Черный', img: './image/burgerBlack.png', class: 'justify-content-center' }
            ];

            formAnswers.innerHTML = '';
            data.forEach(row => {
                const elem = document.createElement('div');
                elem.classList.add('answers-item');
                elem.classList.add('d-flex');
                elem.classList.add(row.class);
                elem.innerHTML = `
                    <input type="radio" id="${row.id}" name="answer" class="d-none">
                    <label for="${row.id}" class="d-flex flex-column justify-content-between">
                        <img class="answerImg" src="${row.img}" alt="burger">
                        <span>${row.text}</span>
                    </label>
                `;
                formAnswers.appendChild(elem);
            });
        }
        renderQuestions();
    }
});