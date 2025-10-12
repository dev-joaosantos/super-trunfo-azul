document.addEventListener('DOMContentLoaded', function () {

    // sensor for animation scroll
    const observer = new IntersectionObserver((entries, observer) => { // CORREÇÃO 1: A arrow function (=>) vem aqui dentro
        
        entries.forEach(entry => {
            
            if (entry.isIntersecting) {
                entry.target.classList.add('animation-transform');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    }); 

    const elementsToAnimateRight = document.querySelectorAll('.article-right');

    elementsToAnimateRight.forEach(element => {
        observer.observe(element);
    });

    const elementsToAnimateLeft = document.querySelectorAll('.article-left');

    elementsToAnimateLeft.forEach(element => {
        observer.observe(element);
    });

    const elementsToAnimateDeveloper = document.querySelectorAll('.developer-animation');

    elementsToAnimateDeveloper.forEach(element => {
        observer.observe(element);
    });
});
